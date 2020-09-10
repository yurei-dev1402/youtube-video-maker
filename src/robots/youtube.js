const state = require('./state');
const express = require('express');
const fs = require('fs');
const google = require('googleapis').google;

const OAuth2 = google.auth.OAuth2;
const youtube = google.youtube({ version: 'v3' });

async function robot()
{
	const dataStructure = state.load();

	await authenticateOAlth();
	
	const videoInformaton = await uploadVideo(dataStructure);
	await uploadThumb(videoInformaton);


	async function authenticateOAlth()
	{
		const server = await startWebServer();
		const client = await createClient();
		
		requestUser(client);
		
		const authorization = await waitGoogleCallback(server);
		
		await requestForGoogleToken(client, authorization);
		setGlobalAuthentication(client);
		await stopWebServer(server);

		async function startWebServer()
		{
			return new Promise((resolve, reject) => {
				const app = express();

				const server = app.listen(5000);

				resolve({
					app,
					server
				});
			});
		}

		async function createClient()
		{
			const credentials = require('../credentials/auth.json');

			const client = new OAuth2(
				credentials.web.client_id,
				credentials.web.client_secret,
				credentials.web.redirect_uris[0]
			);

			return client;
		}

		function requestUser(client)
		{
			const consentUrl = client.generateAuthUrl({
				access_type: 'offline',
				scope: ['https://www.googleapis.com/auth/youtube']
			});

			console.log('> Plase give your consent: '+consentUrl);
		}

		async function waitGoogleCallback(server)
		{
			return new Promise((resolve, request) => {
				console.log('> Waiting for user content...');

				server.app.get('/callback', (req, res) => {

					const code = req.query.code;
					console.log('> Content Given: '+code);

					res.send('<h2>Thank you!</h2><p>Now close this tab</p>');

					resolve(code);
				});
			});
		}

		async function requestForGoogleToken(client, authorization)
		{
			return new Promise((resolve, reject) => {
				client.getToken(authorization, (err, tokens) => {
					if(err)
					{
						return reject(err);
					}

					console.log('> Access Token recived');
					console.log(tokens);

					client.setCredentials(tokens);
					resolve();
				});
			});
		}

		function setGlobalAuthentication(client)
		{
			google.options({
				auth: client
			});
		}

		async function stopWebServer(server)
		{
			return new Promise((resolve, reject) => {
				server.server.close(() => {
					resolve();
				});
			});
		}
	}

	async function uploadVideo(dataStructure)
	{
		const videoPath = './src/content/output.mp4';
		const videoFileSize = fs.statSync(videoPath).size;
		const videoTitle = `${dataStructure.serchPrefix} ${dataStructure.searchTerm}`;
		const videoTags = [dataStructure.searchTerm, ...dataStructure.sentences[0].keywords];
		const videoDescription = dataStructure.sentences.map(sentence => {return sentence.text}).join('\n\n');

		const requestParameters = {
			part: 'snippet, status',
			requestBody: {
				snippet: {
					title: videoTitle,
					description: videoDescription,
					tags: videoTags
				},
				status: {
					privacyStatus: 'unlisted',
				}
			},
			media: {
				body: fs.createReadStream(videoPath)
			}

		}

		const youtubeResponse = await youtube.videos.insert(requestParameters, {
			onUploadProgress: upload
		});

		console.log(`> Video Available: https://youtu.be/${youtubeResponse.data.id}`);
		return youtubeResponse.data;

		function upload(event)
		{
			const progress = Math.round((event.bytesRead / videoFileSize) * 100);
			console.log(`> Progress: ${progress}`);
		}
	}

	async function uploadThumb(data)
	{
		const videoId = data.id;
		const thumbPath = './src/content/youtube-thumb.jpg';

		const requestParameters = {
			videoId: videoId,
			media: {
				mimeType: 'image/jpeg',
				body: fs.createReadStream(thumbPath)
			}
		}

		const youtubeResponse = await youtube.thumbnails.set(requestParameters);
		console.log('> Thumb Uploaded');
	}
}

module.exports = robot;