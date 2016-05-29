window.Queue = require('./modules/Queue.js');

var subscriptionTabs = [];
var playerTab = null;

chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
	if(typeof sender.tab == 'undefined' || typeof data.action == 'undefined' || typeof sendResponse != 'function') {
		return;
	}

	var tab = sender.tab;

	if(data.action == 'connect') {
		if(data.type == 'subscriptions') {
			subscriptionTabs.push(tab.id);
			sendResponse({
				index: Queue.currentIndex,
				list: Queue.get(),
				options: Queue.options
			});
		} else if(data.type == 'player') {
			playerTab = tab.id;
			sendResponse({
				index: Queue.currentIndex,
				list: Queue.get(),
				options: Queue.options
			});
		}

		return;
	}

	if(subscriptionTabs.length > 0 && subscriptionTabs.indexOf(tab.id) > -1) {
		switch(data.action) {
			case 'load':
				return sendResponse({
					list: Queue.get()
				});
			case 'play':
				Queue.isPlaying == true;
				if(playerTab == null && Queue.get().length > 0) {
					var firstVideo = Queue.nextVideo();

					chrome.tabs.create({
						url: 'https://youtube.com' + firstVideo.link,
						active: true,
						openerTabId: tab.id
					}, function(newTab) {
						playerTab = newTab.id;
					});

					return sendResponse({
						newTab: true
					});
				}

				return sendResponse({
					newTab: false
				});
			case 'toggle':
				var video = data.video
				var inQueue = Queue.toggle(video);
				return sendResponse({
					inQueue: inQueue
				});
			case 'remove':
				var id = data.id;
				var video = Queue.get(id);
				if(video) {
					Queue.remove(id);
					return sendResponse({
						video: video
					});
				}
				break;
			case 'moveTo':
				return Queue.moveTo(data.id, data.new_index);
		}
	} else if(playerTab && tab.id == playerTab) {
		switch(data.action) {
			case 'nextVideo':
				var video = Queue.nextVideo();

				chrome.tabs.sendMessage(playerTab, {
					action: 'updateQueue',
					list: Queue.get(),
					index: Queue.currentIndex
				});

				for(var i in subscriptionTabs) {
					chrome.tabs.sendMessage(subscriptionTabs[i], {
						action: 'updateQueue',
						list: Queue.get(),
						index: Queue.currentIndex
					});
				}

				return sendResponse({
					video: video
				});
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
		if(tabId == playerTab) {
			playerTab = null;
			Queue.playing = false;
		} else if(subscriptionTabs.length > 0) {
			var index = subscriptionTabs.indexOf(tab.id);

			if(index > -1) {
				subscriptionTabs.splice(index, 1);
			}
		}
	}
});

chrome.tabs.onRemoved.addListener(function(tabId) {
	if(tabId == playerTab) {
		Queue.isPlaying = false;
		playerTab = null;

		for(var i in subscriptionTabs) {
			chrome.tabs.sendMessage(subscriptionTabs[i], {
				action: 'togglePlay',
				playing: Queue.isPlaying
			});
		}
	} else if(subscriptionTabs.length > 0) {
		var index = subscriptionTabs.indexOf(tabId);

		if(index > -1) {
			subscriptionTabs.splice(index, 1);
		}
	}
});