const algorithmia = require('algorithmia');
const sentenceBoundaryDetection = require('sbd');
const state = require('./state');

const apiKey = require('../credentials/algorithmia.json').apiKey;
const watsonApiKey = require('../credentials/watson.json').apikey;
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
 
const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});

async function robot()
{
	const dataStructure = state.load();

	await downloadContentFromWikipedia(dataStructure);
	cleanContent(dataStructure);
	breakContentIntoCentences(dataStructure);
	limitMaximumCentences(dataStructure);
	await fetchKeyords(dataStructure);

	state.save(dataStructure);

	async function downloadContentFromWikipedia(dataStructure)
	{
		const algorithmiaAlthenticated = algorithmia(apiKey);
		const WikipediaAlgorithm = algorithmiaAlthenticated.algo('web/WikipediaParser/0.1.2');
		const WikipediaResponse = await WikipediaAlgorithm.pipe({ "lang":  dataStructure.lang, "articleName": dataStructure.searchTerm} );
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

	function limitMaximumCentences(dataStructure)
	{
		dataStructure.sentences = dataStructure.sentences.slice(0, dataStructure.maximumSentences);
	}

	async function getKeywords(sentence)
	{
		return new Promise((resolve, reject) => {
			nlu.analyze({
				text: sentence,
				features: {
					keywords: {}
				}
			}, (err, result) => {
				if(err)
				{
					throw err;
				}
				const keywords = result.keywords.map(keyword => {
					return keyword.text;
				});
				resolve(keywords);
			});
		});
	}

	async function fetchKeyords(dataStructure)
	{
		for(const sentence of dataStructure.sentences)
		{
			sentence.keywords = await getKeywords(sentence.text);
		}
	}
}

module.exports = robot;