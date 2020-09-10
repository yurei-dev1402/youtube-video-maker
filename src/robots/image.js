const state = require('./state');
const googleapi = require('googleapis').google;
const googleCredentials = require('../credentials/google.json');

const customSearch = googleapi.customsearch('v1');

async function robot()
{
	const dataStructure = state.load();

	await getImagesFromData(dataStructure);

	state.save(dataStructure);

	async function getImagesFromData(dataStructure)
	{
		for(const sentence of dataStructure.sentences)
		{
			const query = `${dataStructure.searchTerm} ${sentence.keywords[0]}`;
			sentence.images = await getUrlImages(query);

			sentence.googleSearchQuery = query;
		}
	}

	async function getUrlImages(query)
	{
		const results = await customSearch.cse.list({
			auth: googleCredentials.apikey,
			cx: googleCredentials.idSearch,
			q: query,
			searchType: 'image',
			num: 2
		});

		const imageUrl = results.data.items.map(item => {
			return item.link;
		});

		return imageUrl;

	}
}

module.exports = robot;