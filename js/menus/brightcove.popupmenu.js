(function(TVEngine) {
	var menu = new TVEngine.Navigation.Menu();
	menu.menuHandlesEvents();
	menu.name = "brightcove:popupmenu";

	menu.onSelect = function() {
		closeDetails();
	}
	
	TVEngine.Navigation.addMenu(menu);
})(TVEngine);