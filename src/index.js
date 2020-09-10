const robots = {
	input: require('./robots/read.js'),
	text: require('./robots/text'),
	state: require('./robots/state'),
	image: require('./robots/image'),
	video: require('./robots/video'),
	youtube: require('./robots/youtube')
}

async function start()
{
	robots.input();
	await robots.text();
	await robots.image();
	await robots.video();
	await robots.youtube();

	//console.dir(robots.state.load(), {depth: null});
}

start();