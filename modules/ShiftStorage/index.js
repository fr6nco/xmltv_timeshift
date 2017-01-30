"use strict";

const logger = require('winston');
const Queue = require('node-queue-lib/queue.core');

class GlobalSettings {
	constructor() {
		logger.info('instance of GlobalSettings');
	}
}

class ChannelSettings {
	constructor() {
		logger.info('Constructor of channel');
	}
}

class ShiftStorage {
	
	shiftProcessor() {
		this._streamQueue.subscribe((error, subscriber) => {
			subscriber.on('error', (error) => {
				logger.error(error);
			});
			subscriber.on('data', (data, accept) => {
				logger.info(data);
				accept();
			});
		})
	}
 
	constructor() {
		logger.info('Instance of shiftstorage');
		this._streamQueue = new Queue('streamQueue', 'broadcast');
		this.shiftProcessor();
	}
}


module.exports = {
	GlobalSettings: GlobalSettings,
	ChannelSettings: ChannelSettings,
	ShiftStorage: ShiftStorage
};