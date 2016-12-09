// ##################   Show/hide lateral menu   ##################

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

// ##################   GOOGLE MAP API SECTION   ##################

var POIlist = ko.observableArray();

var iconBase = 'images/';
var icons = {
  ylw_pin: iconBase + 'yellow_pin.png',
  red_pin: iconBase + 'red_pin.png',
  star: iconBase + 'star.png'
};

// Code taken from the public repository for code examples used in Udacity's Google Maps APIs course (https://www.udacity.com/course/google-maps-apis--ud864).
var map;
// Create a new blank array for all the listing markers.
var markers = [];
var locations = [];
// load external data
$.getJSON( "js/POI.json", function( data ) {
    locations = data.locations;
    console.log("Load correctly data into app");
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log('Error during data request: ' + textStatus + ' - ' + errorThrown);
  });

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    // center in San Diego CA
    center: {"lat": 32.715738000	, "lng": -117.161083800	},
    zoom: 7,
    mapTypeControl: true,
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT
    }
  });

  var largeInfowindow = new google.maps.InfoWindow();

  for (var i = 0; i < locations.length; i++) {

    var position = locations[i].coordinates;
    var title = locations[i].title;
    var category = locations[i].category;
    var favorite = locations[i].favorite;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i,
      category: category
    });
    // Push the marker to our array of markers.
    markers.push(marker);
    POIlist.push({name: title, id: i, category : category, favorite: ko.observable(favorite)});
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
  }

  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);

}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    var innerHTML = '';
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
          infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 30
            }
          };
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div>' + marker.title + '</div>' +
          '<div>No Street View Found</div>');
      }
    }
    // Use streetview service to get the closest streetview image within
    // 50 meters of the markers position
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
  }
}



// ##################   KNOCKOUT   ##################

// Googled how to filter data inside an observable array, and found this
// solution, witch I had to modify to work for this project
// http://stackoverflow.com/questions/31188583/filter-table-contents
var locationsViewModel = function(){
  var self = this;

    self.filter = ko.observable('');

    self.locationsList = POIlist;
    self.filteredItems = ko.computed(function() {
      var filter = self.filter();
      // this way markers are populated back into the map
      if (filter == ' ') {
        return self.locationsList();
      }
      else{
        return self.locationsList().filter(function(i) {

          var item = i.name.toLowerCase(); // case insensitive for filter

          // show/hide markers on map according to the current filter
          if(item.indexOf(filter.toLowerCase()) > -1)
            markers[i.id].setMap(map);
          else {
            markers[i.id].setMap(null);
          }
          return item.indexOf(filter.toLowerCase()) > -1;
        });
      }
    });
};

ko.applyBindings(new locationsViewModel());
// trigger the click event on the specific list item, to show the corresponding marker on the map
function openInfoWindow(){
  google.maps.event.trigger(markers[this.id], 'click');
};
function changePinColor(){
  var self = this;
  if(self.favorite())
    markers[self.id].setIcon(icons.star);
  else
    markers[this.id].setIcon(icons.ylw_pin);
}
function defaultPinColor(){
  var self = this;
  if(self.favorite())
    markers[self.id].setIcon(icons.star);
  else
    markers[self.id].setIcon(icons.red_pin);
}
function favoriteLocation(){
  var self = this;

  if(self.favorite()){
    self.favorite(false);

  }
  else{
    self.favorite(true);

  }
}

function isFavorite(el){
  return el.favorite() ? "icon-star-full" : "icon-star-empty iconHidden";
};
