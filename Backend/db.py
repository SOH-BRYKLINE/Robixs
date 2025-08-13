from flask import Flask, render_template, request, redirect, url_for, flash, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)  # secure session key

DB_FILE = "users.db"

# Create DB if not exists
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

@app.route("/register", methods=["POST"])
def register():
    first_name = request.form.get("first_name")
    last_name = request.form.get("last_name")
    email = request.form.get("email")
    password = request.form.get("password")
    confirm_password = request.form.get("confirm_password")
    country = request.form.get("country")
    interest = request.form.get("interest")

    if password != confirm_password:
        flash("Passwords do not match!", "error")
        return redirect(url_for("show_register_form"))

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
        return redirect(url_for("show_register_form"))

@app.route("/register", methods=["GET"])
def show_register_form():
    return render_template("register.html")  # You replace with your own HTML

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

    return render_template("login.html")  # You replace with your HTML

@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return "Welcome to your dashboard!"

@app.route("/logout")
def logout():
    session.pop("user_id", None)
    flash("Logged out successfully.", "info")
    return redirect(url_for("login"))

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
