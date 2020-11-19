var question_number = 1;
var question;
var opt_0;
var opt_1;
var opt_2;
var opt_3;
var answer;
var selected;
var locked = true;
var used_5050 = false;
var used_phone = false;
var used_audience = false;
var removed_5050 = [];
var name;
var prizes = ['£100','£200','£300','£500','£1,000','£2,000','£4,000','£8,000','£16,000','£32,000','£64,000','£125,000','£250,000','£500,000'];
var used_questions = [""];
var question_id;

var question_music;
var final_sound;
var correct_sound;
var letsplay_music;
var hotseat_music;
var closing_music;
var phone_start_music;
var phone_clock_music;
var audience_vote_music;


async function start()
{
	name = $('#name').val()
	$('#start-row').css('display', 'none');

	if(closing_music && closing_music.playing)
	{
		stopsound(closing_music);
	}
	hotseat_music = playsound(sounds.music.hotseat);
	$('#background').removeClass('bg-3');
	await sleep(8000);

	$('#quest-row').css('display', 'block');

	get_question();
}
