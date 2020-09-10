const fs = require('fs');
const dataFile = './data.json';

function save(data)
{
	const stringData = JSON.stringify(data);
	return fs.writeFileSync(dataFile, stringData);
}

function load()
{
	const file = fs.readFileSync(dataFile, 'utf-8');
	const jsonFile = JSON.parse(file);

	return jsonFile;
}

module.exports = {
	save,
	load
}