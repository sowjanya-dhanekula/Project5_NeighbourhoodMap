//Global Variables

var map;
var listOfMarkers=[];
var view_model;
var place;
var titles=[];

//Model
var listOfHotels = [
			{title:'Hotel Novotel', location:{lat: 17.2423949, lng: 78.4542350}},
			{title:'Radisson Blu Plaza Hotel', location:{lat: 17.4212021, lng: 78.4416175}},
			{title:'Taj Falaknuma Palace', location:{lat: 17.3313295, lng: 78.4661712}},
			{title:'Hyderabad Marriott Hotel', location:{lat: 17.4242320, lng: 78.4870930}},
			{title:'Trident Hyderabad', location:{lat: 17.4498970, lng: 78.3789510}},
			{title:'Vivanta By Taj', location:{lat: 17.4432784, lng: 78.4607650}}
		];


//ViewModel
var ViewModel = function() {
	var self = this;
	var infoWindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();
	var prev_infowindow = false;
	"use strict";
	
	self.listOfPlaces = ko.observableArray(listOfHotels);
	var image = "./images/hotel_icon.png";

	// Marker for all the locations in the listOfPlaces array.
	self.listOfPlaces().forEach(function(loc){
		var marker = new google.maps.Marker ({
			title: loc.title,
			position: loc.location,
			map: map,
			icon: image
		});
		loc.marker = marker;
		listOfMarkers.push(marker);
		loc.show = ko.observable(true);
		//Add an event listener to open the Infowindow
		marker.addListener("click",function() {
			if (prev_infowindow) {
				prev_infowindow.close();
			}
			prev_infowindow = infoWindow;
			populate_infoWindow(this,infoWindow);
		});
		//Set the viewport to contain the given bounds
		for (i=0; i<listOfMarkers.length; i++) {
		bounds.extend(listOfMarkers[i].getPosition());
	}

	});
	
	//Place the map in center with in the bounds
	map.setCenter(bounds.getCenter());
	//Place all the markers within the bounds
	map.fitBounds(bounds);
	 //Input given by the user in the input search box.
	 self.search_query = ko.observable('');
	//Search all available locations for ones whose names match the search queries and add them to the array
	self.search_filter = ko.computed(function(){
		var val = self.search_query().toLowerCase();
			if (!val) {
				//return self.listOfPlaces();
				 self.listOfPlaces().forEach(function(place){
				 	place.show(true);
				 	place.marker.setVisible(true);
				 });
			}
			else {
				//alert("list of places "+self.listOfPlaces() );
				return ko.utils.arrayFilter(self.listOfPlaces(), function(item) {
					var string = item.title.toLowerCase();
					if (string.indexOf(val) !== -1){
						item.show(true);
						item.marker.setVisible(true);
					} else{
						item.show(false);
						item.marker.setVisible(false);
					}
				}, self);
			}

		});
	

	//Function to interlinks the markers and listview when user clicks on it
	self.loc_select = function(list) {		
		list.marker.setAnimation(google.maps.Animation.BOUNCE);
		
		setTimeout(function() {
			list.marker.setAnimation(null);						
		},1400);

		var infoWindow = new google.maps.InfoWindow();
		populate_infoWindow(list.marker,infoWindow);
	};
	
	//Function to open infowindow when user clicks
	function populate_infoWindow(marker,infowindow) {
		marker.setAnimation(google.maps.Animation.BOUNCE);

		setTimeout(function() {
			marker.setAnimation(null);						
		},1000);

		//Check to make sure the infowindow is not opened on this marker
		if (infowindow.marker != marker) {			
			//infowindow.marker = marker;
			if (prev_infowindow) {
				prev_infowindow.close();
			}
			prev_infowindow = infowindow;
			infowindow.setContent('<div><span class="bold">Loading.....</span></div>');
			infowindow.open(map,marker);
			infowindow.close();
		}
		//client ID and Secret for foursquare API
		var clientID = 'XZJDO4UJUR0FWDOLTAJH5JEF4EKT14BTLWK4J3XUBK30ZOYP';
			clientSecret = 'WCMTTGOUQYDM3MLMRQX3XYE0PBA25H3X1SVYVNAEMOFZ22HY';
			lat = marker.position.lat();
			lng = marker.position.lng();
			p = lat+","+lng;

		//AJAX request for Foursquare API to get the location data
		var url = 'https://api.foursquare.com/v2/venues/search?ll=' + p + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20161227&m=foursquare';
			$.ajax({
				method: 'GET',
				url: url,
				datatype: 'jsonp',
				success: function (data) {
					//store the data from the ajax request
					var name = data.response.venues[0].name;					
					//venue id is for making the 2nd ajax request to foursquare to get photos of that place
					var venue_id =  data.response.venues[0].id;
					var address = data.response.venues[0].location.address;
					if (address === undefined)
						{
							address = "Currently not available";
						}
						var counts = data.response.venues[0].stats.checkinsCount;
						var formattedAddress = data.response.venues[0].location.country;						
						//Second ajax request for fetching photos
						var secondurl = 'https://api.foursquare.com/v2/venues/' + venue_id +'/photos?client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20161227';
						$.ajax({
							method: 'GET',
							url: secondurl,
							datatype: 'jsonp',
							success: function (data) {
								//store the data from the ajax request
								var item = data.response.photos.items[0];
								if (item === undefined){
									//If photo is unavailable, then display the message
									infowindow.setContent('<div><span class="bold"> ' + name + '</span><br><span class="bold">Address: </span>'+ address+'<br><span class="bold">Check-ins: </span>'+ counts + '</div><div>No photos available for this location</div>');
                                    infowindow.open(map, marker);
                                    infowindow.addListener('closeclick', function() {
                                    infowindow.marker = null;
                                    }); 
								} else {
									//If there are no photos, display first one
									var prefix = data.response.photos.items[0].prefix;
                                    var suffix = data.response.photos.items[0].suffix;
                                    var src = prefix + '100x100' +suffix;
                                    infowindow.setContent('<div><span class="bold"> ' + name + '</span><br><span class="bold">Address: </span>'+ address+'<br><span class="bold">URL: <a href="https://www.tripadvisor.in/Hotels-g297586-Hyderabad_Telangana-Hotels.html" target="_blank">Book Hotel</a></span><br><span class="bold">Check-ins: </span>'+ counts + '</div><div>Photo :<br><img src="'+src+'"></div>');
                                    infowindow.open(map, marker);
                                    infowindow.addListener('closeclick', function() {
                                    infowindow.marker = null;
                                    });
								}
							},
							//Error function to display the error message in the Infowindow
							 error: function(){
							 	//alert("Foursquare photo data not loaded");
                                infowindow.setContent('<div><span class="bold">Foursquare Image data not loaded</span></div>');
                                infowindow.open(map, marker);
                                }


						});
					},
					error: function(){
							 	//alert("Foursquare venue data not loaded");
							 	infowindow.setContent('<div><span class="bold">Foursquare Venue data not loaded</span></div>');
							 	infowindow.open(map, marker);
							 }
				});
	}
};


//initializeMap() is called when page is loaded.

function initMap() {
	map = new google.maps.Map(document.getElementById('mapDiv'), {
		center: {lat: 17.385044,lng: 78.486671},
		 zoom: 11,
		 mapTypeControl: false		 
	});
	//Instantiate ViewModel
	view_model = new ViewModel();
	//Apply Bindings
	ko.applyBindings(view_model);
}

$(document).ready(function(){

	$('.hamburger_icon').click(function(){
		$('.container_list').toggleClass('expand');
	});
	$('.list_item').click(function(){
		$('.container_list').toggleClass('expand');
	});	

});

//Function to display error message when Google map doesn't display
function MapErrorMsg() {
	alert("Error in loading Google map.");
}



  

