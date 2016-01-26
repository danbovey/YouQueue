var Queue = {
	index: 0,
	list: [],
	shuffledList: [],
	playing: false,
	options: {
		autoplay: true,
		shuffle: false,
		repeat: false
	}
};

Queue.get =  function(id) {
	for(var video in this.list) {
		if(this.list[video].id == id) {
			return this.list[video];
		}
	};

	return false;
};

Queue.getNextVideo =  function() {
	if(this.list.length) {
		var next = this.list[this.index];
		if(next) {
			this.index++;
			return next;
		}
	}

	return [];
};

Queue.getPreviousVideo =  function() {
	if(this.list.length) {
		var prev = this.list[this.index - 1];
		if(prev) {
			this.index--;
			return prev;
		}
	}

	return [];
};

Queue.find =  function(id) {
	for(var video in this.list) {
		if(this.list[video].id == id) {
			return video;
		}
	};

	return false;
};

Queue.togglePlay =  function() {
	this.playing = !this.playing;

	if(this.playing) {
		// TODO - chrome.runtime.sendMessage to all players
		return true;
	} else {
		// TODO - chrome.runtime.sendMessage to all players
		return false;
	}
};

Queue.toggle =  function(video) {
	if(this.find(video.id)) {
		this.remove(video.id);
		return 'removed';
	} else {
		this.add(video);
		return 'added';
	}
};


Queue.add =  function(video) {
	this.list.push(video);
};

Queue.playNext =  function(video) {
	// Add the video to the start of the array
	this.list.unshift(video);
},

Queue.remove =  function(id) {
	var inQueue = this.find(id);
	if(inQueue) {
		this.list.splice(inQueue, 1);

		return this.get(id);
	}

	return false;
};

Queue.moveTo =  function(id, new_index) {
	var index = this.find(id);
	if(index) {
		this.move(index, new_index);
	}
};

Queue.move =  function(old_index, new_index) {
	if(new_index >= this.list.length) {
		var k = new_index - this.list.length;
		while ((k--) + 1) {
			this.list.push(undefined);
		}
	}

	this.list.splice(new_index, 0, this.list.splice(old_index, 1)[0]);
};

Queue.shuffle = function() {
	// Make a clone of the list
	var o = this.list.slice();
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    
    this.shuffledList = o;
};

module.exports = Queue;