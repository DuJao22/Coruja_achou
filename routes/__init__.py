"""
Routes package for CORUJA ACHOU.
"""
from routes.public import public_bp
from routes.auth import auth_bp
from routes.admin import admin_bp

__all__ = ["public_bp", "auth_bp", "admin_bp"]
