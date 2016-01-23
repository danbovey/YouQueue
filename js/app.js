$(function() {
	var type;

	var Queue = {
		load: function() {
			chrome.runtime.sendMessage({
				action: 'load'
			});
		},
		toggle: function(video) {
			chrome.runtime.sendMessage({
				action: 'toggle',
				video: video
			});
		},
		find: function(id) {
			chrome.runtime.sendMessage({
				action: 'find',
				id: id
			});
		},
		moveTo: function(id, new_index) {
			chrome.runtime.sendMessage({
				action: 'moveTo',
				id: id,
				new_index: new_index
			});
		},
		getNextVideo: function() {
			chrome.runtime.sendMessage({
				action: 'nextVideo'
			});
		},
		addToDOMQueue: function(video) {
			$('#youqueue-queue').append(
				'<a href="' + video.link + '" class="youqueue-video" title="' + video.title + '" data-id="' + video.id + '">' +
					'<button type="button" class="youqueue-remove">&times;</button>' + 
					'<img src="' + video.img + '">' +
				'</a>'
			);
		},
		removeFromDOMQueue: function(video) {
			$('#youqueue-queue').find('[data-id="' + video.id + '"]').remove();
		},
		updateThumbActions: function(video) {
			console.log('#browse-items-primary data-context-item-id="' + video.id + '"]');
			console.log($('#browse-items-primary').find('[data-context-item-id="' + video.id + '"]'));

			$('#browse-items-primary').find('[data-context-item-id="' + video.id + '"] .addto-queue-button').addClass('addto-watch-queue-button-success');

		},
		add: function(video) {
			chrome.runtime.sendMessage({
				action: 'add',
				video: video
			});

			Queue.addToDOMQueue(video);
		},
		playNext: function(video) {
			chrome.runtime.sendMessage({
				action: 'playNext',
				video: video
			});
			
			Queue.addToDOMQueue(video);
		},
		remove: function(id) {
			var index = chrome.runtime.sendMessage({
				action: 'remove',
				id: id,
			});
		}
	}

	if($('#browse-items-primary').length) {
		type = 'subscriptions';

		chrome.runtime.sendMessage({
			action: 'connect',
			tabType: 'subscriptions'
		});
	} else if($('#player:not(.off-screen)').length) {
		type = 'player';

		chrome.runtime.sendMessage({
			action: 'connect',
			tabType: 'player'
		});
	}

	var loadQueueDOM = function(list) {
		var $queueBar = $(
			'<div id="youqueue-bar">' +
				'<div id="youqueue-actions">' +
					'<button type="button" class="youqueue-button" id="youqueue-prev" title="Play Next">' +
						'<span class="yt-prev-icon yt-sprite"></span>' +
					'</button>' +
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

		for(var video in list) {
			Queue.addToDOMQueue(list[video]);
		}

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
			Queue.moveTo(id, new_index);

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

			var video = {
				id: $(this).data('video-ids'),
				title: $(this).parent().parent().find('.yt-lockup-title a').attr('title'),
				link: $(this).parent().find('a').first().attr('href'),
				img: $(this).parent().find('.yt-thumb img').attr('src')
			};

			Queue.toggle(video);

			return false;
		});

		$('body').on('click', '.youqueue-remove', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var id = $(this).parent().data('id');
			Queue.remove(id);
		});

		chrome.runtime.onMessage.addListener(function(data) {
			switch(data.action) {
				case 'load':
					var list = data.list;
					if(list) {
						for(var i in list) {
							var video = list[i];
							Queue.addToDOMQueue(video);
							Queue.updateThumbActions(video);
						}
					}
					break;
				case 'toggle':
					if(data.type == 'added') {
						Queue.addToDOMQueue(data.video);
					} else if(data.type == 'removed') {
						Queue.removeFromDOMQueue(data.video);
					}
					break;
				case 'remove':
					if(data.video) {
						Queue.removeFromDOMQueue(data.video);
					}
					break;
			}
		});
	}

	var getPlayer = function() {
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

	var loadPlayerDOM = function() {
		var player = getPlayer();
		if(player) {
			var video = player[0];
			window.setInterval(function() {
				if(video.currentTime == video.duration) {
					Queue.getNextVideo();
				}
			}, 250);
		}

		chrome.runtime.onMessage.addListener(function(data) {
			switch(data.action) {
				case 'add':
					console.log('video was added...');
					break;
				case 'nextVideo':
					if(data.video.link) {
						window.location.href = data.video.link;
					}
					break;
			}
		});
	}

	chrome.runtime.onMessage.addListener(function(data) {
		switch(data.action) {
			case 'connect':
				if(type == 'subscriptions') {
					loadQueueDOM(data.list);
				} else if(type == 'player') {
					loadPlayerDOM();
				}
				break;
		}
	});
});