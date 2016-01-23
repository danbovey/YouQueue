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
			chrome.tabs.sendMessage(tab.id, {
				action: 'connect',
				list: Queue.list
			});
		} else if(data.tabType == 'player') {
			playerTab = player.tab;
			chrome.tabs.sendMessage(tab.id, {
				action: 'connect',
				list: Queue.list
			});
		}

		return;
	}

	if(tab.id == subscriptionTab.id) {
		switch(data.action) {
			case 'load':
				var list = Queue.list;
				return chrome.tabs.sendMessage(tab.id, { action: 'load', list: list });
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
		}
	} else if(tab.id == playerTab.id) {
		// TODO - Add control over player tab
	}
});