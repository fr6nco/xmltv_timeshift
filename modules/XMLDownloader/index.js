"use strict";

const request = require('request');
const logger = require('winston');
const fs = require('fs');
const q = require('q');
const queue = require('queue');

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
		this._runnable = setInterval(() => {
			this.getXMLTV(true).then((xml) => {
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
			this._queue = queue();
			this.getXMLTV().then((xml) => {
				logger.info('Loaded XML cache during init time');
				this._init = false;
			})
			.catch((err) => {
				logger.error('Failed to load initial XML cache');
				this._init = false;
			})
			instance = this;			
		}

		return instance;
	} 
}

module.exports = XMLDownloader;