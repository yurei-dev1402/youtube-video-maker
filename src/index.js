const readline = require('readline-sync');

function start()
{
	const content = {
		searchTerm: returnSearchTerm(),
		serchPrefix: returnSearchPrefix(),
	};

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

	console.log(content);
}

start();