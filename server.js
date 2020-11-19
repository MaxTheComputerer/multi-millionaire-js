#!/usr/bin/env node
// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var request = require('request');
var Cookie = require('request-cookies').Cookie;
var fs = require('fs');


const { v4: uuidv4 } = require('uuid');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 1080);
app.use('/static', express.static(__dirname + '/static'));
app.use('/assets', express.static(__dirname + '/static/assets'));
app.use('/hscripts', express.static(__dirname + '/host/scripts'));
app.use('/scripts', express.static(__dirname + '/single/scripts'));
app.use('/data', express.static(__dirname + '/host/data'));

// Routing
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(1080, function() {
	console.log('Starting server on port 1080');
});

var players = {};

// Add the WebSocket handlers
io.on('connection', function(socket) {

	var player = {};
	player.socket = socket;
	player.id = uuidv4();
	player.playing = false;
	player.hosting = false;
	player.game_id = null;
	players[player.id] = player;

	console.log('Connected '+player.id);

	socket.emit('connected', player.id);

	socket.on('disconnect', function() {
		if(player.hosting)
		{
			close_game(player.game_id);
		}
		if(player.playing)
		{
			leave_game(player.game_id, player.id);
		}
		delete players[player.id];
		console.log('Disconnected '+player.id);
	});

	socket.on('host_game', function() {
		if(host_game(player.id))
		{
			fs.readFile(__dirname + '/host/index.html', 'utf8', function(err, data){
				socket.emit('host_success', player.game_id, data);
			});
		}
	});

	socket.on('singleplayer_game', function() {
		fs.readFile(__dirname + '/single/index.html', 'utf8', function(err, data){
				socket.emit('single_success', data);
		});
	});

	socket.on('join_game', function(game_id) {
		if(game_id in games && join_game(game_id, player.id))
		{
			fs.readFile(__dirname + '/player/index.html', 'utf8', function(err, data){
				socket.emit('join_success', player.game_id, data);
			});
		}
		else
		{
			console.log('Game '+game_id+' doesn\'t exist');
		}
	});

	socket.on('leave_game', function() {
		leave_game(player.game_id, player.id);
	});

	socket.on('message', function(msg, data) {
		if(player.hosting)
		{
			message(player.game_id, msg, data);
		}
	});

	socket.on('log', function(data) {
		console.log(data);
	});

	socket.on('get_question', function(number) {
		if(number > 2 && number < 15)
		{
			if(Math.round(Math.random()) == 1)
			{
				get_external_question(number, socket);
			}
			else
			{
				get_internal_question(number, socket);
			}
		}
		else
		{
			get_external_question(number, socket);
		}
	});

	socket.on('get_phone', function(confidence, answers, main_answer, secondary_answer) {
		get_phone(confidence, socket, answers, main_answer, secondary_answer);
	})
});


// Game server

var games = {};

var game_id_counter = 0;

function host_game(host_id)
{
	var host = players[host_id];
	if(!host.playing && !host.hosting)
	{
		var game = {};
		game.id = game_id_counter;
		game_id_counter++;
		game.host = host_id;
		game.players = [];
		games[game.id] = game;
		host.hosting = true;
		host.game_id = game.id;
		console.log('New game: '+game.id+' hosted by '+host_id);
		return true;
	}
	else
	{
		console.log('Player '+host_id+' already in a game');
		return false;
	}
}

function join_game(game_id, player_id)
{
	var player = players[player_id];
	if(!player.playing && !player.hosting)
	{
		games[game_id].players.push(player_id);
		player.playing = true;
		player.game_id = game_id;
		console.log('Player '+player_id+' joined game '+game_id);
		return true;
	}
	else
	{
		console.log('Player '+player_id+' already in a game');
		return false;
	}
}

function leave_game(game_id, player_id)
{
	var player = players[player_id];
	if(player.playing)
	{
		player.playing = false;
		player.game_id = null;
		games[game_id].players.splice(games[game_id].players.indexOf(player_id), 1);
		console.log('Player '+player_id+' left game '+game_id);
	}
	else if(player.hosting)
	{
		close_game(game_id);
	}
}

function close_game(game_id)
{
	players[games[game_id].host].hosting = false;
	players[games[game_id].host].game_id = null;
	games[game_id].players.forEach(function(player_id) {
		players[player_id].playing = false;
		players[player_id].game_id = null;
		players[player_id].socket.emit('game_closed');
	})
	delete games[game_id];
	console.log('Closing game '+game_id);
}


function get_external_question(number, socket)
{
	var response = {};
	request('https://uk.wwbm.com/game/get-question/'+number, { json: true }, (err, res, body1) => {
		if (err)
		{
			console.log('error external question '+err);
			get_internal_question(number, socket);
			return;
		}
		response.success = true;
		response.question = body1;

		request('https://uk.wwbm.com', function (error, resp, body2) {
			if (!error && resp.statusCode == 200)
			{
				var rawcookies = resp.headers['set-cookie'];
				var xsrf;
				var wwbm;

				for (var i in rawcookies)
				{
					var cookie = new Cookie(rawcookies[i]);
					if(cookie.key == 'XSRF-TOKEN')
					{
						xsrf = cookie.value.replace(/%3D/g, '=');
					}
					else if(cookie.key == 'wwbm_session')
					{
						wwbm = cookie.value.replace(/%3D/g, '=');
					}
				}

				var options = {
					'method': 'POST',
					'url': 'https://uk.wwbm.com/game/get-answer',
					'headers': {
						'Cookie': 'XSRF-TOKEN='+xsrf+'; wwbm_session='+wwbm,
						'X-XSRF-TOKEN': xsrf,
						'Content-Type': 'application/json'
					},
					body: '{"question":'+JSON.stringify(response.question)+'}'
				};

				request(options, function(error2, respo, body3) {
					if(!body3.includes("<body>") && !error2)
					{
						response.answer = body3;
						socket.emit('get_question', response);
					}
					else
					{
						console.log('error external answer '+error2+response.question+xsrf+wwbm);
						get_internal_question(number, socket);
						return;
					}
				});
			}
			else
			{
				console.log('error external cookie '+error);
				get_internal_question(number, socket);
				return;
			}
		});

	});
}


function get_internal_question(number, socket)
{
	var response = {};

	if(number <= 5)
	{
		var difficulty = 0;
	}
	else if(number <= 10)
	{
		var difficulty = 1;
	}
	else
	{
		var difficulty = 2;
	}

	fs.readFile(__dirname + '/host/data/questions_'+difficulty+'.txt', 'utf8', function(err, data) {
		var lines = data.toString().split("\n");
		var line = lines[Math.floor(Math.random() * lines.length)];
		var q = line.split('**');
		response.question = JSON.parse('{"id":"'+q[0]+'","question":"'+q[1]+'","answers":[{"answer":"'+q[2]+'"},{"answer":"'+q[3]+'"},{"answer":"'+q[4]+'"},{"answer":"'+q[5]+'"}]}');
		response.answer = parseInt(q[6]) + 1;
		response.success = true;
		socket.emit('get_question', response);
	});
}

function get_phone(confidence, socket, answers, main_answer, secondary_answer)
{
	var response = {};
	fs.readFile(__dirname + '/host/data/phone_'+confidence+'.txt', 'utf8', function(err, data) {
		var lines = data.toString().split("\n");
		response.text = lines[Math.floor(Math.random() * lines.length)];
		response.success = true;
		socket.emit('get_phone', response, answers, main_answer, secondary_answer);
	});
}

function message(game_id, msg, data)
{
	games[game_id].players.forEach(function(player_id) {
		players[player_id].socket.emit(msg, data);
	});
}