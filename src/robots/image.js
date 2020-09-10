const state = require('./state');
const gm = require('gm').subClass({ imageMagick: true });
const googleapi = require('googleapis').google;
const googleCredentials = require('../credentials/google.json');
const downloader = require('image-downloader');
const customSearch = googleapi.customsearch('v1');

async function robot()
{
	const dataStructure = state.load();

	//await getImagesFromData(dataStructure);
	//await downloadImages(dataStructure);
	//await convertAllImages(dataStructure);
	//await createAllCentecesImages(dataStructure);
	await crateYouTubeThumb(dataStructure);

	//state.save(dataStructure);

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

	async function convertAllImages(dataStructure)
	{
		for(let index = 0; index < dataStructure.sentences.length; index++)
		{
			await convetImage(index);
		}
	}

	async function convetImage(index)
	{
		return new Promise((resolve, reject) => {
			const inputFile = `./src/content/${index}-original.png[0]`;
			const outputFile = `./src/content/${index}-converted.png`;

			const width = 1920;
			const height = 1080;

			gm()
	        .in(inputFile)
	        .out('(')
	          .out('-clone')
	          .out('0')
	          .out('-background', 'white')
	          .out('-blur', '0x9')
	          .out('-resize', `${width}x${height}^`)
	        .out(')')
	        .out('(')
	          .out('-clone')
	          .out('0')
	          .out('-background', 'white')
	          .out('-resize', `${width}x${height}`)
	        .out(')')
	        .out('-delete', '0')
	        .out('-gravity', 'center')
	        .out('-compose', 'over')
	        .out('-composite')
	        .out('-extent', `${width}x${height}`)
	        .write(outputFile, (error) => {
	          if (error) {
	            return reject(error)
	          }

	          console.log(`> [video-robot] Image converted: ${outputFile}`)
	          resolve()

			});
	    });
	}

	async function createAllCentecesImages(dataStructure)
	{
		for(let index = 0; index < dataStructure.sentences.length; index++)
		{
			await createCentencesImages(index, dataStructure.sentences[index].text);
		}
	}

	async function createCentencesImages(index, text)
	{
		return new Promise((resolve, reject) => {
			const outputFile = `./src/content/${index}-sentence.png`;

			const templateSettings = {
	        0: {
	          size: '1920x400',
	          gravity: 'center'
	        },
	        1: {
	          size: '1920x1080',
	          gravity: 'center'
	        },
	        2: {
	          size: '800x1080',
	          gravity: 'west'
	        },
	        3: {
	          size: '1920x400',
	          gravity: 'center'
	        },
	        4: {
	          size: '1920x1080',
	          gravity: 'center'
	        },
	        5: {
	          size: '800x1080',
	          gravity: 'west'
	        },
	        6: {
	          size: '1920x400',
	          gravity: 'center'
	        }

	      }

	      gm()
	        .out('-size', templateSettings[index].size)
	        .out('-gravity', templateSettings[index].gravity)
	        .out('-background', 'transparent')
	        .out('-fill', 'white')
	        .out('-kerning', '-1')
	        .out(`caption:${text}`)
	        .write(outputFile, (error) => {
	          if (error) {
	            return reject(error)
	          }

	          console.log(`> [video-robot] Sentence created: ${outputFile}`)
	          resolve()
			});
	    });
	}

	async function crateYouTubeThumb(dataStructure)
	{
		return new Promise((resolve, reject) => {
			gm()
			.in('./src/content/0-converted.png')
			.write('./src/content/youtube-thumb.jpg', (err) => {
				if(err)
				{
					return reject(err);
				}

				console.log('thumb creada');
				resolve();
			});

		});
	}
}

module.exports = robot;