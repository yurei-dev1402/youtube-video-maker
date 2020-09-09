const algorithmia = require('algorithmia');
const apiKey = require('../credentials/algorithmia.json').apiKey;
const sentenceBoundaryDetection = require('sbd');

async function robot(dataStructure)
{
	await downloadContentFromWikipedia(dataStructure);
	cleanContent(dataStructure);
	breakContentIntoCentences(dataStructure);

	async function downloadContentFromWikipedia(dataStructure)
	{
		const algorithmiaAlthenticated = algorithmia(apiKey);
		const WikipediaAlgorithm = algorithmiaAlthenticated.algo('web/WikipediaParser/0.1.2');
		const WikipediaResponse = await WikipediaAlgorithm.pipe(dataStructure.searchTerm);
		const WikipediaContent = WikipediaResponse.get();
		
		dataStructure.sourceContentOriginal = WikipediaContent.content;
	}

	function cleanContent(dataStructure)
	{
		const textCleaned = cleanText(dataStructure.sourceContentOriginal);

		function cleanText(text)
		{
			const lines = text.split('\n');

			const withoutBlankLines = lines.filter(line => {
				if(line.trim().length === 0 || line.trim().startsWith('='))
				{
					return false;
				}
				else
				{
					return true;
				}
			});

			return withoutBlankLines.join(' ').replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ');
		}

		dataStructure.sourceContentOriginal = textCleaned;
	}

	function breakContentIntoCentences(dataStructure)
	{
		dataStructure.sentences = [];
		const sentences = sentenceBoundaryDetection.sentences(dataStructure.sourceContentOriginal);
		
		sentences.forEach(sentence => {
			dataStructure.sentences.push({
				text: sentence,
				keywords: [],
				images: []
			});
		});
	}
}

module.exports = robot;