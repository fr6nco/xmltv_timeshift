"use strict";

const request = require('request');
const logger = require('winston');
const fs = require('fs');
const q = require('q');

let instance = null;

class XMLDownloader {
	getXMLTV(force) {
		return q.promise((resolve, reject) => {
			if(force == true) {
				logger.debug('Reloading XML from upstream forced');
				this._xml = null;
			}

			if(this._xml && this._xml != null) {
				resolve(this._xml);
			} else {
				logger.profile('XML Upstream Load Time');
				request.get(this._source, (err, res, body)=> {
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

	constructor(source, storage) {
		if(! instance) {
			if(source == undefined || storage == undefined) {
				return null;
			}
			this._source = source;
			this._storage = storage;
			instance = this;			
		}

		return instance;
	} 
}

module.exports = XMLDownloader;