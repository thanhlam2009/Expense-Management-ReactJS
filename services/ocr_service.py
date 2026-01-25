# -*- coding: utf-8 -*-
"""
OCR Service hỗ trợ cả OpenAI và Google Gemini để trích xuất thông tin từ hóa đơn
"""

import os
import base64
import json
from datetime import datetime
from PIL import Image
from flask import current_app

# Try to import python-magic, fallback if not available
try:
    import magic
    HAS_MAGIC = True
except ImportError:
    HAS_MAGIC = False

class OCRService:
    """Base OCR Service class"""
    def __init__(self):
        self.client = None
    
    def _validate_image(self, image_path):
        """Kiểm tra tính hợp lệ của file ảnh"""
        if not os.path.exists(image_path):
            raise FileNotFoundError("File không tồn tại")
        
        # Kiểm tra kích thước file (max 20MB)
        file_size = os.path.getsize(image_path)
        if file_size > 20 * 1024 * 1024:
            raise ValueError("File quá lớn (>20MB)")
        
        # Kiểm tra loại file
        if HAS_MAGIC:
            try:
                mime = magic.from_file(image_path, mime=True)
                if not mime.startswith('image/'):
                    raise ValueError("File không phải là ảnh")
            except:
                # Fallback kiểm tra extension
                allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
                file_ext = os.path.splitext(image_path)[1].lower()
                if file_ext not in allowed_extensions:
                    raise ValueError("Định dạng file không được hỗ trợ")
        else:
            # Fallback kiểm tra extension
            allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
            file_ext = os.path.splitext(image_path)[1].lower()
            if file_ext not in allowed_extensions:
                raise ValueError("Định dạng file không được hỗ trợ")
        
        return True
    
    def _create_prompt(self):
        """Tạo prompt để phân tích hóa đơn"""
        return """Trích xuất thông tin từ hóa đơn này theo JSON:
{
  "amount": <số tiền>,
  "date": "YYYY-MM-DD",
  "description": "<mô tả ngắn>",
  "merchant": "<tên cửa hàng>",
  "items": [{"name": "<tên>", "quantity": <số>, "price": <giá>}],
  "category_suggestion": "<Ăn uống|Di chuyển|Mua sắm|Y tế|Giải trí|Giáo dục|Khác>",
  "confidence": <0-1>
}
Lưu ý: Trả về null nếu không tìm thấy. Số tiền không có ký tự tiền tệ."""
    
    def _validate_and_clean_data(self, data):
        """Validate và clean dữ liệu được trích xuất"""
        cleaned_data = {}
        
        # Validate amount
        try:
            amount = float(data.get('amount', 0))
            cleaned_data['amount'] = max(0, amount)
        except (ValueError, TypeError):
            cleaned_data['amount'] = 0
        
        # Validate date
        date_str = data.get('date')
        try:
            if date_str:
                datetime.strptime(date_str, '%Y-%m-%d')
                cleaned_data['date'] = date_str
            else:
                cleaned_data['date'] = datetime.now().strftime('%Y-%m-%d')
        except ValueError:
            cleaned_data['date'] = datetime.now().strftime('%Y-%m-%d')
        
        # Clean text fields
        cleaned_data['description'] = str(data.get('description', '')).strip()[:255]
        cleaned_data['merchant'] = str(data.get('merchant', '')).strip()[:100]
        cleaned_data['category_suggestion'] = str(data.get('category_suggestion', '')).strip()[:50]
        
        # Validate confidence
        try:
            confidence = float(data.get('confidence', 0))
            cleaned_data['confidence'] = max(0, min(1, confidence))
        except (ValueError, TypeError):
            cleaned_data['confidence'] = 0.5
        
        # Clean items array
        items = data.get('items', [])
        if isinstance(items, list):
            cleaned_items = []
            for item in items[:10]:
                if isinstance(item, dict):
                    try:
                        quantity = float(item.get('quantity', 1) or 1)
                        price = float(item.get('price', 0) or 0)
                    except (ValueError, TypeError):
                        quantity = 1
                        price = 0
                    
                    cleaned_item = {
                        'name': str(item.get('name', '')).strip()[:100],
                        'quantity': max(0, quantity),
                        'price': max(0, price)
                    }
                    if cleaned_item['name']:
                        cleaned_items.append(cleaned_item)
            cleaned_data['items'] = cleaned_items
        else:
            cleaned_data['items'] = []
        
        return cleaned_data


