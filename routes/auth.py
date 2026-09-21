"""
Authentication routes and session protection for CORUJA ACHOU.
"""
from functools import wraps
from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from models import UserModel

auth_bp = Blueprint("auth", __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get("user_id"):
            flash("Por favor, faça login para acessar o painel administrativo.", "warning")
            return redirect(url_for("auth.login", next=request.path))
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route("/admin/login", methods=["GET", "POST"])
def login():
    # If already logged in, redirect to admin dashboard
    if session.get("user_id"):
        return redirect(url_for("admin.dashboard"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()
        next_url = request.form.get("next") or request.args.get("next") or url_for("admin.dashboard")

        if not username or not password:
            flash("Preencha usuário e senha.", "error")
            return render_template("admin/login.html", next_url=next_url)

        user = UserModel.get_by_username(username)
        if user and UserModel.verify_password(user["password_hash"], password):
            session.clear()
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            session.permanent = True
            flash(f"Bem-vindo de volta, {user['username']}! 🦉", "success")
            return redirect(next_url)
        else:
            flash("Credenciais inválidas. Verifique seu usuário e senha.", "error")

    next_url = request.args.get("next", "")
    return render_template("admin/login.html", next_url=next_url)

@auth_bp.route("/admin/logout", methods=["GET", "POST"])
def logout():
    session.clear()
    flash("Você saiu com segurança do painel administrativo.", "info")
    return redirect(url_for("auth.login"))
