var Queue = {
	list: [],
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

var subscriptionTab;
var playerTab;

chrome.runtime.onMessage.addListener(function(data, sender) {
	var tab = sender.tab;

	if(data.action == 'connect') {
		if(data.tabType == 'subscriptions') {
			subscriptionTab = tab;
			chrome.tabs.sendMessage(tab.id, { action: 'connect', list: Queue.list });
		} else if(data.tabType == 'player') {
			playerTab = tab;
			chrome.tabs.sendMessage(tab.id, { action: 'connect', list: Queue.list });
		}

		return;
	}

	if(subscriptionTab && tab.id == subscriptionTab.id) {
		switch(data.action) {
			case 'load':
				return chrome.tabs.sendMessage(tab.id, { action: 'load', list: Queue.list });
				break;
			case 'toggle':
				var video = data.video
				var type = Queue.toggle(video);
				return chrome.tabs.sendMessage(tab.id, { action: 'toggle', type: type, video: video });
				break;
			case 'remove':
				var id = data.id;
				var video = Queue.get(id);
				if(video) {
					Queue.remove(id);
					return chrome.tabs.sendMessage(tab.id, { action: 'remove', video: video });
				}
			case 'moveTo':
				Queue.moveTo(data.id, data.new_index);
				console.log(Queue.list);
				break;
		}
	} else if(playerTab && tab.id == playerTab.id) {
		switch(data.action) {
			case 'nextVideo':
				var video = Queue.getNextVideo();
				return chrome.tabs.sendMessage(tab.id, { action: 'nextVideo', video: video });
				break;
		}
	}
});