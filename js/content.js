var API = require('./modules/API.js');

var queue = require('./views/queue.js');
var player = require('./views/player.js');

$(function() {
	var type;

	if($('#browse-items-primary').length) {
		type = 'subscriptions';
		API.connect(type, function(response) {
			if(response) {
				queue.init(response);
			}
		});
	} else if($('#player:not(.off-screen)').length) {
		type = 'player';
		API.connect(type, function(response) {
			if(response) {
				player.load(response);
			}
		});
	}
});