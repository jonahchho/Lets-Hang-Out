var map;
var myLocation;
var myLocationMarker;
var myLocationInfoWindow;
var infoWindow;

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

        // Store user's position info in sessionStorage
        sessionStorage.setItem("lat", position.coords.latitude);
        sessionStorage.setItem("lng", position.coords.longitude);

        myLocationMarker = new google.maps.Marker({
          position: myLocation,
          map: map,
          title: 'My location'
        });

        myLocationInfoWindow.setContent('My location');

        myLocationMarker.addListener('click', function() {
          myLocationInfoWindow.open(map, myLocationMarker);
        });


        /* Setup Meeting Point for the users in the same chatroom.
        var b = new google.maps.LatLngBounds();

        b.extend( new google.maps.LatLng(33.878152, -117.983535) );
        b.extend( new google.maps.LatLng(33.908318, -117.899037) );
        b.extend( new google.maps.LatLng(33.822157, -117.951522) );
        b.extend( new google.maps.LatLng(position.coords.latitude, position.coords.longitude) );

        console.log(b.getCenter().lat());
        console.log(b.getCenter().lng());

        var meetingPoint = new google.maps.Marker({
                  map: map,
                  icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
                  position: {lat:b.getCenter().lat(), lng:b.getCenter().lng()},
                  title: 'Meeting Point'
                });

        let meetingPointInfoWindow = new google.maps.InfoWindow;
        meetingPointInfoWindow.setContent('Meeting Point');

        meetingPoint.addListener('click', function() {
          meetingPointInfoWindow.open(map, meetingPoint);
        });

        meetingPoint.setMap(map);
        */


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

        let d = sessionStorage.getItem("distance") / 2;
        let p = sessionStorage.getItem("price") / 20;
        let r = sessionStorage.getItem("rating") / 20;

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
