"use strict";

const config = require('config');
const logger = require('winston');
const request = require('request');
const XMLDownloader = require('./modules/XMLDownloader');
// const ShiftStorage = require('./modules/ShiftStorage');
// const XMLShifter = require('./modules/XMLShifter');

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

// let xmldown = new XMLDownloader(config.xmltv_url, config.xml_destination);
let xmldown = new XMLDownloader(config.xmltv_url, config.xml_destination);

if(xmldown == null) {
	logger.error('Failed to create an instance of XMLDownloader');
	process.exit(1);
}


const app = express();
const server = http.createServer(app);

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

require('./modules/api')(app);


//Creates local storage of XMLTV from Upstream
logger.info('App starting, creating local cache of Upstream XML server');
xmldown.getXMLTV().then((xml) => {
	logger.info('Local cache of XML created');

	//Wont start API unless the local XML cache is created;
	server.listen(8001, 'localhost');
	server.on('listening', function() {
	    logger.info('Express server started on port %s at %s', server.address().port, server.address().address);
	});

})
.catch((err) => {
	logger.error('Failed to download XML cache from upstream, not starting server');
	logger.error(err);
	process.exit(1);
})





