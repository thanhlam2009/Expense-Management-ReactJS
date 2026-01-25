# Import all route blueprints
from .auth import auth_bp
from .main import main_bp
from .transactions import transactions_bp
from .api import api_bp
from .admin import admin_bp
from .budget import budget_bp

__all__ = ['auth_bp', 'main_bp', 'transactions_bp', 'api_bp', 'admin_bp', 'budget_bp']