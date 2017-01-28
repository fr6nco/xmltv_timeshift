"use strict";

const request = require('request');
const logger = require('winston');
const fs = require('fs');
const q = require('q');
const Queue = require('node-queue-lib/queue.core');

let instance = null;

class XMLShifter {

	parseXML(xml) {
		logger.info('Parsing XML');
		logger.info('XML PARSED');
		this._backQueue.publish(xml);
	}

	constructor() {
		if(! instance) {
			this._queue = new Queue('xmlUpdate', 'broadcast');
			this._queue.subscribe((err, subscriber) => {
				subscriber.on('error', (err) => {
					logger.error(err);
				});
				subscriber.on('data', (data, accept) => {
					logger.info('Received XML for parsing');
					this.parseXML(data);
					accept();
				});
			});
			this._backQueue = new Queue('xmlShift', 'broadcast');
			instance = this;			
		}
		return instance;
	} 
}

module.exports = XMLShifter;