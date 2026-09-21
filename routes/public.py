"""
Public showcase routes for CORUJA ACHOU.
High performance, mobile-optimized editorial product discovery.
"""
from flask import Blueprint, render_template, request, abort
from models import ProductModel, CategoryModel, SettingsModel

public_bp = Blueprint("public", __name__)

@public_bp.context_processor
def inject_global_data():
    """Injects global settings and categories available across all public templates."""
    settings = SettingsModel.get_all()
    categories = CategoryModel.get_all(only_active=True)
    return {
        "site_settings": settings,
        "nav_categories": categories,
        "brand_name": settings.get("site_name", "CORUJA ACHOU"),
        "brand_slogan": settings.get("slogan", "A coruja encontrou. Agora é sua vez.")
    }

@public_bp.route("/")
def home():
    """Main showcase page with hero, category pills, featured & trending highlights."""
    categories = CategoryModel.get_all(only_active=True)
    featured_products = ProductModel.get_featured(limit=8)
    trending_products = ProductModel.get_trending(limit=8)
    all_recent = ProductModel.get_all(only_active=True, sort_by="newest")[:12]

    return render_template(
        "index.html",
        categories=categories,
        featured_products=featured_products,
        trending_products=trending_products,
        recent_products=all_recent,
        active_category=None
    )

@public_bp.route("/categoria/<slug>")
def category_view(slug):
    """Category showcase page with filter and sort options."""
    category = CategoryModel.get_by_slug(slug)
    if not category or not category.get("active"):
        abort(404)

    # Sorting & filtering parameters
    sort_by = request.args.get("ordenar", "newest")
    only_featured = request.args.get("destaque") == "1"
    only_trending = request.args.get("em_alta") == "1"
    min_rating = request.args.get("avaliacao")
    min_score = request.args.get("score")

    products = ProductModel.get_all(
        only_active=True,
        category_id=category["id"],
        featured=1 if only_featured else None,
        trending=1 if only_trending else None,
        sort_by=sort_by
    )

    # In-memory post-filters if specified
    if min_rating:
        try:
            mr = float(min_rating)
            products = [p for p in products if p["rating"] >= mr]
        except ValueError:
            pass

    if min_score:
        try:
            ms = int(min_score)
            products = [p for p in products if p["trend_score"] >= ms]
        except ValueError:
            pass

    return render_template(
        "category.html",
        category=category,
        products=products,
        current_sort=sort_by,
        only_featured=only_featured,
        only_trending=only_trending,
        active_category=category["slug"]
    )

@public_bp.route("/produto/<slug>")
def product_detail(slug):
    """Single product editorial page with rich details and related products."""
    product = ProductModel.get_by_slug(slug)
    if not product or not product.get("active"):
        abort(404)

    # Related items in same category
    related_products = ProductModel.get_related(product["id"], product["category_id"], limit=4)
    category = CategoryModel.get_by_id(product["category_id"])

    return render_template(
        "product.html",
        product=product,
        category=category,
        related_products=related_products
    )

@public_bp.route("/buscar")
def search():
    """Live search across products, descriptions, and category tags."""
    query = request.args.get("q", "").strip()
    sort_by = request.args.get("ordenar", "newest")

    products = []
    if query:
        products = ProductModel.get_all(only_active=True, search_term=query, sort_by=sort_by)

    return render_template(
        "search.html",
        query=query,
        products=products,
        current_sort=sort_by
    )
