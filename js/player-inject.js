window.addEventListener('message', function(event) {
    var data = event.data;
    if(data.type == 'youqueue.navigate') {
        window.yt.window.navigate(data.url);
    }
});