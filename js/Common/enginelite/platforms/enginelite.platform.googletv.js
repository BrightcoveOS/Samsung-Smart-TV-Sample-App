(function() {
	var platform = new TVEngine.Platform('googletv');
	platform.setResolution(1280,720);
	platform.detectPlatform = function() {
		if(navigator.appCodeName.search(/Maple/) > -1) {
			return true;
		}
	}
	platform.keys = function() {
		return new Common.API.TVKeyValue();
	}
	platform.setMediaPlayer("samsungnative");
	platform.exit = function(fullexit) {
		$log(" SAMSUNG EXIT? " + fullexit);
		try {
			if (fullexit) {
				$log(" CALLING EXIT EVENT ")
				$W.sendExitEvent();
			} else {
				$W.sendReturnEvent();
			}
		} catch(e) {
			$error("Error with full exit on samung: " + e);
		}
	}

	TVEngine.Platforms.addSupportedPlatform(platform);
}());