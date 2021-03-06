var language = 'en';
var map;
var service;
var current_location;
var markers = [];
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();

$(function() {
    language = getParameterByName("lg")
    $("#get_started").click(startApp);

    $("#btn_br").click(function() {
        language = "br"
        setParameterByName("lg", language)
        updateContent(language)

    })
    $("#btn_nl").click(function() {
        language = "nl"
        setParameterByName("lg", language)
        updateContent(language)
    })
    $("#btn_en").click(function() {
        language = "en"
        setParameterByName("lg", language)
        updateContent(language)
    })

    $("#get_started").click(function() {
        startApp;
    })

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    function setParameterByName(name, value) {
        if (history.pushState) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + name + '=' + value;
            window.history.pushState({
                path: newurl
            }, '', newurl);
        }
    }

    function updateContent(language) {
        replace_card_text(intro_card, language)
    }

})

function startApp() {
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
                }, language)
            },
            function(error) {
                initialize({
                        lat: 51.208785,
                        lng: 3.224299
                    }, language)
                    // $("#map_placeholder").html("Location not found!")
                    // update_card_text("Uh oh.", "Location not found!", "Please enable location services to use this app.")
            });
    } else {
        initialize({
                lat: 51.208785,
                lng: 3.224299
            }, language)
            // $("#map_placeholder").html("Location not found!")
            // update_card_text("Uh oh.", "Location not found!", "Please enable location services to use this app.")
    }
}

function initialize(location, lg) {


    // update_card_text("Use the Map!", "It's awesome!", "5/5!")
    update_card_text(intro_card, language)
    current_location = new google.maps.LatLng(location.lat, location.lng);

    map = new google.maps.Map(document.getElementById('map'), {
        center: current_location,
        styles: mapstyles,
        zoom: 15,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy'

    });

    var current_location_marker = new google.maps.Marker({
        position: location,
        map: map,
        title: "Current Location"
    });

    markers.push(current_location_marker)

    var request = {
        location: current_location,
        radius: '500',
        openNow: true,
        types: ['bar'],
        language: 'nl'
    };

    service = new google.maps.places.PlacesService(map);
    // service.textSearch(request, callback);
    service.nearbySearch(request, callback);
}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            var place = results[i];
            console.log(place)
            if (
                place.types.indexOf("pub") > -1 ||
                place.types.indexOf("bar") > -1
            ) {
                createMarker(place)
            }
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
        icon: "images/beer_icon_32.png",
        map: map,
        title: "marker"
    });

    markers.push(marker)

    marker.addListener('click', function() {
        directionsDisplay.setMap(null);
        directionsDisplay.setMap(map);
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
            distance_duration = '<span style="color: #353535; font-style: bold;">' + duration + " walking (" + distance + ")</span>"

            var name = place.name
            var address = place.vicinity
            var rating = place.rating
            var rating_color;
            if (rating >= 4) {
                rating_color = "#60BD68"
            } else if (rating >= 3) {
                rating_color = "#FAA43A"
            } else {
                rating_color = "#F15854"
            }
            title_html = name
            address_html = distance_duration + "<br>" + '<span style="color: #656565;">' + address + "</span>"

            rating_html = '<span id="card_rating_span" style="background-color: ' + rating_color + ';">' + rating + " / 5</span>"
            update_card_text(title_html, address_html, rating_html)
        }


    });
}

function update_splash_text(type, language) {
    var card_content = type[language];
    $("#card_title").html(card_content.title)
    $("#card_subtitle").html(card_content.subtitle)
    $("#get_started").html(card_content.content)
}

function update_card_text(type, language) {
    var card_content = type[language];
    $("#card_title").html(card_content.title)
    $("#card_subtitle").html(card_content.subtitle)
    $("#card_rating").html(card_content.content)
}