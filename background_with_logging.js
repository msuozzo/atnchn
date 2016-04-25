
var INTERVAL_IN_MILLIS = 1000;
var stored_sites = [];
var STORED_SITES_KEY = 'stored_sites';
var bad_sites = ["facebook.com", "reddit.com"];
var start;


chrome.storage.local.get('current', function(sites) {
  console.log(sites);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request == 'reset') {
		chrome.storage.local.clear();
		console.log('Storage Reset');
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
		url = (pattern == null) ? url : pattern[2];
		var base_url = url ? url : "Idle";
		console.log('Base Url: '+base_url);
		// Add time interval
		chrome.storage.local.get(base_url, function(items) {
			console.log('stuff retrived: '+items[base_url]);
			var curr_val = items[base_url];
			var new_val = (curr_val === undefined) ? INTERVAL_IN_MILLIS : curr_val + INTERVAL_IN_MILLIS;
			if (bad_sites.indexOf(base_url) > -1 && new_val > 2 * INTERVAL_IN_MILLIS) {
				alert("get the fuck off "+base_url);
				new_val = 0;
			}
			console.log('New Time Value: '+new_val);
			items = {};
			items[base_url] = new_val;
			chrome.storage.local.set(items, function() {
				console.log('New time value saved  '+base_url+': '+new_val);
			});
		});
		// Store the list of sites
		if (!(base_url in stored_sites)) {
			stored_sites.concat(base_url);
			console.log('New site added');
			items = {};
			items[STORED_SITES_KEY] = stored_sites;
			chrome.storage.local.set(items);
			console.log('Site list saved');
		}
	});
	console.log('Time for func Execution: '+(new Date().getTime() - start)+'ms');
}, INTERVAL_IN_MILLIS);
