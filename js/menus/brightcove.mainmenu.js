(function(TVEngine) {
	var menu = new TVEngine.Navigation.Menu();
	menu.menuHandlesEvents();
	menu.currentY = 0;
	menu.currentXs = [];
	menu.name = "brightcove:mainmenu";
	
	menu.onFocus = function() {
		this.playlists = this.playlists || TVEngine.DataStore.get("brightcove:playlists");
		// reset current items to zero
		if(this.currentXs.length != this.playlists.length) this.resetItems();
		$(".vidItem img").css({
			borderColor: "#000",
		})
		this.setMetaData();

		$(".videoCategory:eq("+this.currentY+") > .vidItem:eq("+this.currentXs[this.currentY]+") img:first").css({
			borderColor: "#00bff3"
		})

		$log("brightcove:mainmenu:onfocus");
		 $("#playlistsNav li").removeClass("focused");
		 $("#playlistsNav li:eq("+this.currentY+")").addClass("focused");
	}
	
	menu.setMetaData = function() {
		var playlist = this.playlists[this.currentY];
		var currentVideo = this.getCurrentItem();
		$("#backgroundImage:visible").attr('src', currentVideo.full);
		// Slight work around - on Samsung we could see the tests to get the ellipsis;
		$("#focusVideoTitle").text(currentVideo.name);
		$("#focusVideoDescription").text(currentVideo.description);
		$("#paging").text((this.currentXs[this.currentY] + 1) + " of " + this.playlists[this.currentY].videos.length );
		if(this.currentY == 0) {
			$("#upArrow").hide();
		} else {
			$("#upArrow").show();
		}
		if(this.currentY == this.playlists.length - 1) {
			$("#downArrow").hide();
		} else {
			$("#downArrow").show();
		}
		
		if(this.currentXs[this.currentY] == 0) {
			$("#leftArrow").hide();
		} else {
			$("#leftArrow").show();
		}
		if(this.currentXs[this.currentY] == this.getVidMax()) {
			$("#rightArrow").hide();
		} else {
			$("#rightArrow").show();
		}

		
	}

	menu.getCurrentItem = function( ) {
		return this.playlists[this.currentY].videos[this.currentXs[this.currentY]];
	}
	
	menu.resetItems = function() {
		this.currentXs = _.map(this.playlists, function() {return 0});
	}

	menu.getVidMax = function() {
		return this.playlists[this.currentY].videos.length - 1;
	}
	
	menu.onLeft = function() {
		
		if(this.currentXs[this.currentY] > 0) {
			$("#playlists").stop(true);
			$("#playicon").hide();
			$(".videoCategory:eq("+this.currentY+") > .vidItem:eq("+this.currentXs[this.currentY]+") img:first").animate({
				borderColor: "#000"
			});
			
			this.currentXs[this.currentY]--;
			$("#playlists").animate({
				left: $(".vidItem:first").outerWidth(true) * -this.currentXs[this.currentY]
			},null,null, function() {
				$("#playicon").fadeIn(300);
			})
			$(".videoCategory:eq("+this.currentY+") > .vidItem:eq("+this.currentXs[this.currentY]+") img:first").animate({
				borderColor: "#00bff3"
			})
		}
		this.setMetaData();
	}
	
	
	menu.onRight = function() {
		$log("brightcove:mainmenu:onRight -> currentY: " + this.currentY + " currentX: " + this.currentXs[this.currentY] );
		if(this.currentXs[this.currentY] < this.getVidMax()) {
			$("#playlists").stop(true);
			$("#playicon").hide();
			$(".videoCategory:eq("+this.currentY+") > .vidItem:eq("+this.currentXs[this.currentY]+") img:first").animate({
				borderColor: "#000"
			});
			
			this.currentXs[this.currentY]++;
			$("#playlists").animate({
				left: $(".vidItem:first").outerWidth(true) * -this.currentXs[this.currentY]
			},null,null, function() {
				$("#playicon").fadeIn(300);
			});
			
			$(".videoCategory:eq("+this.currentY+") > .vidItem:eq("+this.currentXs[this.currentY]+") img:first").animate({
				borderColor: "#00bff3"
			})
		}		
		this.setMetaData();
	}
	
	menu.onUp = function() {
		$log("this.currentY: " + this.currentY );
		if (this.currentY > 0 ) {
			$("#playicon").hide();
			$(".vidItem img").css({
				borderColor: "#000"
			});
			var oldy = this.currentY;
			this.currentY--;
			this.resetItems();
			$("#playlists").css({left: 0});
			$("#playlists").animate({
				top: '+=208'
			});
			
			$("#playlistsNav").animate({
				top: -(this.currentY * $("#playlistsNav li:first").outerHeight(true))
			},null,null, function() {
				$("#playicon").fadeIn(300);
			});
		}
		this.currentXs[this.currentY] = 0;
		 $("#playlistsNav li").removeClass("focused");
		 $("#playlistsNav li:eq("+this.currentY+")").addClass("focused");
		this.setMetaData();

		$(".videoCategory:eq("+this.currentY+") > .vidItem:eq("+this.currentXs[this.currentY]+") img:first").css({
			borderColor: "#00bff3"
		})
	}
	
	menu.onSelect = function() {
		$log(" ON SELECT CALLED ! ")
		this.trigger(this.name + ":onselect", {
			playlist: this.playlists[this.currentY], videoIndex: this.currentXs[this.currentY]
		});
	}
	
	menu.onDown = function() {
		$log("this.currentY: " + this.currentY + " playlist.length: " + this.playlists.length);
		if (this.currentY < this.playlists.length - 1 ) {
			$("#playicon").hide();
			$(".vidItem img").css({
				borderColor: "#000"
			});
			this.currentY++;
			this.resetItems();
				$("#playlists").css({left: 0});
			$("#playlists").animate({
				top: '-=208'
			})
			$("#playlistsNav").animate({
				top: -(this.currentY * $("#playlistsNav li:first").outerHeight(true))
			},null,null, function() {
				$("#playicon").fadeIn(300);
			});
		}
		this.currentXs[this.currentY] = 0;
		 $("#playlistsNav li").removeClass("focused");
		 $("#playlistsNav li:eq("+this.currentY+")").addClass("focused");
		this.setMetaData();

		$(".videoCategory:eq("+this.currentY+") > .vidItem:eq("+this.currentXs[this.currentY]+") img:first").css({
			borderColor: "#00bff3"
		})
	}
	
	menu.onRed = function(){
		var currentVideo = this.getCurrentItem();
		$("#videoInfoBox h1").text(currentVideo.name);
		var description = (currentVideo.longDescription && currentVideo.longDescription.trim().length > 0) ? currentVideo.longDescription : currentVideo.description;
		$("#videoInfoBox p:first").text(description);
		$log(currentVideo);
		$("#videoInfoBox img:first").attr("src", currentVideo.thumbnail);
		$("#detailTags").text(currentVideo.tags.join(", "));
		showDetails();
	}
	
	menu.defaultMenu = true;
	TVEngine.Navigation.addMenu(menu);
})(TVEngine);