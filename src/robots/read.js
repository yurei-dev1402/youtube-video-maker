const readline = require('readline-sync');
const state = require('./state');

function robot()
{
	const dataStructure = {
			maximumSentences: 7
	};

	dataStructure.lang = getLangWikipedia(),
	dataStructure.searchTerm = returnSearchTerm(),
	dataStructure.serchPrefix = returnSearchPrefix(),

	state.save(dataStructure);

	function returnSearchTerm() 
	{
		return dataStructure.lang == 'en' ? readline.question('Type Wikipedia search term: ') : readline.question('Escreva o termo de busca do Wikipedia: ');
	}

	function returnSearchPrefix()
	{
		const prefixes = dataStructure.lang == 'en' ? ['Who is', 'What is', 'The History of'] : ['Quem é', 'O que é', 'A historia de'];
		const selectedPrefix = dataStructure.lang == 'en' ? readline.keyInSelect(prefixes, 'Chose one option for prefix: ') : readline.keyInSelect(prefixes, 'Escolha uma opção para o prefixo: ');

		return prefixes[selectedPrefix];
	}

	function getLangWikipedia()
	{
		const langs = ['en', 'pt'];
		const selectedLang = readline.keyInSelect(langs, 'Chose one option: ');

		return langs[selectedLang];
	}
}

module.exports = robot;