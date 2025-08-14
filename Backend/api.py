from flask import Flask, jsonify, send_from_directory

app = Flask(
    __name__,
    static_folder='../Frontends',          # Serve static files from Frontends
    static_url_path=''                     # So /index.html works
)

@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    # Serve any file from Frontends (including css/styles.css)
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
    app.run(debug=True)