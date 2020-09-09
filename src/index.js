const readline = require('readline-sync');

const robots = {
	text: require('./robots/text'),
}

async function start()
{
	const dataStructure = {
		searchTerm: returnSearchTerm(),
		serchPrefix: returnSearchPrefix(),
	};

	await robots.text(dataStructure);

	function returnSearchTerm() 
	{
		return readline.question('Type Wikipedia search term: ');
	}

	function returnSearchPrefix()
	{
		const prefixes = ['Who is', 'What is', 'The History of', 'How works'];
		const selectedPrefix = readline.keyInSelect(prefixes, 'Chose one option: ');

		return prefixes[selectedPrefix];
	}

	console.log(dataStructure);
}

start();