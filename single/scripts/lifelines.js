


// 5050


function select_5050()
{
	if(!locked && !used_5050)
	{
		playsound(sounds.lifelines.fiftyfifty, false, 0.1, 0, 1);
		used_5050 = true;
		$('.l-5050').addClass('used');
		$('.l-5050').removeClass('lhov');

		var options = [0, 1, 2, 3];
		var keep = chooseWeighted(options.filter(x => x != answer), [30, 30, 30]);
		for (var i = 0; i < 4; i++) {
			if(i != answer && i != keep)
			{
				$('#opt_'+i).parentsUntil('.answ_row', '.answ').addClass('removed-5050').removeClass('ahov');
				removed_5050.push(i);
			}
		}
	}
}





// PHONE

socket.on('get_phone', function(data, answers, main_answer, secondary_answer) {
	display_phone_answer(data, answers, main_answer, secondary_answer);
});

function select_phone()
{
	if(!locked && !used_phone)
	{
		used_phone = true;
		lock();
		$('.l-phone').addClass('used');
		$('.l-phone').removeClass('lhov');

		phone_start_music = playsound(sounds.lifelines.phone_start, loop=true);
		stopsound(question_music);

		$('.phone-block').css('display','block');
		$('.normal-block').css('display','none');

		var options = [0, 1, 2, 3].filter(x => !removed_5050.includes(x));
		var answers = [opt_0, opt_1, opt_2, opt_3];

		if(!used_5050)
		{
			var confidence = chooseWeighted([0,1,2,3],[5,25,50,20]); // Guess 25%, 5050 50%, pretty sure 80%, confident 100%
		}
		else
		{
			var confidence = chooseWeighted([0,2,3],[10,50,40]);
		}
		
		var [main_answer, secondary_answer] = choose_phone_answer(confidence, options);

		socket.emit('get_phone', confidence, answers, main_answer, secondary_answer);
	}
}

async function display_phone_answer(data, answers, main_answer, secondary_answer)
{
	var response = data;
	if(response["success"])
	{
		await sleep(8000);

		phone_clock_music = new Pizzicato.Sound('assets/sounds/lifelines/phone-clock.ogg', () => start_clock(response, answers, main_answer, secondary_answer));
		phone_clock_music.release = 0.4;
		phone_clock_music.attack = 0.04;
		phone_clock_music.loop = false;
		phone_clock_music.volume = 0.5;
		phone_clock_music.on('end', function(){
			question_music = playsound(sounds.questions.music[question_number], loop = true);
		});
	}
	else
	{
		console.log(response['msg']);
	}
}



async function start_clock(response, answers, main_answer, secondary_answer)
{
	phone_start_music.stop();
	$('#clock').attr('src', 'assets/images/clock.gif');
	phone_clock_music.play();
	$('#phone-text').text('Thinking...');
	await sleep(randomIntFromInterval(5000,10000));
	$('#phone-text').text(response['text'].replaceAll('ANS1', answers[main_answer].toLowerCase()).replaceAll('ANS2', answers[secondary_answer].toLowerCase()));
	$('#phone-dismiss').addClass('enabled');
}



function choose_phone_answer(confidence, options)
{
	if(confidence == 0)
	{
		var first = chooseWeighted(options, new Array(options.length).fill(1));
		var second = chooseWeighted(options.filter(x => x != first), new Array(options.length-1).fill(1));
		return [first, second];
	}
	else if(confidence == 1)
	{
		var first = Math.random() < 0.97 ? answer : chooseWeighted(options.filter(x => x != answer), new Array(options.length-1).fill(1));
		if (first == answer)
		{
			var second = chooseWeighted(options.filter(x => x != first), new Array(options.length-1).fill(1));
		}
		else
		{
			var second = chooseWeighted(options.filter(x => x != first && x != answer), new Array(options.length-2).fill(1));
		}
		return shuffle([first, second]);
	}
	else if(confidence == 2)
	{
		var first = Math.random() < 0.97 ? answer : chooseWeighted(options.filter(x => x != answer), new Array(options.length-1).fill(1));
		if (first == answer)
		{
			var second = chooseWeighted(options.filter(x => x != first), new Array(options.length-1).fill(1));
		}
		else
		{
			var second = chooseWeighted(options.filter(x => x != first && x != answer), new Array(options.length-2).fill(1));
		}
		return [first, second];
	}
	else
	{
		return [answer, chooseWeighted(options.filter(x => x != answer), new Array(options.length-1).fill(1))];
	}
}



