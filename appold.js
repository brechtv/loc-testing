var URL = "https://spreadsheets.google.com/feeds/list/1fi3Y_x6XuwIolXCTv-Jcdg1qpoiMLYVzz3_z7zmE4XA/od6/public/values?alt=json"
var map;
var max_distance = 2000;


$(function() {
    $.getJSON(URL, function(data) {
        var results = data.feed.entry;
        $.each(results, function(key, result) {
            if (key == 0) {
                header_card_data = construct_card_data(result);
                header_card = Mustache.render(header_card_template, header_card_data);
                $(".mdl-content").append(header_card);

                $("#start").click(function() {
                    load_map({
                            lat: 51.208785,
                            lng: 3.224299
                        }, max_distance) // for testing
                        // var loc = getLocation()
                        // console.log(loc)
                        // load_map(getLocation(), max_distance);
                });
            }
        })
    })
})



$("#save_reload").click(function() {
    max_distance = $("#settings_max_distance").val();
    load_map({
        lat: 53.340489,
        lng: -6.267577
    }, max_distance * 1000)
})

// function getLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(function(position) {
//                 lat = position.coords.latitude;
//                 lng = position.coords.longitude;
//                 location = {lat: lat, lng: lng};
//                 console.log("location returned")
//                 // return location
//             },
//             function(error) {
//                 // todo: better error handling
//                 if (error.code == error.PERMISSION_DENIED)
//                     alert("Location services denied, please allow location services for this functionality.")
//             });
//     } else {
//         alert("Could not find location!")
//     }
// }

// load the full map with markers etc
function load_map(location, max_distance) {
    clear();

    var lat = location.lat
    var lng = location.lng
    maps_api_url = "https://maps.googleapis.com/maps/api/place/textsearch/json?key=AIzaSyDnJ6YfjWb7bDBtJl9OyGHzJybd6C7n0Eg&query=%22bar%22&location=" + lat + "," + lng + "&radius=" + max_distance
    $.getJSON(maps_api_url, function(data) {
        console.log(data)
    })
    
    $.getJSON(URL, function(data) {
        var results = data.feed.entry;
        $(".header_card").remove()
        $(".mdl-content").append(`
			<div class="mdl-card mdl-card-wide mdl-shadow--2dp clear_content">
				<div id="map"></div>
			</div>`)
        $(".mdl-content").append(intro_card_template)
        markers = [];
        var directionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer();
        var map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 53,
                lng: -6
            },
            zoom: 11,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            }
        });

        var current_location_marker = new google.maps.Marker({
            position: location,
            map: map,
            title: "Your location!"
        });

        markers.push(current_location_marker)
        $.each(results, function(key, result) {
            if (key >= 10) {
                var card = construct_card_data(result)
                a = new google.maps.LatLng(location.lat, location.lng);
                b = new google.maps.LatLng(card.lat, card.lng);
                var distance_to_card = google.maps.geometry.spherical.computeDistanceBetween(a, b)

                if (distance_to_card < max_distance) {

                    // for size according to score
                    var dot = {
                        path: 'M-1,0a1,1 0 1,0 2,0a1,1 0 1,0 -2,0',
                        fillColor: '#3F51B5',
                        fillOpacity: 0.75,
                        scale: card.score * 5,
                        strokeColor: '#3F51B5',
                        strokeWeight: 2
                    };
                    // the size bubble
                    var marker = new google.maps.Marker({
                        position: {
                            lat: card.lat,
                            lng: card.lng
                        },
                        icon: dot,
                        map: map,
                        title: card.title
                    });
                    // the actual pin
                    var marker = new google.maps.Marker({
                        position: {
                            lat: card.lat,
                            lng: card.lng
                        },
                        icon: "images/guinness_icon_64.png",
                        map: map,
                        title: card.title
                    });
                    // add it for fitbounds
                    markers.push(marker)
                        //click to update card info

                    marker.addListener('click', function() {
                        directionsDisplay.setMap(null);
                        directionsDisplay.setMap(map);
                        // plot the route
                        x = get_route(directionsService, directionsDisplay, location, {
                            lat: card.lat,
                            lng: card.lng
                        });

                        $("#place_card").replaceWith(render_place_card(card, false))
                    });
                }
            }
        })
        var bound = new google.maps.LatLngBounds();
        for (var i in markers) {
            bound.extend(markers[i].getPosition());
        }
        map.fitBounds(bound);
    })
}


// calculate route
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

// parses into a nice object
function construct_card_data(card_data) {
    var title = card_data.gsx$title.$t;
    var subtitle = card_data.gsx$subtitle.$t;
    var content = card_data.gsx$content.$t;
    var button_url = card_data.gsx$buttonurl.$t;
    var image_url = card_data.gsx$imageurl.$t;
    var type = card_data.gsx$type.$t;
    var score = parseFloat(card_data.gsx$score.$t);
    var lat = parseFloat(card_data.gsx$latitude.$t);
    var lng = parseFloat(card_data.gsx$longitude.$t);

    var card_data = {
        "title": title,
        "subtitle": subtitle,
        "content": content,
        "button_url": button_url,
        "image_url": image_url,
        "type": type,
        "score": score,
        "lat": lat,
        "lng": lng
    }
    return card_data
}

// render a card from the card data provided
function render_place_card(card_data, is_placeholder) {
    if (is_placeholder) {
        card_data = {
            "title": "Click on the map to get started!",
            "subtitle": "",
            "content": "",
            "button_url": "",
            "image_url": "https://img.maximummedia.ie/joe_ie/eyJkYXRhIjoie1widXJsXCI6XCJodHRwOlxcXC9cXFwvbWVkaWEtam9lLm1heGltdW1tZWRpYS5pZS5zMy5hbWF6b25hd3MuY29tXFxcL3dwLWNvbnRlbnRcXFwvdXBsb2Fkc1xcXC8yMDE4XFxcLzAzXFxcLzE1MDk1MTIyXFxcL3JhbmtkdWJsaW4uanBnXCIsXCJ3aWR0aFwiOjc2NyxcImhlaWdodFwiOjQzMSxcImRlZmF1bHRcIjpcImh0dHBzOlxcXC9cXFwvd3d3LmpvZS5pZVxcXC9hc3NldHNcXFwvaW1hZ2VzXFxcL2pvZVxcXC9uby1pbWFnZS5wbmc_dj01XCJ9IiwiaGFzaCI6Ijk3OWUzMWEyOTQwZGI1YjM1NjM2YzlmNzI4YTA4NDAwN2M4YjVkMjEifQ==/rankdublin.jpg",
            "lat": null,
            "lng": null
        }
    }
    var card_render = Mustache.render(place_card_template, card_data);
    return card_render
}


function resize() {
    if ($("#resize").hasClass("bigmap")) {
        $("#resize").removeClass("bigmap").addClass("bigcard");
        $("#map").css("height", "55vh");
        $("#place_card").css("height", "25vh");
        $("#resize").html('<i class="material-icons">expand_more</i>')
        $(".hidden_content").show()
    } else {
        $("#resize").removeClass("bigcard").addClass("bigmap");
        $("#map").css("height", "70vh");
        $("#place_card").css("height", "15vh");
        $("#resize").html('<i class="material-icons">expand_less</i>')
        $(".hidden_content").hide()
    }
}

function clear() {
    $(".clear_content").remove()
}

