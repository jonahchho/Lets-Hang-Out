var map;
var myLocation;
var myLocationMarker;
var myLocationInfoWindow;
var infoWindow;

$( document ).ready(function() {

  if(localStorage.getItem("distance")) {
    document.getElementById('distRange').value = localStorage.getItem("distance");
  }

  if(localStorage.getItem("price")) {
    document.getElementById('priceRange').value = localStorage.getItem("price");
  }

  if(localStorage.getItem("rating")) {
    document.getElementById('rateRange').value = localStorage.getItem("rating");
  }

});

$(document).on('click', '#preference_btn', function(e){
  //console.log("Preference");
  $('#body').addClass('preference');
});

$(document).on('click', '#body:not(.no-back) #preference-overlay header div.back', function(e){
  $('#body').removeClass('preference');
});

$(document).on('click', '#preference-overlay header div.done', function(e){
  setPreference();
  $('#body').removeClass('preference');
});

function setPreference() {

  localStorage.setItem("distance", document.getElementById('distRange').value);
  localStorage.setItem("price", document.getElementById('priceRange').value);
  localStorage.setItem("rating", document.getElementById('rateRange').value);

}

function initMap() {

  if(document.getElementById('map') !== null) {

    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 33.856, lng: -117.921},
      zoom: 12
    });

    myLocationInfoWindow = new google.maps.InfoWindow;

    // Pin user's locations
    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(function(position) {
        myLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        myLocationMarker = new google.maps.Marker({
          position: myLocation,
          map: map,
          title: 'My location'
        });

        myLocationInfoWindow.setContent('My location');

        myLocationMarker.addListener('click', function() {
          myLocationInfoWindow.open(map, myLocationMarker);
        });

        map.setCenter(myLocation);
      }, function() {
        handleLocationError(true, myLocationInfoWindow, map.getCenter());
      });
    }

    else {
      // Browser doesn't support Geolocation
      handleLocationError(false, myLocationInfoWindow, map.getCenter());
    }

    var input = document.getElementById('place-input');

    if(input !== null) {

      infoWindow = new google.maps.InfoWindow;

      // Create the search box and link it to the UI element.
      var searchBox = new google.maps.places.SearchBox(input);

      // Bias the SearchBox results towards current map's viewport.
      map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
      });

      var markers = [];
      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
          marker.setMap(null);
        });

        markers = [];

        let d = localStorage.getItem("distance") / 2;
        let p = localStorage.getItem("price") / 20;
        let r = localStorage.getItem("rating") / 20;

        let myLCord = new google.maps.LatLng(myLocation.lat, myLocation.lng);

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {

          let pCord = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
          let dist = google.maps.geometry.spherical.computeDistanceBetween(myLCord, pCord)*0.000621371192;

          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }
          var icon = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          };

          if(dist <= d && place.price_level <= p && place.rating >= r) {

            // Create a marker for each place.

            var marker = new google.maps.Marker({
              map: map,
              icon: icon,
              title: place.name,
              position: place.geometry.location
            });

            google.maps.event.addListener(marker, 'click', function() {
                infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' +
              'Rating: ' + place.rating + '<br>' +
              'Price: ' + place.price_level + '<br>' +
              //'Open now: ' + place.opening_hours['open_now'] + '<br>' +
              'Address: ' + place.formatted_address + '</div>');
                infoWindow.open(map, this);
              });

            markers.push(marker);
          }

          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          }

          else {
            bounds.extend(place.geometry.location);
          }
        });
        map.fitBounds(bounds);
      });


    }

  }

}

function handleLocationError(browserHasGeolocation, infoWindow, myLocation) {
  infoWindow.setPosition(myLocation);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}
