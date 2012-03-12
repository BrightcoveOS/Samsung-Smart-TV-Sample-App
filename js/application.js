TVAppConfig  = {
	// So we try to do a 
	speedTestUrl: null,
}
TVAppConfig.BrightcoveConfig = {

	// Replace these with your customer token.
	// customerToken: ""
	// customerToken: "Q8xYbanPaui20iXx6ZRthz9455HVGZ3XRXjxG45H16hhZoS0_DD4LA..",
	customerToken: "y-3pyd7Twd_EE0ApO83dE8kmk1aGH4gu1QRtXwFn94mrjf65N3etoQ..", //must have read and URL Access with brightcove
		
	// Replace with your Samsung Player ID
	playerID: "1409917605001",
		
	// If this needs to change
	apiURL: "http://api.brightcove.com/services/library",
	
	//Should not need to be changed
	playerParams: {
		"playlist_fields": "id,name"
	},
	playlistParams:  {
		"media_delivery": "http",
		// if you need more video fields you can add them here.
		"video_fields": "id,name,shortDescription,longDescription,tags,thumbnailURL,videoStillURL,renditions",
	},
}


/******************************************************************
	DATA LOADING PIECES
*******************************************************************/
// Our little framework here has some  data loading tools so we can get everything loaded correctly
// prior to displaying.  Check out js/Common/enginelite/enginelite.data.js,

// We need to load 2 feeds in sequential order. We have a simple data loading tool which will
// allow us to do this. With it we pass an array of feeds. It will sequentially load each feed,
// passing the parsed feed from the each feed into the subsequent feed. So its a daisy chain
// of data.  In this case we want to first load our list of valid playlist ids. Then pass that
// list into a second call.

// The Array of feeds (order is important)
var feeds = [];


// Create a new data object.
var data = new TVEngine.DataLoader.Data();
//data.url = "http://stubby.adifferentengine.com/b.json";
data.url = TVAppConfig.BrightcoveConfig.apiURL;
data.params = _.extend({
	"command": 		"find_playlists_for_player_id",
	"player_id": 	TVAppConfig.BrightcoveConfig.playerID,  
	"token": 		TVAppConfig.BrightcoveConfig.customerToken, 
}, TVAppConfig.BrightcoveConfig.playerParams);

data.parser = function(data) {
	if(!data) {
		$error("<<< No Playlists for player id: "+ TVAppConfig.BrightcoveConfig.playerID +" >>>"); 
		return;
	}
	data.playlists = [];
	_.each(data.items, function(playlist){
		data.playlists.push(playlist.id);
	})
	return data;
}

// I'm just returning very nice data so I don't have to worry about it.
// this parsed data will go into our second data item.

// Add to our list of feeds.
feeds.push(data);

var data = new TVEngine.DataLoader.Data();
data.url = TVAppConfig.BrightcoveConfig.apiURL;


data.params = _.extend({
	"command": "find_playlists_by_ids", 
	"token":TVAppConfig.BrightcoveConfig.customerToken
}, TVAppConfig.BrightcoveConfig.playlistParams);

// There is a default getParams function which we are overriding. We need to use
// the results of the last data call (which gets stored in this.startdata) in creating our
// parameters.
data.getParams = function() {
	// this.startdata will be the data returned by the first AJAX call;
	var _this = this;
	this.params = _.extend({
		"playlist_ids": _this.startdata.playlists.join(",")
	}, this.params);	
	return this.params;
}

data.parser = function(data) {
	if(!data) {
		$error("<<< No Video Contents >>>"); return;
	}
	var cleanData = [];
	_.each(data.items, function(item) {
		category = {
			categoryName: item.name,
			id: item.id,
			thumbnail: item.thumbnailURL,
			videos: [],
			playlist: new TVEngine.Playlist(),
		}
		_.each(item.videos, function(video) {
			var vid = {
				id: video.id, name: video.name, description: video.shortDescription, longDescription: video.longDescription,
				thumbnail: video.thumbnailURL, full: video.videoStillURL,tags: video.tags,
			}
			
			var renditions = [];
			
			_.each(video.renditions, function(rendition) {
				if (rendition.videoCodec.toUpperCase() == "H264" && rendition.videoContainer.toUpperCase() == "MP4") {
					renditions.push({
						bitrate: Math.floor(rendition.encodingRate/1024),
						url: rendition.url
					});
				}
			});
			
			if(renditions.length > 0) {
				category.videos.push(vid);
				category.playlist.addItem(renditions);
			} 
		})
		if(!category.thumb && category.videos.length > 0 ) {
			category.thumb = category.videos[0].thumbnail
		}
		if(category.videos.length > 0) cleanData.push(category);
	});
//	$log(cleanData)
	return cleanData;
};
feeds.push(data);

TVEngine.DataLoader.addWaterfall("brightcove:playlists", feeds);

/******************************************************************
	UI Configuration
*******************************************************************/

