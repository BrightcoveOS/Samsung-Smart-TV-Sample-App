TVEngine.Tracker = TVEngine.Tracker || {};
TVEngine.Tracker.Omniture = {
	trackEvent: function(category, action, label, value) {
		var s_account="cjohnstest2"
		var s=s_gi(s_account);
		s.linkTrackEvents="None";
		s.linkTrackVars="prop1,prop2,prop3";
		s.prop1 = action; s.prop2 = label; s.prop3=value;
		s.tl(true, 'o');
	}
}