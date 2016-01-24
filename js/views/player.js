var API = require('./../modules/API.js');

module.exports = {
	player: null,
	load: function() {
		this.player = this.getPlayer();
		if(this.player) {
			var video = this.player[0];
			window.setInterval(function() {
				if(video.currentTime == video.duration) {
					API.queue.getNextVideo(function(response) {
						if(response.video) {
							window.location.href = response.video.link;
						}
					});
				}
			}, 250);
		}
	},
	getPlayer: function() {
		if($('movie_player').length && $('movie_player').prop('tagName') === 'EMBED') {
			return $('movie_player');
		}

		if($('video').length) {
			var html = $('video');
			html.getPlayerState = function() {
				return html.ended ? 0 : 1;
			}
			html.seekTo = function(value) {
				html.currentTime = value;
				html.play();
			}
			html.pauseVideo = function() {
				html.pause();
			}
			html.playVideo = function() {
				html.play();
			}
			return html;
		}

		return null;
	}
};