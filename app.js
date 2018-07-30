var URL = "https://spreadsheets.google.com/feeds/list/1fi3Y_x6XuwIolXCTv-Jcdg1qpoiMLYVzz3_z7zmE4XA/od6/public/values?alt=json"
var map;
var max_distance = 1000;

$("#locate").click(function() {
    load_map({
            lat: 53.340489,
            lng: -6.267577
        }, 1000) // for testing
        // var loc = getLocation()
        // console.log(loc)
        // load_map(getLocation(), max_distance);
});

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
    $.getJSON(URL, function(data) {
        var results = data.feed.entry;
        $(".header_card").remove()
        $(".mdl-content").append(`
			<div class="mdl-card mdl-card-wide mdl-shadow--2dp clear_content">
				<div id="map"></div>
			</div>`)
        $(".mdl-content").append(render_place_card(null, true))
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
                    console.log(x)
                    var boxText = '<div class="mdl-card mdl-shadow--2dp" style=" border-radius: 5px; padding: 10px;"><div><p style="font-size: 16px;"><strong></strong> - stop id: </p></div><div></div><div></div><br><a style="background-color: rgba(63, 81, 181, 1); color: white;" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">Live departures</a></div>';

                    var myOptions = {
                         content: boxText
                        ,disableAutoPan: false
                        ,maxWidth: 0
                        ,pixelOffset: new google.maps.Size(25, -100)
                        ,zIndex: null
                        ,boxStyle: {
                          opacity: 0.95
                          ,width: "280px"
                         }
                        ,closeBoxMargin: "10px 2px 2px 2px"
                        ,closeBoxURL: "file/close-window.png"
                        ,infoBoxClearance: new google.maps.Size(1, 1)
                        ,isHidden: false
                        ,pane: "floatPane"
                        ,enableEventPropagation: false
                    };

                    var ib = new InfoBox(myOptions);
                    ib.open(map, this);

                    $("#place_card").replaceWith(render_place_card(card, false))
                });
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
            "image_url": "",
            "lat": null,
            "lng": null
        }
    }
    var card_render = Mustache.render(`
			<div id="place_card" class="place_card mdl-card mdl-card-wide clear_content">
			<div class="mdl-card__title" style="background: linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url('{{ image_url }}') center/cover;">
				<h2 class="mdl-card__title-text">{{ title }}</h2>
			</div>
			<div class="mdl-card__supporting-text">
			 {{ subtitle }}
			</div>
            <div id="{{ button_url }}" class="mdl-card__supporting-text" style="display: none;">
             {{ subtitle }}
            </div>
			<div class="mdl-card__actions mdl-card--border">
			    <a class="mdl-button mdl-button--colored mdl-button-rounded mdl-js-button mdl-js-ripple-effect" onclick="$('#{{ button_url }}').show(); $(this).hide(); resize_bigger_card();">
			       Show more...
			    </a>
			  </div>
			<div class="mdl-card__menu">
            <button id="resize" class="mdl-button bigmap" onclick="resize();">
                <i class="material-icons">expand_less</i>
            </button>
			</div>
		</div>`, card_data);
    return card_render
}


function resize() {
    if ($("#resize").hasClass("bigmap")) {
        $("#resize").removeClass("bigmap").addClass("bigcard");
        $("#map").css("height", "35vh");
        $("#place_card").css("height", "55vh");
        $("#resize").html('<i class="material-icons">expand_more</i>')
    } else {
        $("#resize").removeClass("bigcard").addClass("bigmap");
        $("#map").css("height", "55vh");
        $("#place_card").css("height", "35vh");
        $("#resize").html('<i class="material-icons">expand_less</i>')
    }
}

function clear() {
    $(".clear_content").remove()
}
