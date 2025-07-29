print("")
from flask import Flask, request, jsonify

app = Flask(__name__)

# Sample in-memory data store
data_store = []

# GET endpoint
@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify(data_store), 200

# POST endpoint
@app.route('/api/data', methods=['POST'])
def add_data():
    content = request.json
    if not content:
        return jsonify({"error": "No JSON data provided"}), 400

    data_store.append(content)
    return jsonify({"message": "Data added", "data": content}), 201

if __name__ == '__main__':
    app.run(debug=True)
