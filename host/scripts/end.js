async function game_over_incorrect()
{
	lnext();
	var gameover = playsound(sounds.music.gameover);
	$('#quest-row').css('display', 'none');
	$('#game-over-row').css('display', 'block');
	if(question_number <= 5)
	{
		var prize = '£0';
	}
	else if(question_number <= 10)
	{
		var prize = '£1,000';
	}
	else
	{
		var prize = '£32,000';
	}
	$('#prize-text').text(prize);
	$('#background').addClass('bg-3');
	socket.emit('message', 'game_over', prize);
	await sleep(8000);
	closing_music = playsound(sounds.music.closing);
	stopsound(gameover);
}



function game_over_walk()
{
	if(!locked)
	{
		lock();
		stopsound(question_music);
		remove_background();
		$('#inside_0').attr('onclick', 'select_option_walk(0)');
		$('#inside_1').attr('onclick', 'select_option_walk(1)');
		$('#inside_2').attr('onclick', 'select_option_walk(2)');
		$('#inside_3').attr('onclick', 'select_option_walk(3)');
		unlock();
		$('#walk-away-button').removeClass('enabled');
	}
}

function select_option_walk(option)
{
	if(!locked && !removed_5050.includes(option))
	{
		lock();
		selected = option;
		socket.emit('message', 'select_option', option);
		$('#opt_'+option).parentsUntil('.answ', '.answ_inside').addClass('answ_selected');
		host_display_correct_answer();
		snext('walk_check_answer()');
		unext();
	}
}

async function walk_check_answer()
{
	lnext();
	socket.emit('message', 'display_correct_answer', answer);
	for (var i = 0; i < 5; i++) {
		$('#opt_'+answer).parentsUntil('.answ', '.answ_inside').addClass('answ_true');
		await sleep(150);
		$('.answ_inside').removeClass('answ_true');
		await sleep(150);
	}
	$('#opt_'+answer).parentsUntil('.answ', '.answ_inside').addClass('answ_true');
	snext('walk_end()');
	unext();
}

async function walk_end()
{
	lnext();
	var walk = playsound(sounds.music.walk, loop = false, release = 0.4, attack = 0.04, volume = 1);
	$('#quest-row').css('display', 'none');
	$('#game-over-row').css('display', 'block');
	var prize = prizes[question_number - 2];
	socket.emit('message', 'game_over', prize);
	$('#prize-text').text(prize);
	$('#background').addClass('bg-3');
	await sleep(8000);
	closing_music = playsound(sounds.music.closing);
}



async function win()
{
	socket.emit('message', 'win', name);
	$('#win-row').css('display', 'block');
	$('#mprize-text').text(name.toUpperCase());
	$('#background').addClass('bg-3');
	await sleep(21000);
	stopsoundnow(correct_sound);
	closing_music = playsound(sounds.music.closing);
}



function play_again()
{
	socket.emit('message', 'play_again');
	$('#win-row').css('display', 'none');
	$('#game-over-row').css('display', 'none');
	$('.l-5050').removeClass('used');
	$('.l-phone').removeClass('used');
	$('.l-audience').removeClass('used');
	$('.ladder tr').removeClass('current');
	$('.answ').removeClass('ahov');
	$('#start-row .answ').addClass('ahov');
	$('#phone-text').text('Ringing...');
	$('#clock').attr('src', 'assets/images/clock.png');
	$('#clock-real').attr('src', 'assets/images/clock.png');
	$('#phone-dismiss').removeClass('enabled');
	$('#audience-dismiss').removeClass('enabled');
	$('#audience-0').text('');
	$('#audience-1').text('');
	$('#audience-2').text('');
	$('#audience-3').text('');
	$('#inside_0').attr('onclick', 'select_option(0)');
	$('#inside_1').attr('onclick', 'select_option(1)');
	$('#inside_2').attr('onclick', 'select_option(2)');
	$('#inside_3').attr('onclick', 'select_option(3)');
	$('#phone-start-clock').addClass('enabled');
	$('#phone-dismiss-real').removeClass('enabled');
	snext('get_question()');

	var canvas = document.getElementById("audience-canvas");
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0,0,303,378);

	clear_question();

	question_number = 1;
	question = null;
	opt_0 = null;
	opt_1 = null;
	opt_2 = null;
	opt_3 = null;
	answer = null;
	selected = null;
	locked = true;
	used_5050 = false;
	used_phone = false;
	used_audience = false;
	removed_5050 = [];

	$('#start-row').css('display', 'block');
}