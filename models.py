"""
Data models and repository helpers for CORUJA ACHOU.
Provides clean abstraction over SQLite operations with parameter sanitization.
"""
import re
import json
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
from database import get_db_connection

def slugify(text):
    """Generates an SEO-friendly URL slug from string."""
    if not text:
        return ""
    text = text.lower().strip()
    # Replace accented characters
    replacements = {
        'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
        'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
        'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
        'ç': 'c', 'ñ': 'n'
    }
    for orig, rep in replacements.items():
        text = text.replace(orig, rep)
    # Replace non-alphanumeric with hyphens
    text = re.sub(r'[^a-z0-9]+', '-', text)
    # Strip leading/trailing hyphens
    return text.strip('-')

class CategoryModel:
    @staticmethod
    def get_all(only_active=False):
        conn = get_db_connection()
        query = """
            SELECT c.*, COUNT(p.id) AS product_count 
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.active = 1
        """
        if only_active:
            query += " WHERE c.active = 1 "
        query += " GROUP BY c.id ORDER BY c.id ASC"
        rows = conn.execute(query).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_by_id(cat_id):
        conn = get_db_connection()
        row = conn.execute("SELECT * FROM categories WHERE id = ?", (cat_id,)).fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_by_slug(slug):
        conn = get_db_connection()
        row = conn.execute("SELECT * FROM categories WHERE slug = ?", (slug,)).fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def create(name, slug=None, description="", icon="🦉", image="", active=1):
        if not slug:
            slug = slugify(name)
        conn = get_db_connection()
        # Ensure unique slug
        base_slug = slug
        counter = 1
        while conn.execute("SELECT 1 FROM categories WHERE slug = ?", (slug,)).fetchone():
            slug = f"{base_slug}-{counter}"
            counter += 1

        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO categories (name, slug, description, icon, image, active)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (name, slug, description, icon, image, int(active)))
        cat_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return cat_id

    @staticmethod
    def update(cat_id, name, slug=None, description="", icon="🦉", image="", active=1):
        if not slug:
            slug = slugify(name)
        conn = get_db_connection()
        # Ensure unique slug excluding current
        base_slug = slug
        counter = 1
        while conn.execute("SELECT 1 FROM categories WHERE slug = ? AND id != ?", (slug, cat_id)).fetchone():
            slug = f"{base_slug}-{counter}"
            counter += 1

        conn.execute("""
            UPDATE categories
            SET name = ?, slug = ?, description = ?, icon = ?, image = ?, active = ?
            WHERE id = ?
        """, (name, slug, description, icon, image, int(active), cat_id))
        conn.commit()
        conn.close()
        return True

    @staticmethod
    def delete(cat_id):
        conn = get_db_connection()
        # Count products
        prod_count = conn.execute("SELECT COUNT(*) AS count FROM products WHERE category_id = ?", (cat_id,)).fetchone()["count"]
        if prod_count > 0:
            conn.close()
            return False, f"Esta categoria possui {prod_count} produto(s) vinculado(s). Reatribua ou exclua os produtos antes de excluir a categoria."
        
        conn.execute("DELETE FROM categories WHERE id = ?", (cat_id,))
        conn.commit()
        conn.close()
        return True, "Categoria excluída com sucesso."

    @staticmethod
    def toggle_active(cat_id):
        conn = get_db_connection()
        row = conn.execute("SELECT active FROM categories WHERE id = ?", (cat_id,)).fetchone()
        if row:
            new_val = 0 if row["active"] == 1 else 1
            conn.execute("UPDATE categories SET active = ? WHERE id = ?", (new_val, cat_id))
            conn.commit()
            conn.close()
            return new_val
        conn.close()
        return None

