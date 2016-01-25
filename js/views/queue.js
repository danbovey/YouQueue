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

		$('#youqueue-queue').on('mousedown', '.youqueue-video img', function(e) {
			e.preventDefault();
			$(this).parent().addClass('dragover');
		});
		$('#youqueue-queue').on('mousemove', '.youqueue-video img', function() {
			if($(this).parent().hasClass('dragover') && !$(this).parent().hasClass('dragging')) {
				$(this).parent().addClass('dragging');
				var img = $(this).clone().addClass('dragger').appendTo('#youqueue-queue');
			}
		});

		$(document).mouseup(function(e) {
			var img = $('#youqueue-queue .dragger');
			var left = e.clientX - img.width();
			$('#youqueue-queue .youqueue-video').each(function() {
				if(left > $(this).offset().left - (img.width() / 2)) {
					$('#youqueue-queue .dragging').insertAfter($(this));
				} else {
					$('#youqueue-queue .dragging').insertBefore($(this));
				}
			});

			var id = $('#youqueue-queue .dragging').data('id');
			var new_index = $('#youqueue-queue .dragging').index();
			API.queue.moveTo(id, new_index);

			$('#youqueue-queue .youqueue-video').removeClass('dragover').removeClass('dragging');
			$('#youqueue-queue .dragger').remove();
		});
		$(document).mousemove(function(e) {
			if($('#youqueue-queue .dragger').length) {
				var img = $('#youqueue-queue .dragger');
				var left = e.clientX - (img.width() / 2) - $('#youqueue-queue').offset().left;
				img.css('left', left);
			}
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
				if(response.type == 'added') {
					self.addToBar(response.video);
				} else if(response.type = 'removed') {
					self.removeFromBar(response.video);
				}
			});

			return false;
		});

		$('#youqueue-play').click(function() {
			var $icon = $(this).find('.yt-sprite');
			API.queue.togglePlay(function(response) {
				if(response.type == 'playing') {
					$icon.removeClass('yt-play-icon').addClass('yt-pause-icon');
				} else if(response.type == 'paused') {
					$icon.removeClass('yt-pause-icon').addClass('yt-play-icon');
				}
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
			console.log(data);
			if(data.action == 'updateQueue') {
				self.load(data.list);
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
	},
	removeFromBar: function(video) {
		$('#youqueue-queue').find('[data-id="' + video.id + '"]').remove();
	},
	updateThumbActions: function(video) { // TODO - Make this work!
		console.log('#browse-items-primary data-context-item-id="' + video.id + '"]');
		console.log($('#browse-items-primary').find('[data-context-item-id="' + video.id + '"]'));

		$('#browse-items-primary').find('[data-context-item-id="' + video.id + '"] .addto-queue-button').addClass('addto-watch-queue-button-success');
	}
};