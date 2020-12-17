var somevar;

var centerLatitude = 52.8797078291086;
var centerLongitude = 18.796807050620856;

async function getLocalizationsFromBackend() {
    var response= await fetch("http://5.135.20.171:34225/localization/all");
    var data = await response.json();
    return data;
}

async function getEventFromBackendById(id) {
    var url = 'https://cors-anywhere.herokuapp.com/' +
            "http://5.135.20.171:10801/event?idString=" + id;
    console.log(url);
    var response = await fetch(url);
    var data = await response.json();
    return data;
}

function addMarkerToMap(createdMap, latitude, longitude, iconLink) {
    var marker = new google.maps.Marker({
        position:{lat:latitude,lng:longitude},
        map: createdMap,
        icon: iconLink
    });
    return marker;
}

async function addListenerToShowEvents(map, localization, localizationMarker) {
    var isClicked = new Boolean(false);
    var markers = [];
    localizationMarker.addListener("click", () => {
        if (markers.length == 0) {
            var eventsList = localization.events;
            var counter = 1;
            eventsList.forEach(async function(event) {
                var data = await getEventFromBackendById(event);
                if (data.length != 0) {
                    item = data[0];
                    createdMarker = addMarkerToMap(map,
                            localization.latitude,
                            localization.longitude + (counter * 0.003),
                            createEventIconLink(item));
                    addWindowContentToMarker(createdMarker,
                            createEventInfoWindowContent(item));
                    markers.push(createdMarker);
                }
                counter++;
            });
        } else {
            markers.forEach(function(m) {
                m.setMap(null);
            });
            markers = [];
        }
    });
}

function createEventIconLink(event) {
    return `https://api.geoapify.com/v1/icon/?type=material&color=blue&icon=paw&iconType=awesome&apiKey=5283e59912ef4ac38b24b3937332eea7`
}

function createEventInfoWindowContent(event) {
    return `<h1>${event.name}</h1>`;
}

function addWindowContentToMarker(marker, infoWindowContent) {
    var infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent
    });

    marker.addListener('mouseover', function() {
        infoWindow.open(map, marker);
        marker.addListener('mouseout', function() {
            infoWindow.close();
        });
    });
}

function calculateDistance(localization) {
    var r = 1;
    var centerLat = centerLatitude * r;
    var centerLon = centerLongitude * r;
    var lat = localization.latitude * r;
    var lon = localization.longitude * r;
    return Math.sqrt(Math.pow(centerLat - lat, 2) + Math.pow(centerLongitude - lon, 2));
}

function createInfoList(localization) {
    var icon;
    switch (localization.domain) {
        case "paliwo":
            icon = "wifi";
            break;
        case "zdrowie":
            icon = "landmark";
            break;
        case "odpoczynek":
            icon = "glass-martini";
            break;
        case "las":
            icon = "tree";
            break;
        case "domek":
            icon = "utensils";
            break;
        case "paw":
            icon = "paw";
            break;
    }

    var eventCount = localization.events.length;
    var text = eventCount != 0 ? `&text=${eventCount}` : '';
    var distance = calculateDistance(localization);
    var result = 16777215 * distance;
    if (result > 16777215) result = 16777215;
    result = Number(result).toString(16).split('\.')[0];
    result = `23${result}`
    return `https://api.geoapify.com/v1/icon/?type=material&color=%${result}&icon=${icon}&iconType=awesome${text}&apiKey=5283e59912ef4ac38b24b3937332eea7`;
}

async function initMap() {
    var options = {
        zoom:14,
        center:{lat:centerLatitude,lng:centerLongitude}
    }
    var map = new google.maps.Map(document.getElementById('map'), options);
    var infoWindowContent = '<h1>Codecool</h1>';
    var data = await getLocalizationsFromBackend();

    for (var item of data) {
        var infoLink = createInfoList(item);
        var marker = addMarkerToMap(map, item.latitude, item.longitude, infoLink);
        await addListenerToShowEvents(map, item, marker);
    }
    /*
    var i;
    for (i = 1; i < 10; i++) {
        item.longitude -= 0.1;
        item.domain = "paw";
        var infoLink = await createInfoList(item);
        await addMarkerToMap(map, item.latitude, item.longitude, infoLink);
    }
    */
}

