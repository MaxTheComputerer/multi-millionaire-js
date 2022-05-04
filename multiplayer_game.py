import flask_socketio as s

class MultiplayerGame:

    def __init__(self, game_id):
        self.id = game_id
        self.host = str(self.id) + '_host'
        self.audience = str(self.id) + '_audience'
        self.spectators = str(self.id) + '_spectators'

    def join(self, name, role):
        room_name = str(self.id) + '_' + role
        s.join_room(self.id)
        s.join_room(room_name)
        s.emit('join_successful', {'game_id': self.id, 'room_name': room_name, 'role': role})
        s.emit('new_player', {'name': name, 'role': role}, to=self.id)

    def leave(self):
        for room in s.rooms:
            s.leave_room(room)

    def close(self):
        s.send('game_closed')
        s.close_room(self.id)
        s.close_room(self.host)
        s.close_room(self.audience)
        s.close_room(self.spectators)
