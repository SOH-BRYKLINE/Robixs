from flask import Flask, request, jsonify, render_template_string
import sqlite3

app = Flask(__name__)
DATABASE = 'database.db'

# ---------------------------
# Helper function to get DB
# ---------------------------
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # rows behave like dictionaries
    return conn

# ---------------------------
# Initialize Database
# ---------------------------
def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            message TEXT
        );
    ''')
    conn.commit()
    conn.close()

# ---------------------------
# HTML Form Template
# ---------------------------
HTML_FORM = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Form</title>
</head>
<body>
    <h1>Register User</h1>
    <form method="POST" action="/add_user">
        <label>Name:</label><br>
        <input type="text" name="name" required><br><br>

        <label>Email:</label><br>
        <input type="email" name="email" required><br><br>

        <label>Message:</label><br>
        <textarea name="message"></textarea><br><br>

        <button type="submit">Submit</button>
    </form>
    <hr>
    <h2>All Users</h2>
    <ul>
        {% for user in users %}
            <li>{{ user['name'] }} ({{ user['email'] }}) - {{ user['message'] }}</li>
        {% endfor %}
    </ul>
</body>
</html>
"""

# ---------------------------
# Routes
# ---------------------------

@app.route('/', methods=['GET'])
def home():
    conn = get_db_connection()
    users = conn.execute("SELECT * FROM users").fetchall()
    conn.close()
    return render_template_string(HTML_FORM, users=users)

@app.route('/add_user', methods=['POST'])
def add_user():
    name = request.form.get('name')
    email = request.form.get('email')
    message = request.form.get('message')

    if not name or not email:
        return jsonify({"error": "Name and email are required"}), 400

    conn = get_db_connection()
    try:
        conn.execute("INSERT INTO users (name, email, message) VALUES (?, ?, ?)", (name, email, message))
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists"}), 400
    finally:
        conn.close()

    return jsonify({"message": "User added successfully"})

@app.route('/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    users = conn.execute("SELECT * FROM users").fetchall()
    conn.close()
    return jsonify([dict(row) for row in users])

# ---------------------------
# Main entry
# ---------------------------
if __name__ == '__main__':
    init_db()  # Ensure table exists before running
    app.run(debug=True)