/*
 *  Set up our Backbone Models and Views
 *  see http://documentcloud.github.com/backbone
 *  for more info. There is a hard dependency in this framework on backbone for 
 *  its event system so it makes sense to use the rest.
 *  We really aren't using a lot of Backbone's  magic here. We mostly use it for rendering
 */

window.Video = Backbone.Model.extend({});
window.VideoView = Backbone.View.extend({
	render: function() {
		var img = (TVEngine.getPlatform().matrix() == "960x540") ? "thumbnail":"full"
		img = "thumbnail";
		$("<img />", {src: this.model.get(img)}).appendTo(this.el);
		return this;
	}
})


window.VideoCategory = Backbone.Collection.extend({
	model: Video
})

window.VideoCategoryView = Backbone.View.extend({
	initialize: function() {
		var _this = this;
		this._videoViews = [];
		this.collection.each(function(video) {
			_this._videoViews.push(new VideoView({
				model: video, tagName: "div", className: 'vidItem'
			}))
		})
	},
	render: function() {
		var _this = this;
		$(this.el).empty();
		_.each(this._videoViews, function(vv){
			$(_this.el).append(vv.render().el);
		});
		if(this.options.target) {
			$(this.options.target).append(this.el);
		}
	},
	
})

window.VideoCategoryTextMenuView = Backbone.View.extend({
		initialize: function() {
		var _this = this;
		this._videoViews = [];
		this.collection.each(function(video) {
			_this._videoViews.push(new VideoView({
				model: video, tagName: "div", className: 'vidItem'
			}))
		})
	},
	render: function() {
		var _this = this;
		$(this.el).empty();
		_.each(this._videoViews, function(vv){
			$(_this.el).append(vv.render().el);
		});
		if(this.options.target) {
			$(this.options.target).append(this.el);
		}
	},
})


/******************************************************************
	The "Application" handling state, etc.
	
	This is the real meat of the interactions here. 
*******************************************************************/
TVEngine.bind("tvengine:appready", function() {
	$log(" Enabling Navigation ");
	$("#wrapper").fadeIn();
	TVEngine.Navigation.start();
	
	
	return;
	
	TVEngine.Tracker.trackEvent("Application", "Ready"); // Track events (right now using GA)


	// Get the data we discussed earlier out of the datastore.
	var playlists = TVEngine.DataStore.get("brightcove:playlists");
	
	
	var videocategories = [];
	
	// Handle each category
	_.each(playlists, function(playlist) {
		var cat = new VideoCategory(playlist.videos, {
			name: playlist.categoryName, thumb: playlist.thumb
		});
		var view = new VideoCategoryView({
			collection: cat, 
			tagName: "div", className: "videoCategory",
			target: $("#playlists")
		})
		view.render();
		$("#playlistsNav").append($("<li> "+playlist.categoryName+"</li>"));
	})

	// We're using a jquery plugin called "waitForImages" so we don't see images 
	// loading 
	$("#playlists").waitForImages(function() {
		$("#wrapper").fadeIn();
		TVEngine.Navigation.enable();
	})
	
	TVEngine.MediaPlayer.bind("mediaplayer:timeupdate", function(time) {
		$("#indicator").css({
			width: Math.floor(time/TVEngine.MediaPlayer.duration() * 100) + "%"
		})
		var readableCurrent = TVEngine.util.convertMstoHumanReadable(time);
		var readableDuration = TVEngine.util.convertMstoHumanReadable(TVEngine.MediaPlayer.duration());
		$("#currentProgressTime").text(readableCurrent.toString() + " / " + readableDuration.toString())
	})
	
	
	
	// Bind to our menu's onSelect handler. Normally you'd put this code in the menu
	// But we're trying to keep everything in one piece right here.
	TVEngine.Navigation.bindToMenu("brightcove:mainmenu", 'onselect', handleMenuSelection);
	
}, TVEngine);

// When something is selected from our menu we will end up here.
var handleMenuSelection = function(items) {
	TVEngine.MediaPlayer.stop();
	playVideo(items.playlist, items.videoIndex);
	showVideo();
}

