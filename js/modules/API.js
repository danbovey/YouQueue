module.exports = {
	connect: function(type, callback) {
		chrome.runtime.sendMessage({
			action: 'connect',
			type: type
		}, function(response) {
			callback(response);
		});
	},
	queue: {
		togglePlay: function(callback) {
			chrome.runtime.sendMessage({
				action: 'togglePlay'
			}, function(response) {
				callback(response);
			});
		},
		toggle: function(video, callback) {
			chrome.runtime.sendMessage({
				action: 'toggle',
				video: video
			}, function(response) {
				callback(response);
			});
		},
		find: function(id, callback) {
			chrome.runtime.sendMessage({
				action: 'find',
				id: id
			}, function(response) {
				callback(response);
			});
		},
		moveTo: function(id, new_index) {
			chrome.runtime.sendMessage({
				action: 'moveTo',
				id: id,
				new_index: new_index
			});
		},
		getNextVideo: function(callback) {
			chrome.runtime.sendMessage({
				action: 'nextVideo'
			}, function(response) {
				callback(response);
			});
		},
		add: function(video) {
			chrome.runtime.sendMessage({
				action: 'add',
				video: video
			}, function(response) { // If response.success?
				callback(response);
			});
		},
		playNext: function(video) {
			chrome.runtime.sendMessage({
				action: 'playNext',
				video: video
			}, function(response) { 
				callback(response);
			});
		},
		remove: function(id, callback) {
			var index = chrome.runtime.sendMessage({
				action: 'remove',
				id: id,
			}, function(response) {
				callback(response);
			});
		}
	},
	options: {
		set: function(name, value) {
			chrome.runtime.sendMessage({
				action: 'setOption',
				name: name,
				value: value
			});
		},
		toggle: function(name) {
			chrome.runtime.sendMessage({
				action: 'toggleOption',
				name: name
			});
		}
	}
};