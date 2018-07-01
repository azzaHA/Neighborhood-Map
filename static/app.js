var places = [
  {
    name: 'Baskin-Robbins',
    location: {lat: 37.3879874, lng: -122.0889856}
  },
  {
    name: 'Starbucks',
    location: {lat: 37.387571, lng: -122.083068}
  },
  {
    name: 'AAA Mountain View',
    location: {lat: 37.3871846, lng: -122.0887289}
  },
  {
    name: 'Park Place Apartments',
    location: {lat: 37.38907029999999, lng: -122.085526}
  },
  {
    name: 'Graham Middle School',
    location: {lat: 37.3819695, lng: -122.0844324}
  },
  {
    name: 'Mountain View Public Library',
    location: {lat: 37.3903092, lng: -122.0835}
  },
  {
    name: 'Kaiser Permanente Mountain View Medical Offices',
    location: {lat: 37.3893499, lng: -122.0813761}
  },
];

let Place = function(data){
  this.name = ko.observable(data.name);
  this.location = ko.observable(data.location);
}

let ViewModel = function(){
  let self = this;
  this.placesList = ko.observableArray([]);
  places.forEach(function(place){
    self.placesList.push(new Place(place));
  });

  this.currentPlace = ko.observable(this.placesList()[0]);

  
  this.setCurrentPlace = function(place){
    self.currentPlace(place);
    console.log(place.name);
  }

}

ko.applyBindings(new ViewModel());


$.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyAhP2DMRVyLDfq_Ewe9U8q9PD0_mMpKj60&v=3&callback=initMap",
function() {
   console.log("Script loaded");
});


var map;
var markers = [];
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.386052, lng: -122.083851},
    zoom: 15
  });
  var defaultIcon = makeMarkerIcon('0091ff');

  var largeInfowindow = new google.maps.InfoWindow();
  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < places.length; i++) {
    // Get the position from the location array.
    var position = places[i].location;
    var title = places[i].name;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });
    // Push the marker to our array of markers.
    marker.setMap(map);
    markers.push(marker);
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      console.log('inside listener');
      let url = '/search/' + this.title + '/' + this.position.lat() + '/' + this.position.lng();
      var currentMarker = this;
      var window = largeInfowindow;
      $.getJSON(url, function (response){
        console.log(response);
        populateInfoWindow(currentMarker, response, window);
      }).error(function(e){
        alert(e);
      });
    });
  }
}

function populateInfoWindow(marker, response, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      let windowContent = '<h5>' + marker.title + '</h5>';
      if(response){
        windowContent += '<p>Information from Yelp:</p>';
        if (response['display_phone']){
          windowContent += '<p>Call:' + response['display_phone'] + '</p>';
        }
        if (response['review_count']){
          windowContent += '<p> Number of reviews: ' + response['review_count'] + '</p>';
        }
        if (response['rating']){
          windowContent += '<p> Rating: ' + response['rating'] + '</p>';
        }
        if (response['price']){
          windowContent += '<p> Price range: ' + response['price'] + '</p>';
        }
      }
      infowindow.setContent(windowContent);
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
    }
  }

  // This function takes in a COLOR, and then creates a new marker
        // icon of that color. The icon will be 21 px wide by 34 high, have an origin
        // of 0, 0 and be anchored at 10, 34).
        function makeMarkerIcon(markerColor) {
          var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));
          return markerImage;
        }
