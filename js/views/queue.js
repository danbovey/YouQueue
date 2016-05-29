var $ = require('jquery');
require('html5sortable');

var API = require('./../modules/API.js');

module.exports = {
	init: function(data) {
		var self = this;

		var $queueBar = $(
			'<div id="youqueue-bar">' +
				'<div id="youqueue-actions">' +
					'<button type="button" class="youqueue-button" id="youqueue-play" title="Start/Stop Queue">' +
						'<span class="yt-play-icon yt-sprite"></span>' +
					'</button>' +
					'<button type="button" class="youqueue-button" id="youqueue-next" title="Play Next">' +
						'<span class="yt-next-icon yt-sprite"></span>' +
					'</button>' +
				'</div>' +
				'<div id="youqueue-queue"></div>' +
			'</div>'
		);
		$queueBar.appendTo('body');

		var $sortable = $('#youqueue-queue').sortable({
			placeholder: '<div class="video-placeholder"></div>',
			forcePlaceholderSize: true
		});

		$sortable.bind('sortupdate', function(e, ui) {
			API.queue.moveTo(ui.item[0].dataset.id, ui.index);
		});

		var $addToQueueButton = $('.addto-queue-button');
		
		$addToQueueButton.css('display', 'block');
		$addToQueueButton.removeAttr('onclick');
		$addToQueueButton.click(function(e) {
			e.preventDefault();

			// If it's on the queue add success, else take it off
			$(this).addClass('addto-watch-queue-button-success');

			var $userCard = $(this).parent().parent().find('.g-hovercard');
			var link = $(this).parent().find('a').first().attr('href');

			var video = {
				id: $(this).data('video-ids'),
				title: $(this).parent().parent().find('.yt-lockup-title a').attr('title'),
				link: link,
				code: link.replace('/watch?v=', ''),
				img: $(this).parent().find('.yt-thumb img').attr('src'),
				duration: $(this).parent().find('.video-time').text(),
				views: $(this).parent().parent().find('.yt-lockup-meta-info li').first().text().replace(' views', ''),
				user: {
					name: $userCard.text(),
					user: $userCard.attr('href'),
					ytid: $userCard.data('ytid')
				}
			};

			API.queue.toggle(video, function(response) {
				if(response.inQueue == true) {
					self.addToBar(video);
				} else if(response.inQueue == false) {
					self.removeFromBar(video);
				}
			});

			return false;
		});

		$('#youqueue-play').click(function() {
			var $icon = $(this).find('.yt-sprite');

			// if queue is playing use API.queue.pause and $icon.removeClass('yt-pause-icon').addClass('yt-play-icon');
			API.queue.play(function(response) {
				$icon.removeClass('yt-play-icon').addClass('yt-pause-icon');
			});
		});

		$('body').on('click', '.youqueue-remove', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var id = $(this).parent().data('id');
			API.queue.remove(id, function(response) {
				if(response.video) {
					self.removeFromBar(response.video);
				}
			});
		});

		this.load(data);

		chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
			if(data.action == 'updateQueue') {
				self.load(data.list);
			}
		});

		chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
			var $icon = $('#youqueue-play .yt-sprite');

			if(data.action == 'togglePlay') {
				if(data.playing == true) {
					$icon.removeClass('yt-play-icon').addClass('yt-pause-icon');
				} else {
					$icon.removeClass('yt-pause-icon').addClass('yt-play-icon');
				}
			}
		});
	},
	load: function(data) {
		$('#youqueue-queue').empty();
		this.showBar(data.list);
	},
	showBar: function(list) {
		for(var video in list) {
			this.addToBar(list[video]);
		}
	},
	addToBar: function(video, first) {
		if(first == true) {
			$('#youqueue-queue').prepend(
				'<a href="' + video.link + '" class="youqueue-video" title="' + video.title + '" data-id="' + video.id + '">' +
					'<button type="button" class="youqueue-remove">&times;</button>' + 
					'<img src="' + video.img + '">' +
				'</a>'
			);
		} else {
			$('#youqueue-queue').append(
				'<a href="' + video.link + '" class="youqueue-video" title="' + video.title + '" data-id="' + video.id + '">' +
					'<button type="button" class="youqueue-remove">&times;</button>' + 
					'<img src="' + video.img + '">' +
				'</a>'
			);
		}

		$('#youqueue-queue').sortable();
	},
	removeFromBar: function(video) {
		$('#youqueue-queue').find('[data-id="' + video.id + '"]').remove();
		$('#youqueue-queue').sortable();
	},
	updateThumbActions: function(video) { // TODO - Make this work!
		console.log('#browse-items-primary data-context-item-id="' + video.id + '"]');
		console.log($('#browse-items-primary').find('[data-context-item-id="' + video.id + '"]'));

		$('#browse-items-primary').find('[data-context-item-id="' + video.id + '"] .addto-queue-button').addClass('addto-watch-queue-button-success');
	}
};