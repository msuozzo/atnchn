
var INTERVAL_IN_MILLIS = 1000;
var default_banned_sites = ["facebook.com", "reddit.com", "youtube.com", "engadget.com", "bwog.com"];
var start;
var BANNED_SITES = 'BANNED_SITES';
var DEFAULT_SITES = 'DEFAULT_SITES';
chrome.storage.sync.set({BANNED_SITES: default_banned_sites});
chrome.storage.sync.set({DEFAULT_SITES: default_banned_sites});
chrome.storage.sync.get(null, function(sites) {
  console.log(sites);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request == 'reset') {
    chrome.storage.sync.get(DEFAULT_SITES, function(response) {
      chrome.storage.sync.set({BANNED_SITES: response[DEFAULT_SITES]});
    });
		console.log('Sites Reset to defaults');
	}
});


setInterval(function () {
	start = new Date().getTime();
	chrome.tabs.query({active: true, currentWindow: true, status: "complete"}, function(tabs) {
		// Retrieve URL
		var current = tabs[0];
		if (!current) {
			return;
		}
		var url = current.url;
		console.log('Current Url: '+url);
		// Get Base URL
		var pattern = /:\/\/(www\.)?([^\/]*)/.exec(url);
		url = (pattern === null) ? url : pattern[2];
		var base_url = url ? url : "Idle";
		console.log('Base Url: '+base_url);
    chrome.storage.sync.get(BANNED_SITES, function(response){
      if (response[BANNED_SITES].indexOf(base_url) > -1) {
        chrome.tabs.remove(current.id);
        alert("Fuck you.");
      }
    });
	});
	console.log('Time for func Execution: '+(new Date().getTime() - start)+'ms');
}, INTERVAL_IN_MILLIS);
