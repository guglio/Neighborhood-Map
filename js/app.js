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
// category: restaurant | shopping | attraction | cultural | bar | entertainment

$.getJSON( "js/POI.json", function( data ) {
    var locations = data.locations;
    // The following group uses the location array to create an array of markers on initialize.

    for (var i = 0; i < locations.length; i++) {
      // Get the position from the location array.
      var position = locations[i].coordinates;
      var title = locations[i].title;
      var category = locations[i].category;
      var favorite = locations[i].favorite;

      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        category: category,
        id: i,
        icon: icons.red_pin
      });
      // Push the marker to our array of markers.
      markers.push(marker);
      POIlist.push({name: title, id: i, category : category, favorite: ko.observable(favorite)});
      // Create an onclick event to open an infowindow at each marker.
      marker.addListener('click', function() {
        populateInfoWindow(this, largeInfowindow);
      });
      bounds.extend(markers[i].position);
    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
  console.log("Load correctly data into app");
}).fail(function(jqXHR, textStatus, errorThrown) {
  console.log('Error during data request: ' + textStatus + ' - ' + errorThrown);
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
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
  }
};

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
