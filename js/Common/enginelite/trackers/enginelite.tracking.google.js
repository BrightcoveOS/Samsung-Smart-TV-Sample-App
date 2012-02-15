TVEngine.Tracker = TVEngine.Tracker || {};
TVEngine.Tracker.Google = {
	trackEvent: function(category, action, label, value) {
		_gaq.push(['_trackEvent', category, action, label, value]);
	}
}