function dismiss_phone()
{
	if($('#phone-dismiss').hasClass('enabled'))
	{
		$('.phone-block').css('display','none');
		$('.normal-block').css('display','block');
		if(phone_clock_music.playing)
		{
			playsound(sounds.lifelines.phone_early_end);
			phone_clock_music.stop();
		}
		unlock();
	}
}




// AUDIENCE


async function select_audience()
{
	if(!locked && !used_audience)
	{
		used_audience = true;
		await lock();
		$('.l-audience').addClass('used');
		$('.l-audience').removeClass('lhov');

		audience_vote_music = playsound(sounds.lifelines.audience_vote);
		stopsound(question_music);

		$('.audience-block').css('display','block');
		$('.normal-block').css('display','none');

		remove_background();

		var options = [0, 1, 2, 3].filter(x => !removed_5050.includes(x));
		var answers = [opt_0, opt_1, opt_2, opt_3];

		if(!used_5050)
		{
			var confidence = chooseWeighted([0,1,2,3],[5,25,50,20]); // Guess, 5050, pretty sure, confident
		}
		else
		{
			var confidence = chooseWeighted([0,1,2,3],[10,0,50,40]);
		}
		var votes = get_audience_votes(confidence, options);
		draw_audience_graph(votes);
	}
}



function get_audience_votes(confidence, options)
{
	var weights = new Array(4).fill(0);
	for(opt of options)
	{
		weights[opt] = 1;
	}
	if(confidence == 1)
	{
		var [first, second] = choose_phone_answer(confidence, options);
		weights[first] = 10;
		weights[second] = 10;
	}
	else if(confidence == 2)
	{
		var [first, second] = choose_phone_answer(confidence, options);
		weights[first] = 20;
		weights[second] = 10;
	}
	else if(confidence == 3)
	{
		weights[answer] = 10;
	}

	var votes = [0, 0, 0, 0];
	for (var i = 0; i < 200; i++)
	{
		var vote = chooseWeighted([0,1,2,3],weights);
		votes[vote] = votes[vote] ? votes[vote] + 1 : 1;
	}

	votes = votes.map(x => parseInt(x/2));
	var diff = 100 - votes.reduce((a,b) => a + b, 0);
	while(diff > 0)
	{
		votes[options[diff % options.length]] += 1;
		diff -= 1;
	}

	return votes;
}



async function draw_audience_graph(votes)
{
	var canvas = document.getElementById("audience-canvas");
	var ctx = canvas.getContext("2d");
	ctx.globalCompositeOperation = 'source-over';

	ctx.shadowBlur = 3;
	ctx.shadowColor = "#2b88e7";
	ctx.strokeStyle = "#2b88e7";
	ctx.lineWidth = 2;
	
	for (var i = 1.5; i <= 376.5; i = i + 37.5)
	{
		ctx.moveTo(1.5, i);
		ctx.lineTo(301.5, i);
	}
	for (var i = 1.5; i <= 301.5; i = i + 37.5)
	{
		ctx.moveTo(i, 1.5);
		ctx.lineTo(i, 376.5);
	}
	ctx.stroke();

	await sleep(6000);
	playsound(sounds.lifelines.audience_result, false, 0.1, 0, 1);
	audience_vote_music.stop();
	display_background();

	for (var i = 0; i < 4; i++)
	{
		var pct = votes[i];
		$('#audience-' + i).text(pct + "%");
		var pos = 375 - Math.round((pct / 100) * 375);
		var grd = ctx.createLinearGradient(0, 1 + pos, 0, 376);
		grd.addColorStop(0, "#3ddbff");
		grd.addColorStop(1, "#a45de0");
		ctx.fillStyle = grd;
		ctx.fillRect(13.75 + (i * 75), 1 + pos, 50.5, 376);
	}
	$('#audience-dismiss').addClass('enabled');
	question_music = playsound(sounds.questions.music[question_number], loop = true);
}



function dismiss_audience()
{
	if($('#audience-dismiss').hasClass('enabled'))
	{
		$('.audience-block').css('display','none');
		$('.normal-block').css('display','block');
		unlock();
	}
}