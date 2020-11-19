async function game_over_incorrect()
{
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
	await sleep(8000);
	closing_music = playsound(sounds.music.closing);
	stopsound(gameover);
}



async function game_over_walk()
{
	if(!locked)
	{
		lock();
		var walk = playsound(sounds.music.walk, loop = false, release = 0.4, attack = 0.04, volume = 1);
		question_music.stop();

		remove_background();
		for (var i = 0; i < 5; i++) {
			$('#opt_'+answer).parentsUntil('.answ', '.answ_inside').addClass('answ_true');
			await sleep(150);
			$('.answ_inside').removeClass('answ_true');
			await sleep(150);
		}
		$('#opt_'+answer).parentsUntil('.answ', '.answ_inside').addClass('answ_true');

		await sleep(6000);

		$('#quest-row').css('display', 'none');
		$('#game-over-row').css('display', 'block');
		var prize = prizes[question_number - 2];
		$('#prize-text').text(prize);
		$('#background').addClass('bg-3');
		closing_music = playsound(sounds.music.closing);
	}
}



async function win()
{
	$('#win-row').css('display', 'block');
	$('#mprize-text').text(name.toUpperCase());
	$('#background').addClass('bg-3');
	await sleep(21000);
	correct_sound.stop();
	closing_music = playsound(sounds.music.closing);
}



function play_again()
{
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
	$('#phone-dismiss').removeClass('enabled');
	$('#audience-dismiss').removeClass('enabled');
	$('#audience-0').text('');
	$('#audience-1').text('');
	$('#audience-2').text('');
	$('#audience-3').text('');

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