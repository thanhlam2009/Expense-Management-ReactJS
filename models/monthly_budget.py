# -*- coding: utf-8 -*-
"""
Monthly Budget Model
Quản lý giới hạn chi tiêu hàng tháng của người dùng
"""

from datetime import datetime
from app import db

class MonthlyBudget(db.Model):
    """Model lưu trữ giới hạn chi tiêu hàng tháng"""
    
    __tablename__ = 'monthly_budgets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    month = db.Column(db.Integer, nullable=False)  # 1-12
    budget_limit = db.Column(db.Numeric(15, 2), nullable=False)  # Giới hạn chi tiêu
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('monthly_budgets', lazy=True))
    
    # Unique constraint: một user chỉ có một budget cho một tháng
    __table_args__ = (db.UniqueConstraint('user_id', 'year', 'month', name='unique_user_month_budget'),)
    
    def __repr__(self):
        return f'<MonthlyBudget {self.user_id} - {self.year}/{self.month}: {self.budget_limit}>'
    
    def to_dict(self):
        """Chuyển đổi object thành dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'year': self.year,
            'month': self.month,
            'budget_limit': float(self.budget_limit),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @staticmethod
    def get_current_month_budget(user_id):
        """Lấy budget của tháng hiện tại"""
        now = datetime.now()
        return MonthlyBudget.query.filter_by(
            user_id=user_id,
            year=now.year,
            month=now.month
        ).first()
    
    @staticmethod
    def get_or_create_current_month(user_id, default_budget=0):
        """Lấy hoặc tạo budget cho tháng hiện tại"""
        now = datetime.now()
        budget = MonthlyBudget.get_current_month_budget(user_id)
        
        if not budget:
            budget = MonthlyBudget(
                user_id=user_id,
                year=now.year,
                month=now.month,
                budget_limit=default_budget
            )
            db.session.add(budget)
            db.session.commit()
        
        return budget
