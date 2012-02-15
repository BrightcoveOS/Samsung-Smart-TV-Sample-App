(function(TVEngine) {
	var menu = new TVEngine.Navigation.Menu();
	
	// The name is required, if you call the "addMenu" handler without
	// a name an error will be thrown.
	menu.name = "enginelite.samplemenu";
	
	// Focus Handler for the menu
	menu.onFocus = function() {
		$log(this.name + " onFocus");
	}
	menu.onBlur = function() {
		$log(this.name + " onBlur");
	}
	// Set up the menu items.
	menu.items = {
		"first": {
			/* 
			!!!!
			
			Note that we do try to maintain the menu context here
			so "this.name" is "enginelite.samplemenu"; It does not 
			refer to the menu item. 
			
			!!!! 
			**/
			onFocus: function() {
				$log(this.name + ":first onFocus");
			},
			onBlur: function() {
				$log(this.name + ":first onBlur");
			},
			onRight: function() {
				$log(this.name + ":first onRight");
				TVEngine.Navigation.setFocus(this.name, "second");
			},
		},
		"second": {
			onFocus: function() {
				$log(this.name + ":first onFocus");
			},
			onBlur: function() {
				$log(this.name + ":first onBlur");
			},
			onLeft: function() {
				$log(this.name + ":first onLeft");
				TVEngine.Navigation.setFocus(this.name, "first");
			},
		}
	}
	// Register with Navigation.
	TVEngine.Navigation.addMenu(menu);
	
	var mainOnlyMenu = new TVEngine.Navigation.Menu();
	mainOnlyMenu.name = "enginelite.sampleMainOnlyMenu";
	//
	mainOnlyMenu.menuHandlesEvents();
	mainOnlyMenu.onFocus = function() {
		$log(this.name+".onFocus");
	}
	
	mainOnlyMenu.onBlur = function() {
		$log(this.name+".onFocus");
	}
	mainOnlyMenu.onRight = function() {
		$log(this.name+".onRight");
	}
	mainOnlyMenu.onLeft = function() {
		$log(this.name+".onLeft");
	}
	
})(TVEngine);