class GeminiOCRService(OCRService):
    """OCR Service using Google Gemini"""
    def _initialize_client(self):
        """Khởi tạo Gemini client"""
        if self.client is not None:
            return
            
        api_key = current_app.config.get('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY chưa được cấu hình")
        
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            # Use gemini-2.5-flash (best price-performance with free tier)
            self.client = genai.GenerativeModel('gemini-2.5-flash')
        except ImportError:
            raise ImportError("Vui lòng cài đặt: pip install google-generativeai")
    
    def extract_receipt_info(self, image_path):
        """Trích xuất thông tin từ hóa đơn sử dụng Gemini"""
        try:
            self._initialize_client()
            self._validate_image(image_path)
            
            # Load image
            from PIL import Image
            img = Image.open(image_path)
            
            # Create prompt and call Gemini
            response = self.client.generate_content([self._create_prompt(), img])
            content = response.text.strip()
            
            # Parse JSON
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            
            try:
                extracted_data = json.loads(content.strip())
                extracted_data = self._validate_and_clean_data(extracted_data)
                
                return {
                    'success': True,
                    'data': extracted_data,
                    'message': 'Trích xuất thông tin thành công (Gemini)'
                }
            except json.JSONDecodeError as e:
                return {
                    'success': False,
                    'data': None,
                    'message': f'Lỗi parse JSON: {str(e)}',
                    'raw_response': content
                }
                
        except Exception as e:
            return {
                'success': False,
                'data': None,
                'message': f'Lỗi khi trích xuất thông tin: {str(e)}'
            }


class OpenAIOCRService(OCRService):
    """OCR Service using OpenAI Vision"""
    def _initialize_client(self):
        """Khởi tạo OpenAI client"""
        if self.client is not None:
            return
            
        api_key = current_app.config.get('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY chưa được cấu hình")
        
        try:
            import openai
            self.client = openai.OpenAI(api_key=api_key)
        except ImportError:
            raise ImportError("Vui lòng cài đặt: pip install openai")
    
    def _encode_image(self, image_path):
        """Encode image thành base64"""
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            raise Exception(f"Lỗi khi encode image: {str(e)}")
    
    def extract_receipt_info(self, image_path):
        """Trích xuất thông tin từ hóa đơn sử dụng OpenAI Vision API"""
        try:
            self._initialize_client()
            self._validate_image(image_path)
            
            base64_image = self._encode_image(image_path)
            
            response = self.client.chat.completions.create(
                model=current_app.config.get('OPENAI_MODEL', 'gpt-4o'),
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": self._create_prompt()},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1000,
                temperature=0.1
            )
            
            content = response.choices[0].message.content.strip()
            
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            
            try:
                extracted_data = json.loads(content)
                extracted_data = self._validate_and_clean_data(extracted_data)
                
                return {
                    'success': True,
                    'data': extracted_data,
                    'message': 'Trích xuất thông tin thành công (OpenAI)'
                }
            except json.JSONDecodeError as e:
                return {
                    'success': False,
                    'data': None,
                    'message': f'Lỗi parse JSON: {str(e)}',
                    'raw_response': content
                }
                
        except Exception as e:
            return {
                'success': False,
                'data': None,
                'message': f'Lỗi khi trích xuất thông tin: {str(e)}'
            }


def get_ocr_service():
    """Factory function to create OCR service instance"""
    provider = current_app.config.get('OCR_PROVIDER', 'gemini').lower()
    
    if provider == 'gemini':
        return GeminiOCRService()
    elif provider == 'openai':
        return OpenAIOCRService()
    else:
        # Default to Gemini
        return GeminiOCRService()