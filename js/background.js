window.Queue = require('./modules/Queue.js');

var subscriptionTab; // TODO - Support for multiple tabs
var playerTab;

chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
	if(typeof sender.tab == 'undefined' || typeof data.action == 'undefined' || typeof sendResponse != 'function') {
		return;
	}

	var tab = sender.tab;

	if(data.action == 'connect') {
		if(data.type == 'subscriptions') {
			subscriptionTab = tab;
			sendResponse({
				index: Queue.index,
				list: Queue.list,
				options: Queue.options
			});
		} else if(data.type == 'player') {
			playerTab = tab;
			sendResponse({
				index: Queue.index,
				list: Queue.list,
				options: Queue.options
			});
		}

		return;
	}

	if(subscriptionTab && tab.id == subscriptionTab.id) {
		switch(data.action) {
			case 'load':
				sendResponse({
					list: Queue.list
				});
				break;
			case 'togglePlay':
				var type = Queue.togglePlay();
				if(type == true && typeof playerTab == 'undefined' && Queue.list.length > 0) {
					var firstVideo = Queue.getNextVideo();

					chrome.tabs.create({
						url: 'https://youtube.com' + firstVideo.link,
						active: true,
						openerTabId: subscriptionTab.id
					}, function(tab) {
						playerTab = tab;
					});
				}
				sendResponse({
					type: type
				});
				break;
			case 'toggle':
				var video = data.video
				var type = Queue.toggle(video);
				sendResponse({
					type: type,
					video: video
				});
				break;
			case 'remove':
				var id = data.id;
				var video = Queue.get(id);
				if(video) {
					Queue.remove(id);
					sendResponse({
						video: video
					});
				}
			case 'moveTo':
				Queue.moveTo(data.id, data.new_index);
				break;
		}
	} else if(playerTab && tab.id == playerTab.id) {
		switch(data.action) {
			case 'nextVideo':
				var video = Queue.getNextVideo();
				sendResponse({
					video: video
				});

				chrome.tabs.sendMessage(playerTab.id, {
					action: 'updateQueue',
					list: Queue.list,
					options: Queue.options
				});
				break;
			case 'setOption':
				if(data.name && data.value) {
					Queue.options[data.name] = data.value;

					// Push new options
				}
				break;
			case 'toggleOption':
				if(data.name) {
					Queue.options[data.name] = !Queue.options[data.name];

					// Push new options
				}
				break;
		}
	}
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	// URL is provided only if it has changed
	if(changeInfo.url) {
		if(playerTab && tabId == playerTab.id) {
			playerTab = null;
			Queue.playing = false;
		} else if(subscriptionTab && tabId == subscriptionTab.id) {
			subscriptionTab = null;
		}
	}
});

chrome.tabs.onRemoved.addListener(function(tabId) {
	if(playerTab && tabId == playerTab.id) {
		playerTab = null;
		Queue.playing = false;
	} else if(subscriptionTab && tabId == subscriptionTab.id) {
		subscriptionTab = null;
	}
});