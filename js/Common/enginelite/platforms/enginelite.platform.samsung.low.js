(function() {
	var platform = new TVEngine.Platform('SamsungLow');
	platform.setResolution(960,540);
	platform.detectPlatform = function() {
		var v = this.cleanAppVersion();
		if(navigator.appCodeName.search(/Maple/) > -1 && parseInt(v.major, 10) < 6 ) {
			return true;
		}
	}
	platform.setMediaPlayer("samsungnative");
	platform.keys = function() {
		return new Common.API.TVKeyValue();
	}
	platform.exit = function(fullexit) {
		try {
			if (fullexit) {
				$W.sendReturnEvent();
			} else {
				$W.sendExitEvent();
			}
		} catch(e) {
			$error("Error with full exit on samung: " + e);
		}
	}
	platform.init = function() {
		// Going to disable JQuery effects
		$log("Disabling JQuery effects");
		$.fx.off = true;
	}
	TVEngine.Platforms.addSupportedPlatform(platform);
}());