from flask import (Flask, redirect, render_template, request,
                   send_from_directory, session, url_for)
from flask_socketio import SocketIO
from markupsafe import escape

from multiplayer_game import MultiplayerGame
import random

app = Flask(__name__)
app.secret_key = 'BAD_SECRET_KEY'
socketio = SocketIO(app)

games = {}

# Routing

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/multiplayer/host')
def host():
    return render_template("host.html.jinja")

@app.route('/multiplayer/audience/<int:game_id>')
def audience(game_id):
    return render_template('audience.html.jinja', game_id=game_id)

@app.route('/assets/<path:path>')
def send_img(path):
    return send_from_directory('assets', path)


# Connection

@socketio.on('connect')
def connect():
    print('Client connected')

@socketio.on('disconnect')
def disconnect():
    print('Client disconnected')


# Game management

@socketio.event
def host_game(name):
    game = MultiplayerGame(generate_game_id())
    games[game.id] = game
    join_game(game.id, name, 'host')
    print(name, 'hosting new game', game.id)

@socketio.event
def join_game(game_id, name, role):
    if game_id in games.keys():
        games[game_id].join(name, role)
    else:
        print('Game not found')

def generate_game_id():
    id = random.randint(1000, 9999)
    while id in games.keys():
        id = random.randint(1000, 9999)
    return id



if __name__ == '__main__':
    socketio.run(app, debug=True, log_output=False) 
