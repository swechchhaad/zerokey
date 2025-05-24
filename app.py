from flask import Flask, request, jsonify
from sklearn.neighbors import KNeighborsClassifier
import numpy as np

app = Flask(__name__)

X_train = [
    [120, 110, 140],  # User A
    [200, 180, 220]   # User B
]
y_train = ['userA', 'userB']

knn = KNeighborsClassifier(n_neighbors=1)
knn.fit(X_train, y_train)

@app.route('/verify', methods=['POST'])
def verify():
    data = request.get_json()
    vector = data['vector']

    try:
        prediction = knn.predict([vector])[0]
        return jsonify({ "result": "match", "user": prediction })
    except Exception as e:
        return jsonify({ "result": "error", "message": str(e) })

if __name__ == '__main__':
    app.run(debug=True)