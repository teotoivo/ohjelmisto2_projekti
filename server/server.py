from flask import Flask, request
import mysql.connector
from flask_cors import CORS
import math

home_airport = 'EFHK'

connection = mysql.connector.connect(
    host="localhost",
    port="3306",
    user="root",
    password="password",
    database="flight_game"
)
cursor = connection.cursor(dictionary=True)

app = Flask(__name__)
CORS(app)

@app.route('/get_start_and_end_airports', methods=['GET'])
def get_start_and_end_airports():
    cursor.execute("SELECT * FROM airport ORDER BY RAND() LIMIT 1")
    end_airport = cursor.fetchone()
    return {
        'start_airport': home_airport,
        'end_airport': end_airport['ident']
    }

@app.route("/does_game_exist", methods=['POST'])
def does_game_exist():
    data = request.json
    return {
        'game_exists': data
    }

if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)