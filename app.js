var map;
var service;
var current_location;
var markers = [];
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();

$(function() {
    getLocation()

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                    var returned_location = {
                        lat: lat,
                        lng: lng
                    };
                    // initialize(returned_location);
                    initialize({
                        lat: 51.208785,
                        lng: 3.224299
                    })
                },
                function(error) {
                    initialize({
                        lat: 51.208785,
                        lng: 3.224299
                    });
                });
        } else {
            initialize({
                lat: 51.208785,
                lng: 3.224299
            });
        }
    }

})

function initialize(location) {
    update_card_text("Use the Map!", "It's awesome!", "5/5!")
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
        query: "bars or pubs",
        location: current_location,
        radius: '1000',
        openNow: true,
        types: ['cafe']
    };

    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, callback);
}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            var place = results[i];
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
        console.log(place)
        card_clickhandler(
            directionsService,
            directionsDisplay,
            place,
            current_location,
            place.geometry.location
        );
    })

    bound = new google.maps.LatLngBounds();
    for (var i in markers) {
        bound.extend(markers[i].getPosition());
    }
    map.fitBounds(bound);
}


function card_clickhandler(directionsService, directionsDisplay, place, pointA, pointB) {
    directionsService.route({
        origin: pointA,
        destination: pointB,
        travelMode: google.maps.TravelMode.WALKING
    }, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);

            duration = response.routes[0].legs[0].duration.text
            distance = response.routes[0].legs[0].distance.text
            $("#card_subtitle").html('<span style="color: #353535; font-style: bold;">' + duration + " walking (" + distance + ")</span>")

        } else {
            // window.alert('Directions request failed due to ' + status);
        }

        var name = place.name
        var address = place.formatted_address
        var rating = place.rating
        var open = ("Open Now" ? place.opening_hours != undefined && place.opening_hours.open_now : "Closed")
        $("#card_title").html(name)
        $("#card_subtitle").append("<br>" + '<span style="color: #656565;">' + address + "</span>")
        $("#card_rating").html(rating + " / 5")
    });
}

function update_card_text(title, content, rating) {
    $("#card_title").html(title)
    $("#card_subtitle").append(content)
    $("#card_rating").html(rating)
}