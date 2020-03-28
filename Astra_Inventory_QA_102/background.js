chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.sessionid) {
		chrome.runtime.sendMessage({
			msg: "session",
			data: {
				"sessionid": request.sessionid
			}
		});

	} else if (request.inj) {
		chrome.tabs.executeScript({ file: 'inject.js', allFrames: false });
	}
	sendResponse({
        response: true
    });
});