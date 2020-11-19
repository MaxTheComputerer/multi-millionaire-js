async function get_question()
{
	lnext();
	await clear_question();

	if(question_number > 5 || question_number == 1)
	{
		letsplay_music = playsound(sounds.questions.letsplay[question_number]);
		if(hotseat_music.playing)
		{
			stopsound(hotseat_music);
		}
		if(correct_sound && correct_sound.playing)
		{
			stopsound(correct_sound);
		}

		await sleep(1000);
		display_background();
	}

	snext("fetch_next_question()");
	unext();
}

function fetch_next_question()
{
	if(!next_locked)
	{
		lnext();
		if(!question_music || !question_music.playing)
		{
			question_music = playsound(sounds.questions.music[question_number], loop = true);
		}
		if(letsplay_music.playing)
		{
			stopsound(letsplay_music);
		}
		socket.emit('get_question', question_number);
	}
}

socket.on('get_question', function(data) {
	load_question(data);
});

function load_question(data)
{
	var question_decode = null;
	var response = data;
	
	if(response["success"])
	{
		question_decode = response['question'];
		question_id = question_decode["id"].toString();

		if(used_questions.includes(question_id))
		{
			socket.emit('get_question', question_number);
		}
		else
		{
			set_question_used(question_decode, response);
		}
	}
	else
	{
		console.log(response['msg']);
	}
}

function set_question_used(question_decode, response)
{
	used_questions.push(question_id);
	display_question(question_decode, response);
}

async function display_question(question_decode, response)
{
	question = question_decode["question"];
	opt_0 = question_decode['answers'][0]['answer'];
	opt_1 = question_decode['answers'][1]['answer'];
	opt_2 = question_decode['answers'][2]['answer'];
	opt_3 = question_decode['answers'][3]['answer'];
	answer = response['answer']-1;
	
	socket.emit('message', 'display_question', question);
	$('#question').text(question);

	snext('display_opt_0()');
	unext();
}

function display_opt_0()
{
	lnext();
	socket.emit('message', 'display_opt_0', opt_0);
	$('#opt_0').text(opt_0);
	snext('display_opt_1()');
	unext();
}

function display_opt_1()
{
	lnext();
	socket.emit('message', 'display_opt_1', opt_1);
	$('#opt_1').text(opt_1);
	snext('display_opt_2()');
	unext();
}

function display_opt_2()
{
	lnext();
	socket.emit('message', 'display_opt_2', opt_2);
	$('#opt_2').text(opt_2);
	snext('display_opt_3()');
	unext();
}

async function display_opt_3()
{
	lnext();
	socket.emit('message', 'display_opt_3', opt_3);
	$('#opt_3').text(opt_3);
	snext('check_answer()');
	unlock();
}


function display_background()
{
	if(question_number <= 5)
	{
		$('#background').addClass('bg-1');
		socket.emit('message', 'display_background_1');
	}
	else if(question_number <= 10)
	{
		$('#background').addClass('bg-2');
		socket.emit('message', 'display_background_2');
	}
	else
	{
		$('#background').addClass('bg-3');
		socket.emit('message', 'display_background_3');
	}
}

function remove_background()
{
	$('#background').removeClass('bg-1').removeClass('bg-2').removeClass('bg-3');
	socket.emit('message', 'remove_background');
}



function clear_question()
{
	socket.emit('message', 'clear_question');
	$('.answ_inside').removeClass('answ_true').removeClass('answ_selected');
	$('.answ').removeClass('removed-5050');
	$('#question').text('');
	$('#opt_0').text('');
	$('#opt_1').text('');
	$('#opt_2').text('');
	$('#opt_3').text('');
	selected = null;
	question = null;
	question_id = null;
	opt_0 = null;
	opt_1 = null;
	opt_2 = null;
	opt_3 = null;
	answer = null;
	removed_5050 = [];
}



async function select_option(option)
{
	if(!locked && !removed_5050.includes(option))
	{
		await lock();
		selected = option;
		socket.emit('message', 'select_option', option);
		$('#opt_'+option).parentsUntil('.answ', '.answ_inside').addClass('answ_selected');

		if(question_number > 5)
		{
			final_sound = playsound(sounds.questions.final[question_number]);
			stopsound(question_music);
			host_display_correct_answer();
			unext();
		}
		else
		{
			check_answer();
		}
	}
}



async function check_answer()
{
	lnext();
	if(question_number == 5)
	{
		stopsoundnow(question_music);
	}

	if(selected == answer)
	{
		correct_sound = playsound(sounds.questions.correct[question_number]);
		if(final_sound && final_sound.playing)
		{
			stopsound(final_sound);
		}

		display_correct_answer();

		await sleep(3000);
		socket.emit('message', 'set_ladder_current', question_number);
		$('#'+(question_number-1)).removeClass('current');
		$('#'+question_number).addClass('current');

		$('#quest-row').css('display', 'none');

		if(question_number == 15)
		{
			win();
		}
		else
		{
			var prize = prizes[question_number - 1];
			socket.emit('message', 'winnings', prize);
			$('#winnings-row').css('display', 'block');
			$('#winnings-text').text(prize);
		}
		

		if(question_number == 5 || question_number == 10)
		{
			await sleep(5000);
		}
		else
		{
			await sleep(2000);
		}

		socket.emit('message', 'setup_next_question', question_number);
		$('#winnings-row').css('display', 'none');


		if(question_number < 15)
		{
			$('#quest-row').css('display', 'block');
			question_number++;
			get_question();
		}
	}
	else
	{
		incorrect_sound = playsound(sounds.questions.incorrect[question_number]);
		if(final_sound && final_sound.playing)
		{
			stopsound(final_sound);
		}
		if(question_music && question_music.playing)
		{
			stopsoundnow(question_music);
		}
		
		display_correct_answer();

		if(question_number == 15)
		{
			await sleep(8000);
		}
		else
		{
			await sleep(4000);
		}

		snext('game_over_incorrect()');
		unext();
	}
}



async function display_correct_answer()
{
	if(question_number >= 5)
	{
		remove_background();
	}
	socket.emit('message', 'display_correct_answer', answer);
	for (var i = 0; i < 5; i++) {
		$('#opt_'+answer).parentsUntil('.answ', '.answ_inside').addClass('answ_true');
		await sleep(150);
		$('.answ_inside').removeClass('answ_true');
		await sleep(150);
	}
	$('#opt_'+answer).parentsUntil('.answ', '.answ_inside').addClass('answ_true');
}

async function host_display_correct_answer()
{
	$('#opt_'+answer).parentsUntil('.answ', '.answ_inside').addClass('answ_true');
}



function lock()
{
	locked = true;
	$('.answ').removeClass('ahov');
	$('.l-5050').removeClass('lhov');
	$('.l-phone').removeClass('lhov');
	$('.l-audience').removeClass('lhov');
	$('#walk-away-button').removeClass('enabled');
}



function unlock()
{
	$('.answ:not(.removed-5050)').addClass('ahov');
	$('.l-5050:not(.used)').addClass('lhov');
	$('.l-phone:not(.used)').addClass('lhov');
	$('.l-audience:not(.used)').addClass('lhov');
	if(question_number > 1)
	{
		$('#walk-away-button').addClass('enabled');
	}
	locked = false;
}

function lnext()
{
	$('#next-button').removeClass('enabled');
	next_locked = true;
}

function unext()
{
	$('#next-button').addClass('enabled');
	next_locked = false;
}

function snext(command)
{
	$('#next-button').attr('onclick', command);
}