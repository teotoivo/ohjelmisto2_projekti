api = "http://127.0.0.1:3000/"
const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get('name');


function changeCurrentAirportTrigger(ident) {
    let trigger = document.querySelector("#trigger");
    document.trigger_new = ident;
    trigger.click();
}

/**
 * Calculate the distance between two coordinates in kilometers using the Haversine formula.
 * @param {number} lat1 - Latitude of the first point in decimal degrees.
 * @param {number} lon1 - Longitude of the first point in decimal degrees.
 * @param {number} lat2 - Latitude of the second point in decimal degrees.
 * @param {number} lon2 - Longitude of the second point in decimal degrees.
 * @returns {number} - Distance in kilometers.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers

    // Convert degrees to radians
    const toRadians = degrees => degrees * (Math.PI / 180);

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers

    return distance.toFixed(0);
}



if (name) {
    main()
}


/**
 *
 * @param ident
 * @returns {Promise<{
 *
 * }>}
 */
async function getAirport(ident) {
    const response = await fetch(api + "get_airport", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ident: ident})
    });

    return await response.json();
}

async function main() {
    let map = L.map('map').setView([0, 0], 3);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let fuels = [
        ["Bio fuel", 400, 1],
        ["Jet fuel", 1000, 2],
        ["Super fuel", 10000, 5]
    ]
    let current_fuel = fuels.length - 1;



    function calculateCo2Consumed(distance) {
        return distance * fuels[current_fuel][2];
    }

    const response = await fetch(api + "get_game_data", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: name})
    });

    /**
     * @type {{
     * co2_consumed: number,
     * current_airport_ident: string,
     * destination_airport_ident: string,
     * home_airport_ident: string,
     * player_name: string,
     * total_distance: string
     * }}
     */
    let game_data = await response.json();

    document.querySelector("#distance").innerText = game_data.total_distance;
    document.querySelector("#co2").innerText = game_data.co2_consumed;

    console.log(game_data)

    let start_airport = await getAirport(game_data.home_airport_ident);

    let current_airport = await getAirport(game_data.current_airport_ident);

    let current_marker = new L.marker([current_airport.latitude_deg, current_airport.longitude_deg]).addTo(map).bindPopup("You are here", {
        closeButton: false,
        closeOnClick: false,
        closeOnEscapeKey: false,
        autoClose: false
    }).openPopup()

    let range_circle = L.circle([current_airport.latitude_deg, current_airport.longitude_deg], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: fuels[current_fuel][1] * 1000
    }).addTo(map);

    document.querySelector(".fuel").onclick = () => {
        current_fuel = (current_fuel + 1) % fuels.length;
        document.querySelector("#current_fuel").innerText = fuels[current_fuel][0];
        document.querySelector("#range").innerText = fuels[current_fuel][1];
        document.querySelector("#multiplier").innerText = fuels[current_fuel][2] + "x";
        range_circle.setRadius(fuels[current_fuel][1] * 1000);
        refreshLargeMarkers()
        checkMediumMarkers()
        checkSmallMarkers()
    }
    document.querySelector(".fuel").click();


    async function saveGameData() {
        const response = await fetch(api + "save_game_data", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(game_data)
        });

        return await response.json();
    }

    async function changeCurrentAirport(new_airport) {
        let airport = await getAirport(new_airport);
        current_marker.setLatLng([airport.latitude_deg, airport.longitude_deg])
        range_circle.setLatLng([airport.latitude_deg, airport.longitude_deg])
        current_airport = airport;

        refreshLargeMarkers()
        checkMediumMarkers()
        checkSmallMarkers()

        let distance = calculateDistance(start_airport.latitude_deg, start_airport.longitude_deg, airport.latitude_deg, airport.longitude_deg);
        let co2_consumed = calculateCo2Consumed(distance);

        if (isNaN(game_data.total_distance)) {
            game_data.total_distance = 0;
        }
        if (isNaN(game_data.co2_consumed)) {
            game_data.co2_consumed = 0;
        }

        game_data.current_airport_ident = new_airport;
        game_data.total_distance = Number(game_data.total_distance) + Number(distance);
        game_data.co2_consumed += co2_consumed;

        document.querySelector("#distance").innerText = game_data.total_distance;
        document.querySelector("#co2").innerText = game_data.co2_consumed;
        document.querySelector("#current").innerText = airport.name;


        if (new_airport === game_data.destination_airport_ident) {
            const basePath = window.location.pathname.split('/').slice(0, -2).join('/'); // Remove "create_new/index.html"
            window.location.href = `${basePath}/win?co2=${game_data.co2_consumed}&distance=${game_data.total_distance}&name=${name}`;
        }

        await saveGameData()
    }

    document.querySelector("#trigger").onclick = async () => {
        let ident = document.trigger_new
        await changeCurrentAirport(ident)
    }

    //set destination airport marker
    let destination_airport = await getAirport(game_data.destination_airport_ident);
    let destination_marker = new L.marker([destination_airport.latitude_deg, destination_airport.longitude_deg]).addTo(map).bindPopup("Destination", {
        closeButton: false,
        closeOnClick: false,
        closeOnEscapeKey: false,
        autoClose: false
    }).openPopup()



    const s_response = await fetch(api + "get_all_small_airports");
    let small_airports = await s_response.json();
    const m_response = await fetch(api + "get_all_medium_airports");
    let medium_airports = await m_response.json();
    const l_response = await fetch(api + "get_all_large_airports");
    let large_airports = await l_response.json();

    small_airports = small_airports["airports"]
    medium_airports = medium_airports["airports"]
    large_airports = large_airports["airports"]


    function popup_content(airport) {
        let canTravelThere = calculateDistance(current_airport.latitude_deg, current_airport.longitude_deg, airport.latitude_deg, airport.longitude_deg) <= fuels[current_fuel][1];
        return `
        <div id="${airport.ident}">
            ${
            canTravelThere ?
                `<button onclick="changeCurrentAirportTrigger('${airport.ident}')">Travel here</button>` :
                `<p>Too far</p>`
       }
            <p>Distance to airport: ${calculateDistance(current_airport.latitude_deg, current_airport.longitude_deg, airport.latitude_deg, airport.longitude_deg)}</p>
        </div>   
    ` }

    let large_markers = large_airports.map(airport => {
        return L.marker([airport.latitude_deg, airport.longitude_deg])
            .addTo(map).bindPopup(popup_content(airport));


    });

    function refreshLargeMarkers() {
        large_markers.forEach(marker => {
            map.removeLayer(marker)
        });
        large_markers = large_airports
            .filter(airport => map.getBounds().contains([airport.latitude_deg, airport.longitude_deg]))
            .map(airport => {
                return L.marker([airport.latitude_deg, airport.longitude_deg])
                    .addTo(map).bindPopup(popup_content(airport));
            });
    }

    let medium_markers = []

    function checkMediumMarkers () {
        let currentZoom = map.getZoom();
         medium_markers.forEach(marker => {
             map.removeLayer(marker)
         })
        medium_markers = []

        if (currentZoom >= 7) {
            medium_markers = medium_airports
                .filter(airport => map.getBounds().contains([airport.latitude_deg, airport.longitude_deg]))
                .map(airport => {
                    return new L.marker([airport.latitude_deg, airport.longitude_deg])
                        .addTo(map)
                        .bindPopup(popup_content(airport));
                });
        }
    }

    let small_markers = []

    function checkSmallMarkers() {
    let currentZoom = map.getZoom();
    small_markers.forEach(marker => {
        map.removeLayer(marker);
    });
    small_markers = [];

    if (currentZoom >= 9) {
        small_markers = small_airports
            .filter(airport => map.getBounds().contains([airport.latitude_deg, airport.longitude_deg]))
            .map(airport => {
                return new L.marker([airport.latitude_deg, airport.longitude_deg])
                    .addTo(map)
                    .bindPopup(popup_content(airport));
            });
    }
}

    map.on('zoomend', checkSmallMarkers);
    map.on('dragend', checkSmallMarkers);

    map.on('zoomend', checkMediumMarkers);
    map.on('dragend', checkMediumMarkers);

}