from flask import Flask, render_template, request, redirect, url_for, flash, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os

# Directories for templates and static files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_DIR = os.path.join(BASE_DIR, 'Frontends')
STATIC_DIR = os.path.join(TEMPLATE_DIR, 'css')

app = Flask(
    __name__,
    template_folder=TEMPLATE_DIR,
    static_folder=STATIC_DIR,
    static_url_path='/css'
)
app.secret_key = os.urandom(24)  # Secure session key

DB_FILE = "users.db"

# Initialize DB if it doesn't exist
def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                country TEXT,
                interest TEXT
            )
        ''')
    print("Database initialized.")

# Register route
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        email = request.form.get("email")
        password = request.form.get("password")
        confirm_password = request.form.get("confirm_password")
        country = request.form.get("country")
        interest = request.form.get("interest")

        if password != confirm_password:
            flash("Passwords do not match!", "error")
            return redirect(url_for("register"))

        password_hash = generate_password_hash(password)

        try:
            with sqlite3.connect(DB_FILE) as conn:
                conn.execute(
                    "INSERT INTO users (first_name, last_name, email, password_hash, country, interest) VALUES (?, ?, ?, ?, ?, ?)",
                    (first_name, last_name, email, password_hash, country, interest)
                )
            flash("Account created successfully!", "success")
            return redirect(url_for("login"))
        except sqlite3.IntegrityError:
            flash("Email already exists!", "error")
            return redirect(url_for("register"))

    return render_template("register.html")

# Login route
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.execute("SELECT id, password_hash FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()

        if user and check_password_hash(user[1], password):
            session["user_id"] = user[0]
            flash("Login successful!", "success")
            return redirect(url_for("dashboard"))
        else:
            flash("Invalid email or password.", "error")
            return redirect(url_for("login"))

    return render_template("login.html")

# Dashboard
@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return "Welcome to your dashboard!"

# Logout
@app.route("/logout")
def logout():
    session.pop("user_id", None)
    flash("Logged out successfully.", "info")
    return redirect(url_for("login"))

# Static pages
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/features')
def features():
    return render_template('features.html')

@app.route('/explore')
def explore():
    return render_template('explore.html')

@app.route('/blog')
def blog():
    return render_template('blog.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
