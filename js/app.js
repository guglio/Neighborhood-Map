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
}
$(".searchMenu").click(function(){
  var sideResults = $(".sideResults");
    if(sideResults.position().left === 0)
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

var displayError = ko.observable(false);
var errorMessage = ko.observable('');


// ##################   GOOGLE MAP API SECTION   ##################

var POIlist = ko.observableArray();
var currentMarker = '';
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
// The structure of the file loaded is inside the README
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    // center in San Diego CA
    center: {"lat": 32.715738000	, "lng": -117.161083800	},
    zoom: 7,
    mapTypeControl: true,
    // move the controller at the right side of the window
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT
    }
  });

  var largeInfowindow = new google.maps.InfoWindow();
  $.getJSON( "js/POI.json", function( data ) {
      locations = data.locations;
      console.log("Load correctly data into app");
      // load all the locations inside markers and POIlist
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
            icon: icons.red_pin,
            category: category
          });
          // Push the marker to our array of markers.
          markers.push(marker);
          // POIlist is used for the side menu. I implemented the favorite with the use of an observable, so I could change the class of the items dynamically
          POIlist.push({name: title, id: i, category : category, favorite: ko.observable(favorite)});
          // Create an onclick event to open the large infowindow at each marker.
          marker.addListener('click', function() {
            var self = this;
            self.setIcon(icons.ylw_pin);
            self.setAnimation(google.maps.Animation.BOUNCE);
            stopAnimation(self);
            populateInfoWindow(self, largeInfowindow);
          });
        }
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.log('Error during data request: ' + textStatus + ' - ' + errorThrown);
      spitError('Error during data request: ' + textStatus + ' - ' + errorThrown);
    });
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // if the infowindow is closed without the x (closeclick), I change the
  // previous marker icon to default
  if(!currentMarker)
    currentMarker = marker;
  else {
    currentMarker.setIcon(icons.red_pin);
    currentMarker = marker;
  }
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    var innerHTML = '';
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      marker.setIcon(icons.red_pin);
      infowindow.marker = null;
    });
    // load the news from the New York Times inside the infowindow
    // this code was taken from the New York Times API console.
    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    url += '?' + $.param({
      'api-key': "117512e0e9bc4b1dafd16fe2ec69a9c3",
      'q': marker.title,
      'fl': "headline,web_url",
      'sort': "newest"
    });
    var news = '';
    $.ajax({
      url: url,
      method: 'GET',
    }).done(function(data) {
      news += '<ul id="news">';
      var newsFeed = data.response.docs;
      newsFeed.forEach(function( item, i ) {
        if(item.headline.main && item.web_url)
          news += '<li class="newsHeadline"><a class="newsLink" href="' + item.web_url +'">'+item.headline.main+'</a></li>';
        else if (item.headline.main || item.web_url) {
           news += '<li class="newsHeadline">';
           if(item.headline.main)
              news += item.headline.main;
           if(item.web_url)
              news += '<a class="newsLink" href="' + item.web_url +'">'+item.web_url+'</a>'
           news += '</li>';
         }
      });
      news += '</ul>';
    }).fail(function(err) {
      news += '<li>No news</li></ul>';
      spitError(err);
    }).always(function(){
      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;
      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            infowindow.setContent('<h4 class="markerName">' + marker.title + '</h4><div id="pano"></div>'+news);
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
          infowindow.setContent('<h4 class="markerName">' + marker.title + '</h4>' + '<div>No Street View Found</div>'+news);
        }
      }

      // Use streetview service to get the closest streetview image within
      // 50 meters of the markers position
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      // Open the infowindow on the correct marker.
      infowindow.open(map, marker);
    });

  }
}



// ##################   KNOCKOUT   ##################

// Googled how to filter data inside an observable array, and found this
// solution, witch I had to modify to work for this project
// http://stackoverflow.com/questions/31188583/filter-table-contents
var locationsViewModel = function(){
  var self = this;

    self.filter = ko.observable('');
    self.showError = ko.observable(false);
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
  markers[this.id].setAnimation(google.maps.Animation.BOUNCE);
  google.maps.event.trigger(markers[this.id], 'click');
  stopAnimation(markers[this.id]);
}

function stopAnimation(marker) {
    setTimeout(function () {
        marker.setAnimation(null);
    }, 2000);
}


// change icon of pin when mouseover is triggered

function changePinColor(){
  var self = this;
  if(self.favorite())
    markers[self.id].setIcon(icons.star);
  else
    markers[self.id].setIcon(icons.ylw_pin);
}

// change icon back to deafult

function defaultPinColor(){
  var self = this;
  if(self.favorite())
    markers[self.id].setIcon(icons.star);
  else
    markers[self.id].setIcon(icons.red_pin);
}

// switch between favorite true/false when the span is clicked

function favoriteLocation(){
  var self = this;
  if(self.favorite())
    self.favorite(false);
  else
    self.favorite(true);
}

// change class based on the favorite value

function isFavorite(el){
  return el.favorite() ? "icon-star-full" : "icon-star-empty iconHidden";
}

function spitError(message){
  var self = this;
  self.displayError(true);
  self.errorMessage(message);
}

function mapError(){
  animateHide($('.hiddenclass'));
  spitError('<img src="images/Bear_Grylls.png" class="errorMapImg"><h4 class="errorMapMsg">Error while contacting Google Map service</h4>')
}
