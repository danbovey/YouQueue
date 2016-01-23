$(function() {
	var Queue = {
		load: function() {
			chrome.runtime.sendMessage({
				action: 'load'
			}, function(response) {
				var list = response.list;
				console.log(list);
				if(list) {
					for(var video in list) {
						$('#youqueue-queue').append(
							'<a href="' + list[video].link + '" class="youqueue-video" title="' + list[video].title + '" data-id="' + list[video].id + '">' +
								'<img src="' + list[video].img + '">' +
							'</a>'
						);
					}
				}
			});
		},
		toggle: function(video) {
			chrome.runtime.sendMessage({
				action: 'toggle',
				video: video
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
		chrome.runtime.sendMessage({
			action: 'connect',
			tabType: 'subscriptions'
		});
	}

	var loadQueueDOM = function(list) {
		var $queueBar = $(
			'<div id="youqueue-bar">' +
				'<div id="youqueue-actions">' +
					'<button type="button" class="youqueue-button" title="Start/Stop Queue">' +
						'<span class="yt-pl-icon yt-pl-icon-reg yt-sprite"></span>' +
					'</button>' +
				'</div>' +
				'<div id="youqueue-queue"></div>' +
			'</div>'
		);
		$queueBar.appendTo('body');

		for(var video in list) {
			Queue.addToDOMQueue(list[video]);
		}

		$('#youqueue-queue').dad({
			target: '.youqueue-video',
			draggable: 'img',
			callback: function(e) {
				// Queue position may have changed in the DOM, so check the positions of videos there
				var id = $(e.context).data('id');

				var index = Queue.find(id);
				var new_index = $(e.context).index();

				if(index != new_index) {
					Queue.move(index, new_index);
				}
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
	}

	chrome.runtime.onMessage.addListener(function(data) {
		switch(data.action) {
			case 'connect':
				loadQueueDOM(data.list);
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
});