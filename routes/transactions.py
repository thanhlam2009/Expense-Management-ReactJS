from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app
from flask_login import login_required, current_user
from models.transaction import Transaction
from models.category import Category
from models.savings_goal import SavingsGoal
from app import db
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from services.ocr_service import get_ocr_service

transactions_bp = Blueprint('transactions', __name__)

def allowed_file(filename):
    """Kiểm tra file extension có được phép không"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'bmp', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@transactions_bp.route('/')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    # Filters
    transaction_type = request.args.get('type')
    category_id = request.args.get('category')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    
    # Build query
    query = Transaction.query.filter_by(user_id=current_user.id)
    
    if transaction_type:
        query = query.filter_by(type=transaction_type)
    if category_id:
        query = query.filter_by(category_id=category_id)
    if date_from:
        query = query.filter(Transaction.date >= datetime.strptime(date_from, '%Y-%m-%d').date())
    if date_to:
        query = query.filter(Transaction.date <= datetime.strptime(date_to, '%Y-%m-%d').date())
    
    transactions = query.order_by(Transaction.date.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    categories = Category.query.all()
    
    return render_template('transactions/index.html',
                         transactions=transactions,
                         categories=categories)

@transactions_bp.route('/add', methods=['GET', 'POST'])
@login_required
def add():
    if request.method == 'POST':
        amount = float(request.form.get('amount'))
        transaction_type = request.form.get('type')
        category_id = int(request.form.get('category_id'))
        description = request.form.get('description')
        date_str = request.form.get('date')
        
        # Parse date
        transaction_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        
        # Create transaction
        transaction = Transaction(
            amount=amount,
            type=transaction_type,
            category_id=category_id,
            description=description,
            date=transaction_date,
            user_id=current_user.id
        )
        
        # Handle file upload
        if 'receipt' in request.files:
            file = request.files['receipt']
            if file and file.filename != '':
                filename = secure_filename(file.filename)
                # Add timestamp to avoid conflicts
                filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
                file_path = os.path.join('static/uploads', filename)
                file.save(file_path)
                transaction.receipt_image = filename
        
        db.session.add(transaction)
        db.session.commit()
        
        # Update savings goal if it's income
        if transaction_type == 'income':
            active_goal = SavingsGoal.query.filter_by(
                user_id=current_user.id,
                is_active=True
            ).first()
            if active_goal:
                active_goal.current_amount += amount
                db.session.commit()
        
        flash('Giao dịch đã được thêm thành công!', 'success')
        return redirect(url_for('transactions.index'))
    
    categories = Category.query.all()
    return render_template('transactions/add.html', categories=categories)

@transactions_bp.route('/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit(id):
    transaction = Transaction.query.filter_by(id=id, user_id=current_user.id).first_or_404()
    
    if request.method == 'POST':
        old_amount = transaction.amount
        old_type = transaction.type
        
        transaction.amount = float(request.form.get('amount'))
        transaction.type = request.form.get('type')
        transaction.category_id = int(request.form.get('category_id'))
        transaction.description = request.form.get('description')
        transaction.date = datetime.strptime(request.form.get('date'), '%Y-%m-%d').date()
        transaction.updated_at = datetime.utcnow()
        
        # Handle file upload
        if 'receipt' in request.files:
            file = request.files['receipt']
            if file and file.filename != '':
                filename = secure_filename(file.filename)
                filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
                file_path = os.path.join('static/uploads', filename)
                file.save(file_path)
                transaction.receipt_image = filename
        
        # Update savings goal
        active_goal = SavingsGoal.query.filter_by(
            user_id=current_user.id,
            is_active=True
        ).first()
        
        if active_goal:
            # Remove old amount effect
            if old_type == 'income':
                active_goal.current_amount -= old_amount
            
            # Add new amount effect
            if transaction.type == 'income':
                active_goal.current_amount += transaction.amount
        
        db.session.commit()
        
        flash('Giao dịch đã được cập nhật!', 'success')
        return redirect(url_for('transactions.index'))
    
    categories = Category.query.all()
    return render_template('transactions/edit.html', transaction=transaction, categories=categories)

@transactions_bp.route('/delete/<int:id>', methods=['POST'])
@login_required
def delete(id):
    transaction = Transaction.query.filter_by(id=id, user_id=current_user.id).first_or_404()
    
    # Update savings goal
    if transaction.type == 'income':
        active_goal = SavingsGoal.query.filter_by(
            user_id=current_user.id,
            is_active=True
        ).first()
        if active_goal:
            active_goal.current_amount -= transaction.amount
    
    db.session.delete(transaction)
    db.session.commit()
    
    flash('Giao dịch đã được xóa!', 'success')
    return redirect(url_for('transactions.index'))

@transactions_bp.route('/savings-goals')
@login_required
def savings_goals():
    goals = SavingsGoal.query.filter_by(user_id=current_user.id).order_by(SavingsGoal.created_at.desc()).all()
    return render_template('transactions/savings_goals.html', goals=goals)

@transactions_bp.route('/extract-receipt', methods=['POST'])
@login_required
def extract_receipt_info():
    """Endpoint để trích xuất thông tin từ ảnh hóa đơn bằng OpenAI"""
    try:
        # Debug log
        print("Files in request:", request.files)
        print("Form data:", request.form)
        
        # Kiểm tra có file được upload không
        if 'receipt_image' not in request.files:
            return jsonify({
                'success': False,
                'message': 'Không có file được chọn'
            }), 400
        
        file = request.files['receipt_image']
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'Không có file được chọn'
            }), 400
        
        # Kiểm tra định dạng file
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'message': 'Định dạng file không được hỗ trợ'
            }), 400
        
        # Lưu file tạm thời
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        os.makedirs(os.path.dirname(upload_path), exist_ok=True)
        file.save(upload_path)
        
        # Khởi tạo OCR service và trích xuất thông tin
        ocr_service = get_ocr_service()
        result = ocr_service.extract_receipt_info(upload_path)
        
        # Xóa file tạm sau khi xử lý
        try:
            os.remove(upload_path)
        except:
            pass
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi xử lý ảnh: {str(e)}'
        }), 500

@transactions_bp.route('/savings-goals/add', methods=['GET', 'POST'])
@login_required
def add_savings_goal():
    if request.method == 'POST':
        name = request.form.get('name')
        target_amount = float(request.form.get('target_amount'))
        target_date_str = request.form.get('target_date')
        description = request.form.get('description')
        
        target_date = None
        if target_date_str:
            target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
        
        goal = SavingsGoal(
            name=name,
            target_amount=target_amount,
            target_date=target_date,
            description=description,
            user_id=current_user.id
        )
        
        db.session.add(goal)
        db.session.commit()
        
        flash('Mục tiêu tiết kiệm đã được tạo!', 'success')
        return redirect(url_for('transactions.savings_goals'))
    
    return render_template('transactions/add_savings_goal.html')

@transactions_bp.route('/savings-goals/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_savings_goal(id):
    goal = SavingsGoal.query.filter_by(id=id, user_id=current_user.id).first_or_404()
    
    if request.method == 'POST':
        goal.name = request.form.get('name')
        goal.target_amount = float(request.form.get('target_amount'))
        target_date_str = request.form.get('target_date')
        goal.description = request.form.get('description')
        
        if target_date_str:
            goal.target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
        else:
            goal.target_date = None
        
        goal.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        flash('Mục tiêu tiết kiệm đã được cập nhật!', 'success')
        return redirect(url_for('transactions.savings_goals'))
    
    return render_template('transactions/edit_savings_goal.html', goal=goal)