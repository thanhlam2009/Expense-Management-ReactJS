from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from models.user import User
from models.transaction import Transaction
from models.category import Category
from models.savings_goal import SavingsGoal
from app import db
from sqlalchemy import func
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            flash('Bạn không có quyền truy cập trang này!', 'danger')
            return redirect(url_for('main.dashboard'))
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/')
@login_required
@admin_required
def dashboard():
    # Statistics
    total_users = User.query.count()
    total_transactions = Transaction.query.count()
    total_income = Transaction.query.filter_by(type='income').with_entities(func.sum(Transaction.amount)).scalar() or 0
    total_expense = Transaction.query.filter_by(type='expense').with_entities(func.sum(Transaction.amount)).scalar() or 0
    
    # Recent users
    recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
    
    # Top spending categories
    top_categories = db.session.query(
        Category.name,
        func.sum(Transaction.amount).label('total')
    ).join(Transaction).filter(
        Transaction.type == 'expense'
    ).group_by(Category.name).order_by(func.sum(Transaction.amount).desc()).limit(5).all()
    
    return render_template('admin/dashboard.html',
                         total_users=total_users,
                         total_transactions=total_transactions,
                         total_income=total_income,
                         total_expense=total_expense,
                         recent_users=recent_users,
                         top_categories=top_categories)

@admin_bp.route('/users')
@login_required
@admin_required
def users():
    page = request.args.get('page', 1, type=int)
    users = User.query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    return render_template('admin/users.html', users=users)

@admin_bp.route('/users/<int:id>/toggle-admin', methods=['POST'])
@login_required
@admin_required
def toggle_admin(id):
    user = User.query.get_or_404(id)
    if user.id == current_user.id:
        flash('Bạn không thể thay đổi quyền của chính mình!', 'danger')
    else:
        user.is_admin = not user.is_admin
        db.session.commit()
        status = 'admin' if user.is_admin else 'user'
        flash(f'Đã cập nhật quyền của {user.username} thành {status}!', 'success')
    
    return redirect(url_for('admin.users'))

@admin_bp.route('/categories')
@login_required
@admin_required
def categories():
    categories = Category.query.order_by(Category.type, Category.name).all()
    return render_template('admin/categories.html', categories=categories)

@admin_bp.route('/categories/add', methods=['GET', 'POST'])
@login_required
@admin_required
def add_category():
    if request.method == 'POST':
        name = request.form.get('name')
        category_type = request.form.get('type')
        description = request.form.get('description')
        
        if Category.query.filter_by(name=name, type=category_type).first():
            flash('Danh mục đã tồn tại!', 'danger')
        else:
            category = Category(
                name=name,
                type=category_type,
                description=description
            )
            db.session.add(category)
            db.session.commit()
            flash('Danh mục đã được thêm!', 'success')
            return redirect(url_for('admin.categories'))
    
    return render_template('admin/add_category.html')

@admin_bp.route('/transactions')
@login_required
@admin_required
def transactions():
    page = request.args.get('page', 1, type=int)
    transactions = Transaction.query.order_by(Transaction.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    return render_template('admin/transactions.html', transactions=transactions)