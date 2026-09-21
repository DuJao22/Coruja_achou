"""
Main Application Entry Point for CORUJA ACHOU
Professional Product Discovery & Affiliate Showcase Platform.
"""
import os
from datetime import timedelta
from flask import Flask, render_template
from database import init_db
from routes.public import public_bp
from routes.auth import auth_bp
from routes.admin import admin_bp

def create_app():
    app = Flask(__name__)

    # Configuration
    app.secret_key = os.environ.get("FLASK_SECRET_KEY", "coruja-achou-secret-key-prod-2026")
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max upload

    # Auto-initialize database and seed initial categories/products
    with app.app_context():
        init_db()

    # Register Blueprints
    app.register_blueprint(public_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)

    # Custom Jinja Template Filters
    @app.template_filter("currency")
    def currency_filter(value):
        """Formats a float as Brazilian Real: R$ 1.234,56"""
        try:
            val = float(value)
            formatted = f"{val:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
            return f"R$ {formatted}"
        except (ValueError, TypeError):
            return f"R$ {value}"

    @app.template_filter("score_bar")
    def score_bar_filter(score, total_blocks=10):
        """Generates visual ASCII/Unicode block meter: ████████░░"""
        try:
            score = max(0, min(100, int(score)))
            filled = round((score / 100) * total_blocks)
            unfilled = total_blocks - filled
            return "█" * filled + "░" * unfilled
        except Exception:
            return "████████░░"

    # Error Handlers
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template("404.html"), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        return render_template("500.html"), 500

    return app

app = create_app()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 5000)))
    parser.add_argument("--host", type=str, default="0.0.0.0")
    args, _ = parser.parse_known_args()
    print(f"🦉 CORUJA ACHOU running on http://{args.host}:{args.port}")
    app.run(host=args.host, port=args.port, debug=False)
