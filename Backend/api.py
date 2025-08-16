from flask import Flask, jsonify, send_from_directory, session, redirect, url_for
from auth import auth_bp, init_db

app = Flask(
    __name__,
    static_folder='../Frontends',
    static_url_path=''
)

# Needed for sessions
app.secret_key = "super-secret-key"  # ⚠️ change this to a secure random value

# Register auth blueprint
app.register_blueprint(auth_bp)


@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:filename>')
def static_files(filename):
    # Public pages (index, register, login, features, css, js, etc.)
    if filename.startswith("bot/"):  
        # Any attempt to access /bot/* requires login
        if 'user_id' not in session:
            return redirect(url_for('static_files', filename='login.html'))
    return send_from_directory(app.static_folder, filename)


@app.route('/api/features')
def features():
    return jsonify([
        {
            "mode": "Educator",
            "description": "Learn about different cultures, traditions, and historical contexts through interactive lessons and detailed explanations.",
            "url": "/features.html#educator"
        },
        {
            "mode": "Storyteller",
            "description": "Immerse yourself in captivating cultural stories, folklore, and legends from around the world.",
            "url": "/features.html#storyteller"
        },
        {
            "mode": "Personal Assistant",
            "description": "Get personalized cultural insights, travel recommendations, and cultural etiquette guidance.",
            "url": "/features.html#assistant"
        }
    ])


if __name__ == '__main__':
    init_db()  # Ensure DB initialized
    app.run(host='0.0.0.0',debug=True)
