from flask import Blueprint, request, jsonify
import sqlite3
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
    data = request.json
    required = ['first_name', 'last_name', 'email', 'password', 'country', 'interest']
    if not all(k in data for k in required):
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
        return jsonify({'success': True, 'message': 'Registration successful!'})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Email already registered.'}), 409

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if not data.get('email') or not data.get('password'):
        return jsonify({'success': False, 'message': 'Missing email or password'}), 400

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, password, first_name FROM users WHERE email = ?', (data['email'].lower(),))
    user = c.fetchone()
    conn.close()
    if user and check_password_hash(user[1], data['password']):
        return jsonify({'success': True, 'message': f'Welcome, {user[2]}!'})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401