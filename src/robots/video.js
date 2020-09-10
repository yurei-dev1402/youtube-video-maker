const gm = require('gm').subClass({ imageMagick: true });
const videoshow = require('videoshow');
const state = require('./state');

async function robot() {

	const dataStructure = state.load();

	await convertAllImages(dataStructure);
	await createAllCentecesImages(dataStructure);
	await crateYouTubeThumb(dataStructure);
	await renderVideoWithNode(dataStructure);

	state.save(dataStructure);

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

	async function renderVideoWithNode(dataStructure)
	{
    return new Promise((resolve, reject) => {
      console.log("> Renderizando vídeo com node.");

      let images = [];

      for (
        let index = 0;
        index < dataStructure.sentences.length;
        index++
      ) {
        images.push({
          path: `./src/content/${index}-converted.png`,
          caption: dataStructure.sentences[index].text
        });
      }

      const videoOptions = {
        fps: 25,
        loop: 5, // seconds
        transition: true,
        transitionDuration: 1, // seconds
        videoBitrate: 1024,
        videoCodec: "libx264",
        size: "1920x?",
        audioBitrate: "128k",
        audioChannels: 2,
        format: "mp4",
        pixelFormat: "yuv420p",
        useSubRipSubtitles: false, // Use ASS/SSA subtitles instead
        subtitleStyle: {
          Fontname: "Verdana",
          Fontsize: "26",
          PrimaryColour: "11861244",
          SecondaryColour: "11861244",
          TertiaryColour: "11861244",
          BackColour: "-2147483640",
          Bold: "2",
          Italic: "0",
          BorderStyle: "2",
          Outline: "2",
          Shadow: "3",
          Alignment: "1", // left, middle, right
          MarginL: "40",
          MarginR: "60",
          MarginV: "40"
        }
      };

      videoshow(images, videoOptions)
        .audio("./src/templates/newRoom.mp3")
        .save("./src/content/output.mp4")
        .on("start", function(command) {
          console.log("> Processo ffmpeg iniciado:", command);
        })
        .on("error", function(err, stdout, stderr) {
          console.error("Error:", err);
          console.error("> ffmpeg stderr:", stderr);
          reject(err);
        })
        .on("end", function(output) {
          console.error("> Video criado:", output);
          resolve();
        });
    });
  }
}

module.exports = robot;