class ProductModel:
    @staticmethod
    def get_all(only_active=False, category_id=None, featured=None, trending=None, search_term=None, sort_by="newest"):
        conn = get_db_connection()
        query = """
            SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        """
        params = []

        if only_active:
            query += " AND p.active = 1 AND c.active = 1 "

        if category_id:
            query += " AND p.category_id = ? "
            params.append(category_id)

        if featured is not None:
            query += " AND p.featured = ? "
            params.append(int(featured))

        if trending is not None:
            query += " AND p.trending = ? "
            params.append(int(trending))

        if search_term:
            query += " AND (p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ? OR c.name LIKE ?) "
            term = f"%{search_term}%"
            params.extend([term, term, term, term])

        # Sorting logic
        if sort_by == "newest":
            query += " ORDER BY p.id DESC"
        elif sort_by == "popular":
            query += " ORDER BY p.sales_count DESC, p.rating DESC"
        elif sort_by == "score":
            query += " ORDER BY p.trend_score DESC"
        elif sort_by == "price_asc":
            query += " ORDER BY p.price ASC"
        elif sort_by == "price_desc":
            query += " ORDER BY p.price DESC"
        elif sort_by == "discount":
            query += " ORDER BY p.discount DESC"
        else:
            query += " ORDER BY p.id DESC"

        rows = conn.execute(query, params).fetchall()
        conn.close()
        result = []
        for r in rows:
            p = dict(r)
            try:
                p["additional_images_list"] = json.loads(p.get("additional_images") or "[]")
            except Exception:
                p["additional_images_list"] = []
            result.append(p)
        return result

    @staticmethod
    def get_featured(limit=8):
        conn = get_db_connection()
        query = """
            SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.active = 1 AND c.active = 1 AND p.featured = 1
            ORDER BY p.id DESC
            LIMIT ?
        """
        rows = conn.execute(query, (limit,)).fetchall()
        conn.close()
        result = []
        for r in rows:
            p = dict(r)
            try:
                p["additional_images_list"] = json.loads(p.get("additional_images") or "[]")
            except Exception:
                p["additional_images_list"] = []
            result.append(p)
        return result

    @staticmethod
    def get_trending(limit=8):
        conn = get_db_connection()
        query = """
            SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.active = 1 AND c.active = 1 AND p.trending = 1
            ORDER BY p.trend_score DESC, p.sales_count DESC
            LIMIT ?
        """
        rows = conn.execute(query, (limit,)).fetchall()
        conn.close()
        result = []
        for r in rows:
            p = dict(r)
            try:
                p["additional_images_list"] = json.loads(p.get("additional_images") or "[]")
            except Exception:
                p["additional_images_list"] = []
            result.append(p)
        return result

    @staticmethod
    def get_by_id(product_id):
        conn = get_db_connection()
        query = """
            SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        """
        row = conn.execute(query, (product_id,)).fetchone()
        conn.close()
        if not row:
            return None
        p = dict(row)
        try:
            p["additional_images_list"] = json.loads(p.get("additional_images") or "[]")
        except Exception:
            p["additional_images_list"] = []
        return p

    @staticmethod
    def get_by_slug(slug):
        conn = get_db_connection()
        query = """
            SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.slug = ?
        """
        row = conn.execute(query, (slug,)).fetchone()
        conn.close()
        if not row:
            return None
        p = dict(row)
        try:
            p["additional_images_list"] = json.loads(p.get("additional_images") or "[]")
        except Exception:
            p["additional_images_list"] = []
        return p

    @staticmethod
    def get_related(product_id, category_id, limit=4):
        conn = get_db_connection()
        query = """
            SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.active = 1 AND c.active = 1 AND p.category_id = ? AND p.id != ?
            ORDER BY p.trend_score DESC, p.id DESC
            LIMIT ?
        """
        rows = conn.execute(query, (category_id, product_id, limit)).fetchall()
        conn.close()
        result = []
        for r in rows:
            p = dict(r)
            try:
                p["additional_images_list"] = json.loads(p.get("additional_images") or "[]")
            except Exception:
                p["additional_images_list"] = []
            result.append(p)
        return result

    @staticmethod
    def create(data):
        name = data.get("name", "").strip()
        slug = data.get("slug") or slugify(name)
        description = data.get("description", "").strip()
        short_description = data.get("short_description", "").strip()
        category_id = int(data.get("category_id"))
        image = data.get("image", "").strip()
        additional_images = data.get("additional_images", "[]")
        if isinstance(additional_images, list):
            additional_images = json.dumps(additional_images)

        price = float(data.get("price") or 0.0)
        old_price = float(data.get("old_price")) if data.get("old_price") else None
        
        # Calculate discount
        discount = int(data.get("discount") or 0)
        if old_price and old_price > price:
            calculated_discount = round(((old_price - price) / old_price) * 100)
            if calculated_discount > 0:
                discount = calculated_discount

        rating = float(data.get("rating") or 5.0)
        sales_count = int(data.get("sales_count") or 0)
        trend_score = int(data.get("trend_score") or 85)
        affiliate_url = data.get("affiliate_url", "").strip()
        featured = 1 if data.get("featured") else 0
        trending = 1 if data.get("trending") else 0
        active = 1 if data.get("active") is None or data.get("active") else 0

        conn = get_db_connection()
        # Ensure unique slug
        base_slug = slug
        counter = 1
        while conn.execute("SELECT 1 FROM products WHERE slug = ?", (slug,)).fetchone():
            slug = f"{base_slug}-{counter}"
            counter += 1

        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO products (
                name, slug, description, short_description, category_id,
                image, additional_images, price, old_price, discount,
                rating, sales_count, trend_score, affiliate_url,
                featured, trending, active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            name, slug, description, short_description, category_id,
            image, additional_images, price, old_price, discount,
            rating, sales_count, trend_score, affiliate_url,
            featured, trending, active
        ))
        product_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return product_id

    @staticmethod
    def update(product_id, data):
        name = data.get("name", "").strip()
        slug = data.get("slug") or slugify(name)
        description = data.get("description", "").strip()
        short_description = data.get("short_description", "").strip()
        category_id = int(data.get("category_id"))
        image = data.get("image", "").strip()
        additional_images = data.get("additional_images", "[]")
        if isinstance(additional_images, list):
            additional_images = json.dumps(additional_images)

        price = float(data.get("price") or 0.0)
        old_price = float(data.get("old_price")) if data.get("old_price") else None

        discount = int(data.get("discount") or 0)
        if old_price and old_price > price:
            calculated_discount = round(((old_price - price) / old_price) * 100)
            if calculated_discount > 0:
                discount = calculated_discount

        rating = float(data.get("rating") or 5.0)
        sales_count = int(data.get("sales_count") or 0)
        trend_score = int(data.get("trend_score") or 85)
        affiliate_url = data.get("affiliate_url", "").strip()
        featured = 1 if data.get("featured") else 0
        trending = 1 if data.get("trending") else 0
        active = 1 if data.get("active") else 0

        conn = get_db_connection()
        # Ensure unique slug excluding current
        base_slug = slug
        counter = 1
        while conn.execute("SELECT 1 FROM products WHERE slug = ? AND id != ?", (slug, product_id)).fetchone():
            slug = f"{base_slug}-{counter}"
            counter += 1

        conn.execute("""
            UPDATE products
            SET name = ?, slug = ?, description = ?, short_description = ?, category_id = ?,
                image = ?, additional_images = ?, price = ?, old_price = ?, discount = ?,
                rating = ?, sales_count = ?, trend_score = ?, affiliate_url = ?,
                featured = ?, trending = ?, active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            name, slug, description, short_description, category_id,
            image, additional_images, price, old_price, discount,
            rating, sales_count, trend_score, affiliate_url,
            featured, trending, active, product_id
        ))
        conn.commit()
        conn.close()
        return True

    @staticmethod
    def delete(product_id):
        conn = get_db_connection()
        conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
        conn.commit()
        conn.close()
        return True

    @staticmethod
    def toggle_active(product_id):
        conn = get_db_connection()
        row = conn.execute("SELECT active FROM products WHERE id = ?", (product_id,)).fetchone()
        if row:
            new_val = 0 if row["active"] == 1 else 1
            conn.execute("UPDATE products SET active = ? WHERE id = ?", (new_val, product_id))
            conn.commit()
            conn.close()
            return new_val
        conn.close()
        return None

class UserModel:
    @staticmethod
    def get_by_username(username):
        conn = get_db_connection()
        row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def verify_password(stored_hash, password):
        return check_password_hash(stored_hash, password)

    @staticmethod
    def update_password(user_id, new_password):
        conn = get_db_connection()
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (generate_password_hash(new_password), user_id))
        conn.commit()
        conn.close()
        return True

class SettingsModel:
    @staticmethod
    def get_all():
        conn = get_db_connection()
        rows = conn.execute("SELECT key, value FROM settings").fetchall()
        conn.close()
        return {r["key"]: r["value"] for r in rows}

    @staticmethod
    def get(key, default=""):
        conn = get_db_connection()
        row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
        conn.close()
        return row["value"] if row else default

    @staticmethod
    def update_many(settings_dict):
        conn = get_db_connection()
        for k, v in settings_dict.items():
            conn.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, str(v)))
        conn.commit()
        conn.close()
        return True

class StatsModel:
    @staticmethod
    def get_admin_dashboard_stats():
        conn = get_db_connection()
        total_products = conn.execute("SELECT COUNT(*) AS c FROM products").fetchone()["c"]
        total_categories = conn.execute("SELECT COUNT(*) AS c FROM categories").fetchone()["c"]
        featured_products = conn.execute("SELECT COUNT(*) AS c FROM products WHERE featured = 1").fetchone()["c"]
        trending_products = conn.execute("SELECT COUNT(*) AS c FROM products WHERE trending = 1").fetchone()["c"]
        active_products = conn.execute("SELECT COUNT(*) AS c FROM products WHERE active = 1").fetchone()["c"]
        inactive_products = conn.execute("SELECT COUNT(*) AS c FROM products WHERE active = 0").fetchone()["c"]
        conn.close()
        return {
            "total_products": total_products,
            "total_categories": total_categories,
            "featured_products": featured_products,
            "trending_products": trending_products,
            "active_products": active_products,
            "inactive_products": inactive_products,
        }
