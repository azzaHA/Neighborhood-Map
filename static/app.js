// Get the map from google api the first thing, in an async request
let googleURL = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAhP2DMRVyLDfq_Ewe9U8q9PD0_mMpKj60&v=3&callback=initMap";
$.getScript(googleURL)
.done(function(){
  console.log("Script loaded successfully");
}).fail(function(e){
  alert('Error, Data not loaded.\nDetails: Status Code: ' +e.status + ', Message: ' +  e.statusText);
});


// Public variables to be used across the code
let map;
let markers = [];
let currentMarker;
let currentInfoWindow;

// names and locations of the places to be displayed
let places = [
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

// Knockout place observable, representing the Model
let Place = function(data){
  this.name = ko.observable(data.name);
  this.location = ko.observable(data.location);
  this.isVisible = ko.observable(data.isVisible);
};

// Knockout ViewModel, containing the logic of viewing the places in list view,
// and filtering them
let ViewModel = function(){
  let self = this;

  // Initialize observable array of places
  this.placesList = ko.observableArray([]);
  places.forEach(function(place){
    place.isVisible = true;
    self.placesList.push(new Place(place));
  });

  this.currentPlace = ko.observable(this.placesList()[0]);

  // the current place is set when the user clicks on an item in the list
  this.setCurrentPlace = function(place){
    self.currentPlace(place);
    let placeIndex = self.placesList().indexOf(place);
    if (currentMarker){
      currentMarker.setAnimation(null);
    }
    currentMarker = markers[placeIndex];
    currentMarker.setAnimation(google.maps.Animation.BOUNCE);
    getYelpData();
  };

  // the filter query entered by the user, binded to the filter text box in the view
  this.filterQuery = ko.observable('');

  // Filter function, to be called whenever the user updates the value inside the filter box
  this.filterLocations = function(){
    self.placesList().forEach(function(place){
      let placeName = place.name().toLowerCase();
      let query = self.filterQuery().toLowerCase();
      let placeIndex = self.placesList().indexOf(place);

      // check if the entered filter query is a substring of the place name
      if (placeName.includes(query)){
        // isVisible property controls whether the list item should be shown or hidden
        place.isVisible(true);
        // setting the map makes the marker visible on it
        markers[placeIndex].setMap(map);
      }
      else{
        place.isVisible(false);
        markers[placeIndex].setMap(null);
      }
    });
  };

  // filterLocations is called whenever the value inside filterQuery changes
  this.filterQuery.subscribe(function(){
    self.filterLocations();
  });

};

ko.applyBindings(new ViewModel());

// initialize the map along with the markers and their event listeners
function initMap() {

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.386052, lng: -122.083851},
    zoom: 15
  });
  let defaultIcon = makeMarkerIcon('0091ff');

  let largeInfowindow = new google.maps.InfoWindow();
  currentInfoWindow = largeInfowindow;
  // The following group uses the location array to create an array of markers on initialize.
  for (let i = 0; i < places.length; i++) {
    // Get the position from the location array.
    let position = places[i].location;
    let title = places[i].name;
    // Create a marker per location, and put into markers array.
    let marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });
    // Push the marker to array of markers.
    marker.setMap(map);
    markers.push(marker);
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {

      if (currentMarker){
        currentMarker.setAnimation(null);
      }
      currentMarker = this;
      getYelpData();
    });
  }
}

// Get data from yelp, by sending an async request to the server with current place parameters
function getYelpData(){
  let url = '/search/' + currentMarker.title + '/' + currentMarker.position.lat() + '/' + currentMarker.position.lng();
  $.getJSON(url)
    .done(function (response){
      // if the request is handled successfully, animate the current marker and
    // fill the currentInfoWindow with additional place information
    currentMarker.setAnimation(google.maps.Animation.BOUNCE);
    populateInfoWindow(currentMarker, response, currentInfoWindow);
  }).fail(function(e){
    // in case of an error, alert the user
    alert('Error, Data not loaded.\nDetails: Status Code: ' +e.status + ', Message: ' +  e.statusText);
  });
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
        currentMarker.setAnimation(null);
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
