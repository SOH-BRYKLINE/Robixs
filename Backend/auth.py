import sqlite3
from flask import Blueprint, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)
DB_PATH = 'users.db'


def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            country TEXT,
            interest TEXT
        )
    ''')
    conn.commit()
    conn.close()


@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() if request.is_json else request.form

    required = ['first_name', 'last_name', 'email', 'password', 'country', 'interest']
    if not all(k in data and data[k] for k in required):
        return jsonify({'success': False, 'message': 'Missing fields'}), 400

    hashed_pw = generate_password_hash(data['password'])
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''
            INSERT INTO users (first_name, last_name, email, password, country, interest)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data['first_name'],
            data['last_name'],
            data['email'].lower(),
            hashed_pw,
            data['country'],
            data['interest']
        ))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Registration successful! Please log in.'})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Email already registered.'}), 409


@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() if request.is_json else request.form

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Missing email or password'}), 400

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, password, first_name FROM users WHERE email = ?', (email,))
    user = c.fetchone()
    conn.close()

    if user:
        user_id, hashed_pw, first_name = user
        if check_password_hash(hashed_pw, password):
            # 🔑 store session
            session['user_id'] = user_id
            session['first_name'] = first_name
            return jsonify({'success': True, 'message': f'Welcome, {first_name}!'})
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    else:
        return jsonify({'success': False, 'message': 'User not found'}), 404


@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})
