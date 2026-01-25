# -*- coding: utf-8 -*-
"""
Expense Tracker Web Application
Run this script to start the Flask development server
"""

import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

if __name__ == '__main__':
    # Create the Flask app
    app = create_app()
    
    # Run the development server
    app.run(
        host='127.0.0.1',
        port=5001,
        debug=True
    )