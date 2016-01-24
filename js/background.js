var Queue = require('./modules/Queue.js');

var subscriptionTab; // TODO - Support for multiple tabs
var playerTab;

chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
	var tab = sender.tab;

	if(typeof data.action == 'undefined' || typeof sendResponse != 'function') {
		return;
	}

	if(data.action == 'connect') {
		if(data.type == 'subscriptions') {
			subscriptionTab = tab;
			sendResponse({
				list: Queue.list
			});
		} else if(data.type == 'player') {
			playerTab = tab;
			sendResponse({
				list: Queue.list
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
				if(type == 'playing' && typeof playerTab == 'undefined' && Queue.list.length > 0) {
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
				console.log(Queue.list);
				break;
		}
	} else if(playerTab && tab.id == playerTab.id) {
		switch(data.action) {
			case 'nextVideo':
				var video = Queue.getNextVideo();
				sendResponse({
					video: video
				});
				break;
		}
	}
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	// URL is provided only if it has changed
	if(changeInfo.url) {
		if(tabId == playerTab.id) {
			playerTab = null;
			Queue.playing = false;
		} else if(tabId == subscriptionTab.id) {
			subscriptionTab = null;
		}
	}
});

chrome.tabs.onRemoved.addListener(function(tabId) {
	if(tabId == playerTab.id) {
		playerTab = null;
		Queue.playing = false;
	} else if(tabId == subscriptionTab.id) {
		subscriptionTab = null;
	}
});