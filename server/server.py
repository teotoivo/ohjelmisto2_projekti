from flask import Flask, request
import mysql.connector
from flask_cors import CORS

#read from file sql_cred.json and i file doesnt exist throw a custom error
import json
try:
    with open('sql_cred.json') as f:
        data = json.load(f)
        host = data['host']
        port = data['port']
        user = data['user']
        password = data['password']
        database = data['database']
except FileNotFoundError:
    raise FileNotFoundError("sql_cred.json not found")



home_airport = 'EFHK'

connection = mysql.connector.connect(
    host=host,
    port=port,
    user=user,
    password=password,
    database=database
)
cursor = connection.cursor(dictionary=True)

app = Flask(__name__)
CORS(app)

@app.route('/get_start_and_end_airports', methods=['GET'])
def get_start_and_end_airports():
    # alloved airport types are small_airport medium_airport large_airport
    cursor.execute("SELECT * FROM airport WHERE type IN ('small_airport', 'medium_airport', 'large_airport') ORDER BY RAND() LIMIT 1;")
    end_airport = cursor.fetchone()
    return {
        'start_airport': home_airport,
        'end_airport': end_airport['ident']
    }

@app.route("/does_game_exist", methods=['POST'])
def does_game_exist():
    data = request.json

    cursor.execute("SELECT * FROM game_data WHERE player_name = %s", (data['name'],))
    game = cursor.fetchone()

    return {
        "exists": game is not None
    }

@app.route("/create_new_game", methods=['POST'])
def create_new_game():
    data = request.json

    cursor.execute("INSERT INTO game_data (player_name, home_airport_ident, current_airport_ident, destination_airport_ident, total_distance, co2_consumed) VALUES (%s, %s, %s, %s, %s, %s)", (
        data['name'],
        data["start_airport"],
        data["start_airport"],
        data["end_airport"],
        0,
        0
    ))
    connection.commit()

    return {
        "success": True
    }

@app.route("/get_all_small_airports", methods=['GET'])
def get_all_small_airports():
    cursor.execute("SELECT * FROM airport WHERE type = 'small_airport'")
    airports = cursor.fetchall()
    return {
        "airports": airports
    }

@app.route("/get_all_medium_airports", methods=['GET'])
def get_all_medium_airports():
    cursor.execute("SELECT * FROM airport WHERE type = 'medium_airport'")
    airports = cursor.fetchall()
    return {
        "airports": airports
    }

@app.route("/get_all_large_airports", methods=['GET'])
def get_all_large_airports():
    cursor.execute("SELECT * FROM airport WHERE type = 'large_airport'")
    airports = cursor.fetchall()
    return {
        "airports": airports
    }

@app.route("/get_game_data", methods=['POST'])
def get_game_data():
    name = request.json['name']
    cursor.execute("SELECT * FROM game_data WHERE player_name = %s", (name,))
    game = cursor.fetchone()
    return game

@app.route("/get_airport", methods=['POST'])
def get_airport():
    ident = request.json['ident']
    cursor.execute("SELECT * FROM airport WHERE ident = %s", (ident,))
    airport = cursor.fetchone()
    return airport




if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)