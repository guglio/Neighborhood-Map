function animateHide(el){
  el.animate({
    "left" : "-270px"
  });
}
function animateShow(el){
  el.animate({
    "left" : "0px"
  });
};
$(".searchMenu").click(function(){
  var sideResults = $(".sideResults");
    if(sideResults.position().left == 0)
      animateHide(sideResults);
    else
      animateShow(sideResults);
});
$(window).resize(function(){
  if($(this).width() >= 768)
    animateShow($('.hiddenclass'));
  else
    animateHide($('.hiddenclass'));
});

var locationsViewModel = {
     locationList : ko.observableArray()
};
ko.applyBindings(locationsViewModel);

// Code taken from the public repository for code examples used in Udacity's Google Maps APIs course (https://www.udacity.com/course/google-maps-apis--ud864).
var map;
// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 44.39199063456404, lng: 7.556188749999933},
    zoom: 7,
    mapTypeControl: true,
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT
    }
  });

  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();

// I organized the JSON file, with all the data, using this structure:
// coordinates : {
//  lat: latitude
//  lng: longitude
// }
// title: Name of the POI
//  category: restaurant | shopping | attraction | cultural | bar | entertainment

$.getJSON( "js/POI.json", function( data ) {
    var locations = data.locations;
    // The following group uses the location array to create an array of markers on initialize.

    for (var i = 0; i < locations.length; i++) {
      // Get the position from the location array.
      var position = locations[i].coordinates;
      var title = locations[i].title;

      locationsViewModel.locationList.push({name: title, id: i, category : locations[i].category});
      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i
      });
      // Push the marker to our array of markers.
      markers.push(marker);
      // Create an onclick event to open an infowindow at each marker.
      marker.addListener('click', function() {
        populateInfoWindow(this, largeInfowindow);
      });
      bounds.extend(markers[i].position);
    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
  console.log("ok");
}).fail(function() {
  console.log( "error" );
});
};
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker(null);
    });
  }
}
