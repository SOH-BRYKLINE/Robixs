from flask import Flask, render_template, request, redirect, url_for
import os

# Set the template and static folders to the shared Frontends directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_DIR = os.path.join(BASE_DIR, 'Frontends')
STATIC_DIR = os.path.join(TEMPLATE_DIR, 'css')

app = Flask(
    __name__,
    template_folder=TEMPLATE_DIR,
    static_folder=STATIC_DIR,
    static_url_path='/css'
)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)