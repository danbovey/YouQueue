var API = require('./../modules/API.js');

module.exports = {
	player: null,
	options: {},
	load: function(data) {
		var self = this;

		this.options = data.options;
		this.player = this.getPlayer();
		if(this.player) {
			window.setInterval(function() {
				if(self.player[0].currentTime == self.player[0].duration && self.options.autoplay) {
					API.queue.getNextVideo(function(response) {
						if(response.video && response.video.link) {
							console.log(response.video.link);
							window.location.href = response.video.link;
						}
					});
				}
			}, 250);
		}

		$sidebar = $('#watch7-sidebar-modules');
		$autoplayBar = $sidebar.find('.autoplay-bar');
		
		$autoPlayCheckbox = $('#autoplay-checkbox');
		$autoPlayCheckbox.attr('id', 'youqueue-autoplay-checkbox');
		$autoPlayCheckbox.checked = data.options.autoplay;
		$autoPlayCheckbox.click(function(e) {
			API.options.toggle('autoplay');
			self.options.autoplay = !self.options.autoplay;
		});
		$autoplayBar.find('.autoplay-hovercard').remove();
		$autoplayBar.find('.checkbox-on-off > label').text('Autoplay Queue');

		$sidebarFirst = $autoplayBar.find('.video-list');
		$sidebarRelated = $sidebar.find('#watch-related');
		$sidebarFirst.empty();
		$sidebarRelated.empty();

		if(data.list.length > 0) {
			var firstVideo = data.list[0];
			$sidebarFirst.append(this.sidebarVideo(firstVideo));

			if(data.list.length > 1) {
				$(
					'<h4 class="watch-sidebar-head">' +
						'Then' +
					'</h4>'
				).insertBefore($sidebarRelated);
			}

			for(var i = 1; i < data.list.length; i++) {
				var video = data.list[i];

				$sidebarRelated.append(this.sidebarVideo(video));
			}
		} else {
			$sidebarFirst.append($(
				'<button class="youqueue-nothing-queued yt-uix-button yt-uix-button-size-default yt-uix-button-expander" type="button" onclick=";return false;"><span class="yt-uix-button-content">' + 
					'Nothing queued' + 
				'</span></button>'
			));
			$('#watch7-sidebar-contents').addClass('queue-empty');
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
	},
	sidebarVideo: function(video) {
		var descId = Math.floor(100000 + Math.random() * 900000);
		return $(
			'<li class="video-list-item related-list-item">' +
				'<div class="content-wrapper">' +
					'<a href="' + video.link + '" class="yt-uix-sessionlink content-link" title="' + video.title + '">' +
						'<span dir="ltr" class="title" aria-describedby="description-id-' + descId + '">' +
							video.title +
						'</span>' +
						'<span class="accessible-description" id="description-id-' + descId + '">' +
							' - Duration: ' + video.duration + '.' +
						'</span>' +
						'<span class="stat attribution"><span class="g-hovercard" data-name="autonav" data-ytid="' + video.user.ytid + '">' + video.user.name + '</span></span>' +
						'<span class="stat view-count">' + video.views + ' views</span>' +
					'</a>' +
				'</div>' +
				'<div class="thumb-wrapper">' +
					'<a href="' + video.link + '" class="yt-uix-sessionlink thumb-link" tabindex="-1" aria-hidden="true"><span class="yt-uix-simple-thumb-wrap yt-uix-simple-thumb-related" tabindex="0" data-vid="' + video.code + '"><img alt="" width="120" height="90" src="' + video.img + '" aria-hidden="true"></span></a>' +
					'<span class="video-time">' +
						video.duration +
					'</span>' +
				'</div>' +
        	'</li>'
    	);
	}
};