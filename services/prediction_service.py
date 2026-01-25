from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy import func, extract
from models.transaction import Transaction
from app import db
import numpy as np
from sklearn.linear_model import LinearRegression
import calendar

class ExpensePredictionService:
    """Service for predicting monthly expenses based on historical data"""
    
    @staticmethod
    def get_monthly_expenses(user_id, months_back=12):
        """Get monthly expense totals for the past N months"""
        end_date = datetime.now().date()
        start_date = end_date - relativedelta(months=months_back)
        
        # Query monthly expenses
        monthly_data = db.session.query(
            extract('year', Transaction.date).label('year'),
            extract('month', Transaction.date).label('month'),
            func.sum(Transaction.amount).label('total_expense')
        ).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).group_by(
            extract('year', Transaction.date),
            extract('month', Transaction.date)
        ).order_by(
            extract('year', Transaction.date),
            extract('month', Transaction.date)
        ).all()
        
        return monthly_data
    
    @staticmethod
    def predict_current_month_simple_average(user_id, months_to_average=3):
        """Predict current month expenses using simple average of past months"""
        monthly_data = ExpensePredictionService.get_monthly_expenses(user_id, months_to_average + 1)
        
        if len(monthly_data) < 1:
            return None
        
        # Get available months (use all if less than requested)
        available_months = min(len(monthly_data), months_to_average)
        recent_months = monthly_data[-available_months:]
        total_expenses = [float(month.total_expense) for month in recent_months]
        
        # Calculate average
        prediction = sum(total_expenses) / len(total_expenses)
        
        return {
            'predicted_amount': round(prediction, 0),
            'method': 'simple_average',
            'months_used': months_to_average,
            'historical_data': [
                {
                    'year': int(month.year),
                    'month': int(month.month),
                    'month_name': calendar.month_name[int(month.month)],
                    'amount': float(month.total_expense)
                } for month in recent_months
            ]
        }
    
    @staticmethod
    def predict_current_month_weighted_average(user_id, months_to_average=3):
        """Predict current month expenses using weighted average (recent months have more weight)"""
        monthly_data = ExpensePredictionService.get_monthly_expenses(user_id, months_to_average + 1)
        
        if len(monthly_data) < 1:
            return None
        
        # Get available months (use all if less than requested)
        available_months = min(len(monthly_data), months_to_average)
        recent_months = monthly_data[-available_months:]
        total_expenses = [float(month.total_expense) for month in recent_months]
        
        # Create weights (more recent = higher weight)
        weights = np.arange(1, len(total_expenses) + 1)
        weights = weights / weights.sum()
        
        # Calculate weighted average
        prediction = np.average(total_expenses, weights=weights)
        
        return {
            'predicted_amount': round(prediction, 0),
            'method': 'weighted_average',
            'months_used': months_to_average,
            'weights': weights.tolist(),
            'historical_data': [
                {
                    'year': int(month.year),
                    'month': int(month.month),
                    'month_name': calendar.month_name[int(month.month)],
                    'amount': float(month.total_expense),
                    'weight': float(weights[i])
                } for i, month in enumerate(recent_months)
            ]
        }
    
    @staticmethod
    def predict_current_month_linear_regression(user_id, months_back=6):
        """Predict current month expenses using linear regression trend"""
        monthly_data = ExpensePredictionService.get_monthly_expenses(user_id, months_back)
        
        if len(monthly_data) < 2:
            return None
        
        # Prepare data for linear regression
        X = np.array(range(len(monthly_data))).reshape(-1, 1)
        y = np.array([float(month.total_expense) for month in monthly_data])
        
        # Fit linear regression model
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict current month (current index)
        current_month_index = len(monthly_data)
        prediction = model.predict([[current_month_index]])[0]
        
        # Calculate R-squared for model accuracy
        r_squared = model.score(X, y)
        
        return {
            'predicted_amount': round(max(0, prediction), 0),  # Ensure non-negative
            'method': 'linear_regression',
            'months_used': len(monthly_data),
            'trend_slope': float(model.coef_[0]),
            'r_squared': float(r_squared),
            'accuracy': 'High' if r_squared > 0.7 else 'Medium' if r_squared > 0.4 else 'Low',
            'historical_data': [
                {
                    'year': int(month.year),
                    'month': int(month.month),
                    'month_name': calendar.month_name[int(month.month)],
                    'amount': float(month.total_expense)
                } for month in monthly_data
            ]
        }
    
    @staticmethod
    def get_comprehensive_prediction(user_id):
        """Get predictions using multiple methods and return the best one"""
        predictions = {}
        
        # Simple average (use available months, prefer 3 if available)
        simple_pred = ExpensePredictionService.predict_current_month_simple_average(user_id, 3)
        if simple_pred:
            predictions['simple_average'] = simple_pred
        
        # Weighted average (use available months, prefer 3 if available)
        weighted_pred = ExpensePredictionService.predict_current_month_weighted_average(user_id, 3)
        if weighted_pred:
            predictions['weighted_average'] = weighted_pred
        
        # Linear regression (use available months, prefer 6 if available)
        linear_pred = ExpensePredictionService.predict_current_month_linear_regression(user_id, 6)
        if linear_pred:
            predictions['linear_regression'] = linear_pred
        
        if not predictions:
            return None
        
        # Choose best method based on available data and accuracy
        if 'linear_regression' in predictions and predictions['linear_regression']['r_squared'] > 0.5:
            recommended = predictions['linear_regression']
            recommended['recommended_reason'] = 'Hồi quy tuyến tính với độ chính xác cao'
        elif 'weighted_average' in predictions:
            recommended = predictions['weighted_average']
            recommended['recommended_reason'] = 'Trung bình có trọng số ưu tiên tháng gần đây'
        else:
            recommended = predictions['simple_average']
            recommended['recommended_reason'] = 'Trung bình đơn giản từ các tháng trước'
        
        # Get current month info
        current_month = datetime.now().date()
        
        return {
            'current_month': {
                'year': current_month.year,
                'month': current_month.month,
                'month_name': calendar.month_name[current_month.month]
            },
            'recommended_prediction': recommended,
            'all_predictions': predictions,
            'generated_at': datetime.now().isoformat()
        }
    
    @staticmethod
    def get_category_predictions(user_id, months_to_average=3):
        """Predict expenses by category for next month"""
        end_date = datetime.now().date()
        start_date = end_date - relativedelta(months=months_to_average)
        
        # Query expenses by category for the past N months
        category_data = db.session.query(
            Transaction.category_id,
            func.avg(Transaction.amount).label('avg_amount'),
            func.count(Transaction.id).label('transaction_count')
        ).join(
            Transaction.category
        ).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).group_by(
            Transaction.category_id
        ).all()
        
        predictions = []
        for category in category_data:
            from models.category import Category
            cat_obj = Category.query.get(category.category_id)
            predictions.append({
                'category_id': category.category_id,
                'category_name': cat_obj.name if cat_obj else 'Unknown',
                'predicted_amount': round(float(category.avg_amount), 0),
                'avg_transactions_per_month': round(float(category.transaction_count) / months_to_average, 1)
            })
        
        return sorted(predictions, key=lambda x: x['predicted_amount'], reverse=True)
