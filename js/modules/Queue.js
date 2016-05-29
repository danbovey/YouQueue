var _ = require('lodash');

var REPEAT_STATES = ['playlist', 'video', 'none'];

var Queue = {
	isPlaying: false,

	queuePool: [],
	currentVideo: null,
	currentIndex: -1,

	shufflePool: [],
	shuffleIndex: 0,

	playHistory: [],
	historyIndex: 0,

	options: {
		autoplay: true,
		shuffle: false,
		repeat: 'playlist'
	}
};

Queue.get = function() {
	return this.queuePool;
};

Queue.set = function(videos) {
	this.queuePool = videos;
	this.currentVideo = null;
	this.currentIndex = -1;

	this.shufflePool = [];
	this.shuffleIndex = 0;

	this.playHistory = [];
	this.historyIndex = 0;

	this.nextVideo();
};

Queue.add = function(video) {
	this.queuePool.push(video);
};

Queue.toggle = function(video) {
	if(this._findVideoIndexById(video.id) > -1) {
		this.remove(video.id);
		return false;
	} else {
		this.add(video);
		return true;
	}
};

Queue.remove = function(id) {
	var index = this._findVideoIndexById(id);
	if(index) {
		var video = this.get(id);
		this.queuePool.splice(index, 1);

		return video;
	}

	return false;
};

Queue.moveTo = function(id, new_index) {
	var index = this._findVideoIndexById(id);
	if(index) {
		this.move(index, new_index);
	}
};

Queue.move = function(old_index, new_index) {
	if(new_index >= this.queuePool.length) {
		var k = new_index - this.queuePool.length;
		while ((k--) + 1) {
			this.queuePool.push(undefined);
		}
	}

	this.queuePool.splice(new_index, 0, this.queuePool.splice(old_index, 1)[0]);
};

Queue.nextVideo = function() {
	// Repeat the current video if repeat state is video
	if(this.options.repeatState == 'video' && this.currentVideo) {
		return this.currentVideo;
	}

	// If playing from within playHistory
	if(this.historyIndex > 0 && this.playHistory.length >= this.historyIndex) {
		// Move forward a song in the history
		this.historyIndex--;

		return this.selectVideo(this.playHistory[this.historyIndex]);
	} else {
		if(this.options.shuffle) {
			if(this.shuffleIndex == this.shufflePool.length) {
				// Reshuffle for randomness
				this._generateShufflePool();
			}

			// Play the next shuffle video
			this.playHistory.unshift(this.shufflePool[this.shuffleIndex]);
			this.shuffleIndex++;

			// One less than shuffleIndex to counteract above increment
			return this.selectVideo(this.shufflePool[this.shuffleIndex - 1]);
		} else {
			// Not shuffled, play next video in queue
			var index = this.currentIndex + 1;

			if(index == this.queuePool.length) {
				index = 0;
			}

			// Add the video to history
			this.playHistory.unshift(this.queuePool[index]);
			return this.selectVideo(this.queuePool[index]);
		}
	}
};

Queue.previousVideo = function() {
	// Find previous video if it exists
	if(this.playHistory.length > 0 && this.historyIndex + 1 < this.playHistory.length) {
		// Increment history marker
		this.historyIndex++;

		return this.selectVideo(this.playHistory[this.historyIndex]);
	} else {
		// Move to the previous video in the playlist
		var index = this.currentIndex - 1;

		if(index === -1) {
			index = this.queuePool.length - 1;
		}

		return this.selectVideo(this.queuePool[index]);
	}
};

Queue.selectVideo = function(video) {
	var indexInQueue = this._findVideoIndex(video);

	if(indexInQueue === -1) {
		throw new Error('That video is not in the currently selected playlist.');
		return;
	}

	this.currentIndex = indexInQueue;
	this.currentVideo = video;

	return this.currentVideo;
};

Queue.togglePlaying = function() {
	this.isPlaying = !this.isPlaying;

	return this.isPlaying;
};

Queue.toggleShuffle = function() {
	this.options.shuffle = !this.options.shuffle;
};

Queue.toggleRepeat = function() {
	this.options.repeat = REPEAT_STATES[(REPEAT_STATES.indexOf(this.options.repeat) + 1) % 3];
};

Queue.sortVideos = function(attr, asc) {
	if(typeof asc == 'undefined') {
		asc = true;
	}

	this.queuePool = _.sortBy(this.queuePool, function(video) {
		return video[attr];
	});

	if(asc == false) {
		this.queuePool = _.reverse(this.queuePool);
	}

	this.currentIndex = this._findVideoIndex(this.currentVideo);
};

Queue._findVideoIndex = function(video) {
	return _.findIndex(this.queuePool, function(queueVideo) {
		return _.isEqual(video, queueVideo);
	});
};

Queue._findVideoIndexById = function(id) {
	return _.findIndex(this.queuePool, function(queueVideo) {
		return queueVideo.id == id;
	});
}

Queue._generateShufflePool = function() {
	this.shufflePool = this.queuePool.slice(0);

	if(this.queuePool.length > 1) {
		// Remove the current video
		var currentVideo = this.shufflePool.splice(this.currentIndex, 1)[0];

		this.shufflePool = _.shuffle(this.shufflePool);

		// Re-add current video at beginning
		this.shufflePool.unshift(currentVideo);

		// Set shuffled index one video after current
		this.shuffleIndex = 1;
	} else {
		this.shuffleIndex = 0;
	}
};

module.exports = Queue;