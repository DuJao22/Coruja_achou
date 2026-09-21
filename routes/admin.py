"""
Administrative panel routes for CORUJA ACHOU.
Full CRUD for products, categories, settings, image uploads and dashboards.
"""
import os
import json
from flask import (
    Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app
)
from werkzeug.utils import secure_filename
from routes.auth import login_required
from models import (
    ProductModel, CategoryModel, SettingsModel, StatsModel, slugify
)

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file_storage):
    """Saves an uploaded image file into static/uploads directory."""
    if not file_storage or file_storage.filename == "":
        return None
    if not allowed_file(file_storage.filename):
        return None
    
    upload_dir = os.path.join(current_app.root_path, "static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    filename = secure_filename(file_storage.filename)
    # prepend timestamp to prevent name collision
    from datetime import datetime
    unique_name = f"{int(datetime.now().timestamp())}_{filename}"
    file_path = os.path.join(upload_dir, unique_name)
    file_storage.save(file_path)
    return f"/static/uploads/{unique_name}"

# 1. Dashboard
@admin_bp.route("/")
@login_required
def dashboard():
    stats = StatsModel.get_admin_dashboard_stats()
    recent_products = ProductModel.get_all(sort_by="newest")[:6]
    categories = CategoryModel.get_all()
    return render_template(
        "admin/dashboard.html",
        stats=stats,
        recent_products=recent_products,
        categories=categories
    )

# 2. Products List & Filtering
@admin_bp.route("/products")
@login_required
def products_list():
    cat_filter = request.args.get("categoria")
    status_filter = request.args.get("status")
    featured_filter = request.args.get("destaque")
    trending_filter = request.args.get("em_alta")
    search_query = request.args.get("q", "").strip()

    category_id = int(cat_filter) if cat_filter and cat_filter.isdigit() else None
    featured = int(featured_filter) if featured_filter in ("0", "1") else None
    trending = int(trending_filter) if trending_filter in ("0", "1") else None
    
    only_active = None
    if status_filter == "active":
        only_active = True
    
    products = ProductModel.get_all(
        only_active=only_active if status_filter == "active" else False,
        category_id=category_id,
        featured=featured,
        trending=trending,
        search_term=search_query if search_query else None
    )

    if status_filter == "inactive":
        products = [p for p in products if p["active"] == 0]

    categories = CategoryModel.get_all()

    return render_template(
        "admin/products_list.html",
        products=products,
        categories=categories,
        current_cat=cat_filter,
        current_status=status_filter,
        current_featured=featured_filter,
        current_trending=trending_filter,
        search_query=search_query
    )

# 3. Add Product
@admin_bp.route("/products/new", methods=["GET", "POST"])
@login_required
def product_new():
    categories = CategoryModel.get_all()
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        slug = request.form.get("slug", "").strip()
        short_description = request.form.get("short_description", "").strip()
        description = request.form.get("description", "").strip()
        category_id = request.form.get("category_id")
        price = request.form.get("price", "0").replace(",", ".")
        old_price = request.form.get("old_price", "").replace(",", ".")
        rating = request.form.get("rating", "5.0").replace(",", ".")
        sales_count = request.form.get("sales_count", "0")
        trend_score = request.form.get("trend_score", "85")
        affiliate_url = request.form.get("affiliate_url", "").strip()
        featured = 1 if request.form.get("featured") else 0
        trending = 1 if request.form.get("trending") else 0
        active = 1 if request.form.get("active") else 0

        # Handle Image Upload or URL
        image_url = request.form.get("image_url", "").strip()
        if "image_file" in request.files:
            uploaded_path = save_uploaded_file(request.files["image_file"])
            if uploaded_path:
                image_url = uploaded_path

        # Handle Additional Images
        additional_images_raw = request.form.get("additional_images_urls", "").strip()
        additional_images_list = []
        if additional_images_raw:
            for url in additional_images_raw.splitlines():
                u = url.strip()
                if u:
                    additional_images_list.append(u)

        # Uploaded additional files
        if "additional_files" in request.files:
            for extra_file in request.files.getlist("additional_files"):
                extra_path = save_uploaded_file(extra_file)
                if extra_path:
                    additional_images_list.append(extra_path)

        # Validation
        if not name:
            flash("O nome do produto é obrigatório.", "error")
            return render_template("admin/product_form.html", categories=categories, product=request.form)
        if not category_id:
            flash("Selecione uma categoria válida.", "error")
            return render_template("admin/product_form.html", categories=categories, product=request.form)
        if not image_url:
            flash("Forneça ao menos uma imagem principal (upload ou URL).", "error")
            return render_template("admin/product_form.html", categories=categories, product=request.form)
        if not affiliate_url:
            flash("O link de afiliado é obrigatório.", "error")
            return render_template("admin/product_form.html", categories=categories, product=request.form)

        try:
            p_price = float(price)
            p_old_price = float(old_price) if old_price else None
            p_rating = float(rating)
            p_sales = int(sales_count)
            p_score = int(trend_score)
        except ValueError:
            flash("Valores numéricos inválidos para preço, avaliação ou score.", "error")
            return render_template("admin/product_form.html", categories=categories, product=request.form)

        product_data = {
            "name": name,
            "slug": slug if slug else slugify(name),
            "short_description": short_description,
            "description": description,
            "category_id": category_id,
            "image": image_url,
            "additional_images": additional_images_list,
            "price": p_price,
            "old_price": p_old_price,
            "rating": p_rating,
            "sales_count": p_sales,
            "trend_score": p_score,
            "affiliate_url": affiliate_url,
            "featured": featured,
            "trending": trending,
            "active": active
        }

        try:
            prod_id = ProductModel.create(product_data)
            flash(f"Produto '{name}' cadastrado com sucesso! Já está visível na vitrine. 🦉", "success")
            return redirect(url_for("admin.products_list"))
        except Exception as e:
            flash(f"Erro ao salvar produto: {str(e)}", "error")

    return render_template("admin/product_form.html", categories=categories, product=None)

# 4. Edit Product
@admin_bp.route("/products/<int:prod_id>/edit", methods=["GET", "POST"])
@login_required
def product_edit(prod_id):
    product = ProductModel.get_by_id(prod_id)
    if not product:
        flash("Produto não encontrado.", "error")
        return redirect(url_for("admin.products_list"))

    categories = CategoryModel.get_all()

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        slug = request.form.get("slug", "").strip()
        short_description = request.form.get("short_description", "").strip()
        description = request.form.get("description", "").strip()
        category_id = request.form.get("category_id")
        price = request.form.get("price", "0").replace(",", ".")
        old_price = request.form.get("old_price", "").replace(",", ".")
        rating = request.form.get("rating", "5.0").replace(",", ".")
        sales_count = request.form.get("sales_count", "0")
        trend_score = request.form.get("trend_score", "85")
        affiliate_url = request.form.get("affiliate_url", "").strip()
        featured = 1 if request.form.get("featured") else 0
        trending = 1 if request.form.get("trending") else 0
        active = 1 if request.form.get("active") else 0

        # Handle Image
        image_url = request.form.get("image_url", "").strip() or product["image"]
        if "image_file" in request.files:
            uploaded_path = save_uploaded_file(request.files["image_file"])
            if uploaded_path:
                image_url = uploaded_path

        # Additional Images
        additional_images_raw = request.form.get("additional_images_urls", "").strip()
        additional_images_list = []
        if additional_images_raw:
            for url in additional_images_raw.splitlines():
                u = url.strip()
                if u:
                    additional_images_list.append(u)
        else:
            additional_images_list = product.get("additional_images_list", [])

        if "additional_files" in request.files:
            for extra_file in request.files.getlist("additional_files"):
                extra_path = save_uploaded_file(extra_file)
                if extra_path:
                    additional_images_list.append(extra_path)

        if not name or not category_id or not affiliate_url or not image_url:
            flash("Campos obrigatórios ausentes.", "error")
            return render_template("admin/product_form.html", categories=categories, product=product)

        try:
            p_price = float(price)
            p_old_price = float(old_price) if old_price else None
            p_rating = float(rating)
            p_sales = int(sales_count)
            p_score = int(trend_score)
        except ValueError:
            flash("Valores numéricos inválidos.", "error")
            return render_template("admin/product_form.html", categories=categories, product=product)

        updated_data = {
            "name": name,
            "slug": slug if slug else slugify(name),
            "short_description": short_description,
            "description": description,
            "category_id": category_id,
            "image": image_url,
            "additional_images": additional_images_list,
            "price": p_price,
            "old_price": p_old_price,
            "rating": p_rating,
            "sales_count": p_sales,
            "trend_score": p_score,
            "affiliate_url": affiliate_url,
            "featured": featured,
            "trending": trending,
            "active": active
        }

        ProductModel.update(prod_id, updated_data)
        flash(f"Produto '{name}' atualizado com sucesso!", "success")
        return redirect(url_for("admin.products_list"))

    return render_template("admin/product_form.html", categories=categories, product=product)

# 5. Delete Product
@admin_bp.route("/products/<int:prod_id>/delete", methods=["POST"])
@login_required
def product_delete(prod_id):
    product = ProductModel.get_by_id(prod_id)
    if product:
        ProductModel.delete(prod_id)
        flash(f"Produto '{product['name']}' excluído permanentemente.", "info")
    else:
        flash("Produto não encontrado.", "error")
    return redirect(url_for("admin.products_list"))

# 6. Toggle Product Active
@admin_bp.route("/products/<int:prod_id>/toggle", methods=["POST"])
@login_required
def product_toggle(prod_id):
    new_val = ProductModel.toggle_active(prod_id)
    if request.is_json or request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return jsonify({"success": True, "active": new_val})
    flash("Status do produto alterado com sucesso.", "success")
    return redirect(request.referrer or url_for("admin.products_list"))

# 7. Categories List
@admin_bp.route("/categories")
@login_required
def categories_list():
    categories = CategoryModel.get_all()
    return render_template("admin/categories_list.html", categories=categories)

# 8. Add Category
@admin_bp.route("/categories/new", methods=["GET", "POST"])
@login_required
def category_new():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        slug = request.form.get("slug", "").strip()
        description = request.form.get("description", "").strip()
        icon = request.form.get("icon", "🦉").strip()
        image = request.form.get("image", "").strip()
        active = 1 if request.form.get("active") else 0

        if not name:
            flash("O nome da categoria é obrigatório.", "error")
            return render_template("admin/category_form.html", category=None)

        CategoryModel.create(
            name=name,
            slug=slug if slug else slugify(name),
            description=description,
            icon=icon,
            image=image,
            active=active
        )
        flash(f"Categoria '{name}' criada com sucesso!", "success")
        return redirect(url_for("admin.categories_list"))

    return render_template("admin/category_form.html", category=None)

# 9. Edit Category
@admin_bp.route("/categories/<int:cat_id>/edit", methods=["GET", "POST"])
@login_required
def category_edit(cat_id):
    category = CategoryModel.get_by_id(cat_id)
    if not category:
        flash("Categoria não encontrada.", "error")
        return redirect(url_for("admin.categories_list"))

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        slug = request.form.get("slug", "").strip()
        description = request.form.get("description", "").strip()
        icon = request.form.get("icon", "🦉").strip()
        image = request.form.get("image", "").strip()
        active = 1 if request.form.get("active") else 0

        if not name:
            flash("O nome da categoria é obrigatório.", "error")
            return render_template("admin/category_form.html", category=category)

        CategoryModel.update(
            cat_id=cat_id,
            name=name,
            slug=slug if slug else slugify(name),
            description=description,
            icon=icon,
            image=image,
            active=active
        )
        flash(f"Categoria '{name}' atualizada com sucesso!", "success")
        return redirect(url_for("admin.categories_list"))

    return render_template("admin/category_form.html", category=category)

# 10. Delete Category with protection
@admin_bp.route("/categories/<int:cat_id>/delete", methods=["POST"])
@login_required
def category_delete(cat_id):
    success, message = CategoryModel.delete(cat_id)
    if success:
        flash(message, "success")
    else:
        flash(message, "error")
    return redirect(url_for("admin.categories_list"))

# 11. Toggle Category Active
@admin_bp.route("/categories/<int:cat_id>/toggle", methods=["POST"])
@login_required
def category_toggle(cat_id):
    CategoryModel.toggle_active(cat_id)
    flash("Status da categoria alterado.", "success")
    return redirect(url_for("admin.categories_list"))

# 12. Settings
@admin_bp.route("/settings", methods=["GET", "POST"])
@login_required
def settings():
    from flask import session
    from models import UserModel
    if request.method == "POST":
        action = request.form.get("action", "update_settings")
        if action == "change_password":
            current_pw = request.form.get("current_password", "")
            new_pw = request.form.get("new_password", "")
            confirm_pw = request.form.get("confirm_password", "")
            
            user = UserModel.get_by_username(session.get("admin_user", "admin"))
            if not user or not UserModel.verify_password(user["password_hash"], current_pw):
                flash("Senha atual incorreta.", "error")
            elif len(new_pw) < 6:
                flash("A nova senha deve ter pelo menos 6 caracteres.", "error")
            elif new_pw != confirm_pw:
                flash("A confirmação da senha não confere.", "error")
            else:
                UserModel.update_password(user["id"], new_pw)
                flash("Senha de acesso alterada com sucesso! 🦉", "success")
        else:
            updated_settings = {
                "site_name": request.form.get("site_name", "CORUJA ACHOU").strip(),
                "currency": request.form.get("currency", "R$").strip(),
                "slogan": request.form.get("slogan", "").strip(),
                "description": request.form.get("description", "").strip(),
                "instagram": request.form.get("instagram", "").strip(),
                "tiktok": request.form.get("tiktok", "").strip(),
                "whatsapp": request.form.get("whatsapp", "").strip(),
                "footer_text": request.form.get("footer_text", "").strip(),
            }
            SettingsModel.update_many(updated_settings)
            flash("Configurações da vitrine atualizadas com sucesso! 🦉", "success")

    current_settings = SettingsModel.get_all()
    return render_template("admin/settings.html", settings=current_settings)
