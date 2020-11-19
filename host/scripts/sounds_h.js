var sounds = {};
sounds.questions = {};
sounds.questions.correct = [null];
sounds.questions.incorrect = [null];
sounds.questions.final = [null, null, null, null, null, null];
sounds.questions.music = [null];
sounds.questions.letsplay = [null];
sounds.lifelines = {};
sounds.music = {};

var piz = {};

function playsound(source, loop = false, release = 0.4, attack = 0.04, volume = 0.5)
{
	socket.emit('message', 'playsound', {source: source, loop: loop, release: release, attack: attack, volume: volume});
	var sound_object = piz[source];
	sound_object.source = source;
	sound_object.release = release;
	sound_object.attack = attack;
	sound_object.loop = loop;
	sound_object.volume = 0;
	sound_object.play();
	return sound_object;
}

function loadsound(source)
{
	piz[source] = new Pizzicato.Sound('assets/sounds/' + source);
}

async function stopsound(sound_object)
{
	socket.emit('message', 'stopsound', sound_object.source);
	await sleep(1000);
	sound_object.stop();
}

function stopsoundnow(sound_object)
{
	socket.emit('message', 'stopsoundnow', sound_object.source);
	sound_object.stop();
}

sounds.music.hotseat = 'music/hotseat.ogg';
sounds.music.walk = 'music/walk.ogg';
sounds.music.gameover = 'music/gameover.ogg';
sounds.music.closing = 'music/closing.ogg';

loadsound(sounds.music.hotseat);
loadsound(sounds.music.walk);
loadsound(sounds.music.gameover);
loadsound(sounds.music.closing);




sounds.questions.music[1] = 'questions/music/1to5.ogg';
sounds.questions.music[2] = 'questions/music/1to5.ogg';
sounds.questions.music[3] = 'questions/music/1to5.ogg';
sounds.questions.music[4] = 'questions/music/1to5.ogg';
sounds.questions.music[5] = 'questions/music/1to5.ogg';
loadsound(sounds.questions.music[1]);

for (var i = 6; i <= 15; i++)
{
	sounds.questions.music[i] = 'questions/music/'+i+'.ogg';
	loadsound(sounds.questions.music[i]);
}






for (var i = 1; i <= 4; i++)
{
	sounds.questions.correct[i] = 'questions/correct/1to4.ogg';
	loadsound(sounds.questions.correct[i]);
}

for (var i = 5; i <= 15; i++)
{
	sounds.questions.correct[i] = 'questions/correct/'+i+'.ogg';
	loadsound(sounds.questions.correct[i]);
}






sounds.questions.final[6] = 'questions/final/6-11.ogg';
sounds.questions.final[7] = 'questions/final/7-12.ogg';
sounds.questions.final[8] = 'questions/final/8-13.ogg';
sounds.questions.final[9] = 'questions/final/9-14.ogg';
sounds.questions.final[10] = 'questions/final/10-15.ogg';
sounds.questions.final[11] = 'questions/final/6-11.ogg';
sounds.questions.final[12] = 'questions/final/7-12.ogg';
sounds.questions.final[13] = 'questions/final/8-13.ogg';
sounds.questions.final[14] = 'questions/final/9-14.ogg';
sounds.questions.final[15] = 'questions/final/10-15.ogg';

loadsound(sounds.questions.final[6]);
loadsound(sounds.questions.final[7]);
loadsound(sounds.questions.final[8]);
loadsound(sounds.questions.final[9]);
loadsound(sounds.questions.final[10]);
loadsound(sounds.questions.final[11]);
loadsound(sounds.questions.final[12]);
loadsound(sounds.questions.final[13]);
loadsound(sounds.questions.final[14]);
loadsound(sounds.questions.final[15]);





for (var i = 1; i <= 5; i++)
{
	sounds.questions.incorrect[i] = 'questions/incorrect/1to5.ogg';
	loadsound(sounds.questions.incorrect[i]);
}

sounds.questions.incorrect[6] = 'questions/incorrect/6-11.ogg';
sounds.questions.incorrect[7] = 'questions/incorrect/7-12.ogg';
sounds.questions.incorrect[8] = 'questions/incorrect/8-13.ogg';
sounds.questions.incorrect[9] = 'questions/incorrect/9-14.ogg';
sounds.questions.incorrect[10] = 'questions/incorrect/10.ogg';
sounds.questions.incorrect[11] = 'questions/incorrect/6-11.ogg';
sounds.questions.incorrect[12] = 'questions/incorrect/7-12.ogg';
sounds.questions.incorrect[13] = 'questions/incorrect/8-13.ogg';
sounds.questions.incorrect[14] = 'questions/incorrect/9-14.ogg';
sounds.questions.incorrect[15] = 'questions/incorrect/15.ogg';

loadsound(sounds.questions.incorrect[6]);
loadsound(sounds.questions.incorrect[7]);
loadsound(sounds.questions.incorrect[8]);
loadsound(sounds.questions.incorrect[9]);
loadsound(sounds.questions.incorrect[10]);
loadsound(sounds.questions.incorrect[11]);
loadsound(sounds.questions.incorrect[12]);
loadsound(sounds.questions.incorrect[13]);
loadsound(sounds.questions.incorrect[14]);
loadsound(sounds.questions.incorrect[15]);






sounds.questions.letsplay[1] = 'questions/letsplay/1-6-11.ogg';
sounds.questions.letsplay[6] = 'questions/letsplay/1-6-11.ogg';
sounds.questions.letsplay[7] = 'questions/letsplay/7-12.ogg';
sounds.questions.letsplay[8] = 'questions/letsplay/8-13.ogg';
sounds.questions.letsplay[9] = 'questions/letsplay/9-14.ogg';
sounds.questions.letsplay[10] = 'questions/letsplay/10-15.ogg';
sounds.questions.letsplay[11] = 'questions/letsplay/1-6-11.ogg';
sounds.questions.letsplay[12] = 'questions/letsplay/7-12.ogg';
sounds.questions.letsplay[13] = 'questions/letsplay/8-13.ogg';
sounds.questions.letsplay[14] = 'questions/letsplay/9-14.ogg';
sounds.questions.letsplay[15] = 'questions/letsplay/10-15.ogg';

loadsound(sounds.questions.letsplay[1]);
loadsound(sounds.questions.letsplay[6]);
loadsound(sounds.questions.letsplay[7]);
loadsound(sounds.questions.letsplay[8]);
loadsound(sounds.questions.letsplay[9]);
loadsound(sounds.questions.letsplay[10]);
loadsound(sounds.questions.letsplay[11]);
loadsound(sounds.questions.letsplay[12]);
loadsound(sounds.questions.letsplay[13]);
loadsound(sounds.questions.letsplay[14]);
loadsound(sounds.questions.letsplay[15]);





sounds.lifelines.fiftyfifty = 'lifelines/50-50.ogg';
sounds.lifelines.phone_start = 'lifelines/phone-start.ogg';
sounds.lifelines.phone_early_end = 'lifelines/phone-early-end.ogg';
sounds.lifelines.audience_vote = 'lifelines/audience-vote.ogg';
sounds.lifelines.audience_result = 'lifelines/audience-result.ogg';

loadsound(sounds.lifelines.fiftyfifty);
loadsound(sounds.lifelines.phone_start);
loadsound(sounds.lifelines.phone_early_end);
loadsound(sounds.lifelines.audience_vote);
loadsound(sounds.lifelines.audience_result);