function initMap() {
    map = new google.maps.Map(document.getElementById("mapDiv"), {
        center: {
            lat: 17.385044,
            lng: 78.486671
        },
        zoom: 11,
        mapTypeControl: !1
    }), view_model = new ViewModel(), ko.applyBindings(view_model);
}

function MapErrorMsg() {
    alert("Error in loading Google map.");
}

var map, listOfMarkers = [], view_model, place, titles = [], listOfHotels = [ {
    title: "Hotel Novotel",
    location: {
        lat: 17.2423949,
        lng: 78.454235
    }
}, {
    title: "Radisson Blu Plaza Hotel",
    location: {
        lat: 17.4212021,
        lng: 78.4416175
    }
}, {
    title: "Taj Falaknuma Palace",
    location: {
        lat: 17.3313295,
        lng: 78.4661712
    }
}, {
    title: "Hyderabad Marriott Hotel",
    location: {
        lat: 17.424232,
        lng: 78.487093
    }
}, {
    title: "Trident Hyderabad",
    location: {
        lat: 17.449897,
        lng: 78.378951
    }
}, {
    title: "Vivanta By Taj",
    location: {
        lat: 17.4432784,
        lng: 78.460765
    }
} ], ViewModel = function() {
    function a(a, b) {
        a.setAnimation(google.maps.Animation.BOUNCE), setTimeout(function() {
            a.setAnimation(null);
        }, 1e3), b.marker != a && (e && e.close(), e = b, b.setContent('<div><span class="bold">Loading.....</span></div>'), 
        b.open(map, a), b.close());
        var c = "XZJDO4UJUR0FWDOLTAJH5JEF4EKT14BTLWK4J3XUBK30ZOYP";
        clientSecret = "WCMTTGOUQYDM3MLMRQX3XYE0PBA25H3X1SVYVNAEMOFZ22HY", lat = a.position.lat(), 
        lng = a.position.lng(), p = lat + "," + lng;
        var d = "https://api.foursquare.com/v2/venues/search?ll=" + p + "&client_id=" + c + "&client_secret=" + clientSecret + "&v=20161227&m=foursquare";
        $.ajax({
            method: "GET",
            url: d,
            datatype: "jsonp",
            success: function(d) {
                var e = d.response.venues[0].name, f = d.response.venues[0].id, g = d.response.venues[0].location.address;
                void 0 === g && (g = "Currently not available");
                var h = d.response.venues[0].stats.checkinsCount, i = (d.response.venues[0].location.country, 
                "https://api.foursquare.com/v2/venues/" + f + "/photos?client_id=" + c + "&client_secret=" + clientSecret + "&v=20161227");
                $.ajax({
                    method: "GET",
                    url: i,
                    datatype: "jsonp",
                    success: function(c) {
                        var d = c.response.photos.items[0];
                        if (void 0 === d) b.setContent('<div><span class="bold"> ' + e + '</span><br><span class="bold">Address: </span>' + g + '<br><span class="bold">Check-ins: </span>' + h + "</div><div>No photos available for this location</div>"), 
                        b.open(map, a), b.addListener("closeclick", function() {
                            b.marker = null;
                        }); else {
                            var f = c.response.photos.items[0].prefix, i = c.response.photos.items[0].suffix, j = f + "100x100" + i;
                            b.setContent('<div><span class="bold"> ' + e + '</span><br><span class="bold">Address: </span>' + g + '<br><span class="bold">URL: <a href="https://www.tripadvisor.in/Hotels-g297586-Hyderabad_Telangana-Hotels.html" target="_blank">Book Hotel</a></span><br><span class="bold">Check-ins: </span>' + h + '</div><div>Photo :<br><img src="' + j + '"></div>'), 
                            b.open(map, a), b.addListener("closeclick", function() {
                                b.marker = null;
                            });
                        }
                    },
                    error: function() {
                        b.setContent('<div><span class="bold">Foursquare Image data not loaded</span></div>'), 
                        b.open(map, a);
                    }
                });
            },
            error: function() {
                b.setContent('<div><span class="bold">Foursquare Venue data not loaded</span></div>'), 
                b.open(map, a);
            }
        });
    }
    var b = this, c = new google.maps.InfoWindow(), d = new google.maps.LatLngBounds(), e = !1;
    b.listOfPlaces = ko.observableArray(listOfHotels);
    var f = "./images/hotel_icon.png";
    b.listOfPlaces().forEach(function(b) {
        var g = new google.maps.Marker({
            title: b.title,
            position: b.location,
            map: map,
            icon: f
        });
        for (b.marker = g, listOfMarkers.push(g), b.show = ko.observable(!0), g.addListener("click", function() {
            e && e.close(), e = c, a(this, c);
        }), i = 0; i < listOfMarkers.length; i++) d.extend(listOfMarkers[i].getPosition());
    }), map.setCenter(d.getCenter()), map.fitBounds(d), b.search_query = ko.observable(""), 
    b.search_filter = ko.computed(function() {
        var a = b.search_query().toLowerCase();
        return a ? ko.utils.arrayFilter(b.listOfPlaces(), function(b) {
            var c = b.title.toLowerCase();
            c.indexOf(a) !== -1 ? (b.show(!0), b.marker.setVisible(!0)) : (b.show(!1), b.marker.setVisible(!1));
        }, b) : void b.listOfPlaces().forEach(function(a) {
            a.show(!0), a.marker.setVisible(!0);
        });
    }), b.loc_select = function(b) {
        b.marker.setAnimation(google.maps.Animation.BOUNCE), setTimeout(function() {
            b.marker.setAnimation(null);
        }, 1400);
        var c = new google.maps.InfoWindow();
        a(b.marker, c);
    };
};

$(document).ready(function() {
    $(".hamburger_icon").click(function() {
        $(".container_list").toggleClass("expand");
    }), $(".list_item").click(function() {
        $(".container_list").toggleClass("expand");
    });
});