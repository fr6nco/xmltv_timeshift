"use strict";

module.exports = (app) => {
	app.get('/', (request, response) => {
		response.status(200).send({'info': 'API Mockup'});
	});
}

