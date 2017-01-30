"use strict";

const request = require('request');
const logger = require('winston');
const fs = require('fs');
const q = require('q');
const Queue = require('node-queue-lib/queue.core');

let instance = null;

class XMLDownloader {
	getXMLTV(force) {
		return q.promise((resolve, reject) => {

			if(this._init == true) {
				reject('XML cache is being downloaded, rejecting concurrent call');
				return;
			}

			if(force == true) {
				logger.debug('Reloading XML from upstream forced');
				this._xml = null;
			}

			if(this._xml && this._xml != null) {
				resolve(this._xml);
			} else {
				this._init = true;
				logger.profile('XML Upstream Load Time');
				request.get(this._source, (err, res, body) => {
					logger.profile('XML Upstream Load Time');
					if(err) {
						this._xml = null;
						reject(err);
						return;
					}
					if(res.statusCode == 200) {
						this._xml = res.body;
						resolve(this._xml);
					} else {
						this._xml = null;
						reject(res.statusCode)
					}
				});
			}
		});
	}

	writeToFile(content) {
		fs.writeFile(this._storage, content, 'utf8', (err) => {
			if(err) {
				logger.error('Failed to write file '+ this._storage);
			}
		});
	}

	startRunner(intervals) {
		logger.info('Starting runner. XMLTV being downloaded every ' + intervals/1000 + ' seconds');
		this._runnable = setInterval(() => {
			this.getXMLTV(true).then((xml) => {
				this._init = false;
				this._queue.publish(xml);
				logger.info('XML database reloaded from upstream');
			});
		}, (intervals === undefined) ? 7200 * 1000 : intervals);
	}

	stopRunner() {
		clearInterval(this._runnable);
	}

	constructor(source, storage) {
		if(! instance) {
			if(source == undefined || storage == undefined) {
				return null;
			}
			this._source = source;
			this._storage = storage;
			this._queue = new Queue('xmlUpdate', 'broadcast');
			this.startRunner(15 * 1000);
			this.getXMLTV().then((xml) => {
				logger.info('Loaded XML cache during init time');
				this._queue.publish(xml);
				this._init = false;
			})
			.catch((err) => {
				logger.error('Failed to load initial XML cache');
				this._init = false;
			})
			this._backQueue = new Queue('xmlShift', 'broadcast');
			this._backQueue.subscribe((err, subscriber) => {
				subscriber.on('error', (err) => {
					logger.error(err);
				});
				subscriber.on('data', (data, accept) => {
					logger.info('Data Shitfed');
					this.writeToFile(data);
					accept();
				});
			})
			instance = this;			
		}

		return instance;
	} 
}

module.exports = XMLDownloader;