from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from urllib.parse import urlparse
from models.user import User
from app import db
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        if request.is_json:
            return jsonify({
                'user': {
                    'id': current_user.id,
                    'username': current_user.username,
                    'email': current_user.email,
                    'full_name': current_user.full_name,
                    'is_admin': current_user.is_admin
                }
            })
        return redirect(url_for('main.dashboard'))
    
    if request.method == 'POST':
        # Handle JSON requests (from React)
        if request.is_json:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
            remember = bool(data.get('remember', False))
        else:
            # Handle form requests (from Jinja2 templates)
            email = request.form.get('email')
            password = request.form.get('password')
            remember = bool(request.form.get('remember'))
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            login_user(user, remember=remember)
            user.update_last_login()
            
            if request.is_json:
                return jsonify({
                    'message': f'Chào mừng {user.full_name}!',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'full_name': user.full_name,
                        'is_admin': user.is_admin
                    }
                })
            
            next_page = request.args.get('next')
            if not next_page or urlparse(next_page).netloc != '':
                next_page = url_for('main.dashboard')
            
            flash(f'Chào mừng {user.full_name}!', 'success')
            return redirect(next_page)
        else:
            if request.is_json:
                return jsonify({'error': 'Email hoặc mật khẩu không đúng!'}), 401
            flash('Email hoặc mật khẩu không đúng!', 'danger')
    
    return render_template('auth/login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        if request.is_json:
            return jsonify({'error': 'Already authenticated'}), 400
        return redirect(url_for('main.dashboard'))
    
    if request.method == 'POST':
        # Handle JSON requests (from React)
        if request.is_json:
            data = request.get_json()
            username = data.get('username')
            email = data.get('email')
            full_name = data.get('full_name')
            password = data.get('password')
            confirm_password = data.get('confirm_password')
        else:
            # Handle form requests (from Jinja2 templates)
            username = request.form.get('username')
            email = request.form.get('email')
            full_name = request.form.get('full_name')
            password = request.form.get('password')
            confirm_password = request.form.get('confirm_password')
        
        # Validation
        if not all([username, email, full_name, password, confirm_password]):
            if request.is_json:
                return jsonify({'error': 'Vui lòng điền đầy đủ thông tin!'}), 400
            flash('Vui lòng điền đầy đủ thông tin!', 'danger')
            return render_template('auth/register.html')
        
        if password != confirm_password:
            if request.is_json:
                return jsonify({'error': 'Mật khẩu xác nhận không khớp!'}), 400
            flash('Mật khẩu xác nhận không khớp!', 'danger')
            return render_template('auth/register.html')
        
        if len(password) < 6:
            if request.is_json:
                return jsonify({'error': 'Mật khẩu phải có ít nhất 6 ký tự!'}), 400
            flash('Mật khẩu phải có ít nhất 6 ký tự!', 'danger')
            return render_template('auth/register.html')
        
        # Check if user exists
        if User.query.filter_by(email=email).first():
            if request.is_json:
                return jsonify({'error': 'Email đã được sử dụng!'}), 400
            flash('Email đã được sử dụng!', 'danger')
            return render_template('auth/register.html')
        
        if User.query.filter_by(username=username).first():
            if request.is_json:
                return jsonify({'error': 'Tên đăng nhập đã được sử dụng!'}), 400
            flash('Tên đăng nhập đã được sử dụng!', 'danger')
            return render_template('auth/register.html')
        
        # Create new user
        user = User(
            username=username,
            email=email,
            full_name=full_name
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        if request.is_json:
            return jsonify({'message': 'Đăng ký thành công! Vui lòng đăng nhập.'}), 201
        
        flash('Đăng ký thành công! Vui lòng đăng nhập.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/register.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    if request.is_json:
        return jsonify({'message': 'Đã đăng xuất thành công!'})
    flash('Đã đăng xuất thành công!', 'info')
    return redirect(url_for('auth.login'))

@auth_bp.route('/check-session')
def check_session():
    """Check if user is authenticated (for React app)"""
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'full_name': current_user.full_name,
                'is_admin': current_user.is_admin
            }
        })
    return jsonify({'authenticated': False})