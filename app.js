var map;
var service;
var current_location;
var markers = [];
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();

$(function() {
    $(".mdl-content").append(`
        <div class="mdl-card mdl-card-wide mdl-shadow--2dp clear_content">
            <div id="map"></div>
        </div>`)
    initialize({
        lat: 51.208785,
        lng: 3.224299
    });
})

function initialize(location) {
    current_location = new google.maps.LatLng(location.lat, location.lng);

    map = new google.maps.Map(document.getElementById('map'), {
        center: current_location,
        zoom: 15
    });

    var current_location_marker = new google.maps.Marker({
        position: location,
        map: map,
        title: "Current Location"
    });

    markers.push(current_location_marker)

    var request = {
        location: current_location,
        radius: '2000',
        types: ['bar']
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            var place = results[i];
            console.log(place)
            createMarker(place)
        }
    }
}

function createMarker(place) {
    var dot = {
        path: 'M-1,0a1,1 0 1,0 2,0a1,1 0 1,0 -2,0',
        fillColor: '#3F51B5',
        fillOpacity: 0.75,
        scale: 5,
        strokeColor: '#3F51B5',
        strokeWeight: 2
    };


    var marker = new google.maps.Marker({
        position: place.geometry.location,
        icon: dot,
        map: map,
        title: "marker"
    });

    markers.push(marker)

    marker.addListener('click', function() {
        directionsDisplay.setMap(null);
        directionsDisplay.setMap(map);

        x = get_route(directionsService, directionsDisplay, current_location, place.geometry.location);
    })
}

function get_route(directionsService, directionsDisplay, pointA, pointB) {
    directionsService.route({
        origin: pointA,
        destination: pointB,
        travelMode: google.maps.TravelMode.WALKING
    }, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            duration = response.routes[0].legs[0].duration.text
            distance = response.routes[0].legs[0].distance.text
            $("#distance_duration").html(duration + " walking (" + distance + ")")
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function clear() {
    $(".clear_content").remove()
}