var playVideo = function(currentPlaylist, currentIndex) {
	
	// There's very much a cleaner way to do this.
	// if( false ) {
	if( TVEngine.AdVendors.VastPreroll ) {
		TVEngine.AdVendors.VastPreroll.fetchAndPlayPreRollAd("http://shadow01.yumenetworks.com/dynamic_preroll_playlist.vast2xml?domain=211jRhjtWMT", function() {
			// If you don't want to use Vast then don't use this chunk as a callback.
			TVEngine.MediaPlayer.setPlaylist(currentPlaylist.playlist);
			TVEngine.MediaPlayer.setCurrentIndex(currentIndex);
			TVEngine.MediaPlayer.play();

			TVEngine.MediaPlayer.bind("mediaplayer:onnextvideo", function(index) {
				$log(" Got onnextvideo event ");
				$("#nowPlayingTitle").text(currentPlaylist.videos[index].name)
				TVEngine.Tracker.trackEvent("Videos", "Play", currentPlaylist.videos[index].name);
			});

			TVEngine.MediaPlayer.bind("mediaplayer:onplaylistend", function() {
				$("#backgroundImage").show();
				showNavigation();
			})

			$("#nowPlayingTitle").text(currentPlaylist.videos[currentIndex].name);
			TVEngine.Tracker.trackEvent("Videos", "Play", currentPlaylist.videos[currentIndex].name);
		
		});
	} else {
		TVEngine.MediaPlayer.setPlaylist(currentPlaylist.playlist);
		TVEngine.MediaPlayer.setCurrentIndex(currentIndex);
		TVEngine.MediaPlayer.play();

		TVEngine.MediaPlayer.bind("mediaplayer:onnextvideo", function(index) {
			$("#nowPlayingTitle").text(currentPlaylist.videos[index].name)
			TVEngine.Tracker.trackEvent("Videos", "Play", currentPlaylist.videos[index].name);
		});

		TVEngine.MediaPlayer.bind("mediaplayer:onplaylistend", function() {
			$("#backgroundImage").show();
			showNavigation();
		})

		$("#nowPlayingTitle").text(currentPlaylist.videos[currentIndex].name);
		TVEngine.Tracker.trackEvent("Videos", "Play", currentPlaylist.videos[currentIndex].name);
	}

}

var showVideo = function(currentPlaylist, currentIndex) {
	TVEngine.KeyHandler.unbind("all", touchVideoNavTimeout);
	clearAllTimeouts();
	setReturnButton("video")
	$("#backgroundImage").hide();
	TVEngine.Navigation.disable();
	
	$("#landingPage").hide();
	$("#videoPage").fadeIn();
	TVEngine.KeyHandler.bind("all", touchVideoInfoTimeout);
	touchVideoInfoTimeout();
	
}


var currentViewState = "menu" // Can Be menu, details or video
var setReturnButton = function(state) {
 	// Can Be menu, details or video
	TVEngine.KeyHandler.unbind("keyhandler:onReturn");
	switch(state) {
		case "menu":
			TVEngine.KeyHandler.bind("keyhandler:onReturn", returnToMenu);
			$(".backButton:first").text("Exit");
			break;
		case "video":
			TVEngine.KeyHandler.bind("keyhandler:onReturn", showNavigation);
			$(".backButton:first").text("Back");
			break;
		case "details":
			TVEngine.KeyHandler.bind("keyhandler:onReturn", closeDetails);
			$(".backButton:first").text("Back");
			break;
	}
}

var closeDetails = function() {
	$("#videoInfoWrapper").hide();
	clearAllTimeouts();
	TVEngine.Navigation.setFocus("brightcove:mainmenu");
	hideMenuTimeout = setTimeout(hideNavigation, 7000);
}

var showDetails = function() {
	clearAllTimeouts()
	$("#videoInfoWrapper").show();
	setReturnButton("details");
	TVEngine.Navigation.setFocus("brightcove:popupmenu");
}

var showNavigation = function() {
	TVEngine.KeyHandler.unbind("all", touchVideoInfoTimeout);
	clearAllTimeouts();
	
	if(!TVEngine.MediaPlayer.playing()) {
		$("#backgroundImage").show();
	}
	
	$("#landingPage").fadeIn();
	$("#videoPage").fadeOut();
	setReturnButton("menu")
	
	TVEngine.Navigation.enable();
	touchVideoNavTimeout();
	TVEngine.KeyHandler.bind("all", touchVideoNavTimeout);
}

var returnToMenu = function() {
	TVEngine.exit(false);
}
var hideNavigation = function() {
	if(TVEngine.MediaPlayer.playing() && $("#videoInfoWrapper").is(":hidden")) {
		clearAllTimeouts();
		$("#landingPage").fadeOut();
		setReturnButton("video")
		TVEngine.KeyHandler.bind("all", touchVideoInfoTimeout);
	}
}
var hideVideoInfoTimeout, hideVideoNavigationTimeout;
var clearAllTimeouts = function() {
	clearTimeout(hideVideoInfoTimeout);
	clearTimeout(hideVideoNavigationTimeout);
}
var touchVideoInfoTimeout = function() {
	if (! $("#landingPage").is(":visible") ) {
		$("#videoPage:hidden").fadeIn();
	}
	clearTimeout(hideVideoInfoTimeout);
	hideVideoInfoTimeout = setTimeout(function() {
		$("#videoPage").fadeOut();
	}, 7000);
}

var touchVideoNavTimeout = function() {
	clearTimeout(hideVideoNavigationTimeout);
	hideVideoNavigationTimeout = setTimeout(function() {
		if (TVEngine.MediaPlayer.playing() ) {
			showVideo();
		}
	}, 7000);
};

