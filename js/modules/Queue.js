var Queue = {
	list: [],
	playing: false,
	options: {
		autoplay: true
	},
	get: function(id) {
		for(var video in Queue.list) {
			if(Queue.list[video].id == id) {
				return Queue.list[video];
			}
		};

		return false;
	},
	getNextVideo: function() {
		if(Queue.list.length) {
			var next = Queue.list[0];
			Queue.list.splice(0, 1);
			return next;
		}

		return [];
	},
	find: function(id) {
		for(var video in Queue.list) {
			if(Queue.list[video].id == id) {
				return video;
			}
		};

		return false;
	},
	togglePlay: function() {
		this.playing = !this.playing;

		if(this.playing) {
			// TODO - chrome.runtime.sendMessage to all players
			return 'playing';
		} else {
			// TODO - chrome.runtime.sendMessage to all players
			return 'paused';
		}
	},
	toggle: function(video) {
		if(Queue.find(video.id)) {
			Queue.remove(video.id);
			return 'removed';
		} else {
			Queue.add(video);
			return 'added';
		}
	},
	add: function(video) {
		Queue.list.push(video);
	},
	playNext: function(video) {
		Queue.list.unshift(video);
	},
	remove: function(id) {
		var inQueue = Queue.find(id);
		if(inQueue) {
			Queue.list.splice(inQueue, 1);

			return Queue.get(id);
		}

		return false;
	},
	moveTo: function(id, new_index) {
		var index = Queue.find(id);
		if(index) {
			Queue.move(index, new_index);
		}
	},
	move: function(old_index, new_index) {
		if(new_index >= Queue.list.length) {
			var k = new_index - Queue.list.length;
			while ((k--) + 1) {
				Queue.list.push(undefined);
			}
		}
		Queue.list.splice(new_index, 0, Queue.list.splice(old_index, 1)[0]);
	}
};

module.exports = Queue;