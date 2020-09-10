const state = require('./state');
const googleapi = require('googleapis').google;
const googleCredentials = require('../credentials/google.json');
const downloader = require('image-downloader');
const customSearch = googleapi.customsearch('v1');

async function robot()
{
	const dataStructure = state.load();

	await getImagesFromData(dataStructure);
	await downloadImages(dataStructure);

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

	async function downloadImages(dataStructure)
	{
		dataStructure.downladImages = [];

		for(let index = 0; index < dataStructure.sentences.length; index++)
		{
			const images = dataStructure.sentences[index].images;

			for(let imndex = 0; imndex < images.length; imndex++)
			{
				const image = images[imndex];

				try
				{
					if(dataStructure.downladImages.includes(image))
					{
						throw new Error('Imagem já baixada;');
					}
					await downloaderImage(image, `${index}-original.png`);
					dataStructure.downladImages.push(image);
					console.log(`${index} ${imndex} [Images] Image baixada com sucesso: ${image}`);
					break
				}
				catch(err)
				{
					console.log(`[Images] Erro ao baixar: ${image} ${err}`);
				}
			}
		}
	}

	async function downloaderImage(url, filename)
	{
		return downloader.image({
			url,
			dest: `./src/content/${filename}`
		});
	}
}

module.exports = robot;