"use strict";

const request = require('request');
const logger = require('winston');
const fs = require('fs');
const q = require('q');
const Queue = require('node-queue-lib/queue.core');
const libxml = require('libxmljs');

let instance = null;

class XMLShifter {

	parseXML(xml) {
		let streamQueue = new Queue('streamQueue', 'broadcast');

		let xmlDoc = libxml.parseXmlString(xml);
		let channels = xmlDoc.find('//channel');
		let channelList = channels.map(item => item.attr('id').value());

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