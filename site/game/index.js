api = "http://127.0.0.1:3000/"
const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get('name');

if (name) {
    main()
}

async function main() {
    let map = L.map('map').setView([0, 0], 3);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);





    const s_response = await fetch(api + "get_all_small_airports");
    let small_airports = await s_response.json();
    const m_response = await fetch(api + "get_all_medium_airports");
    let medium_airports = await m_response.json();
    const l_response = await fetch(api + "get_all_large_airports");
    let large_airports = await l_response.json();

    small_airports = small_airports["airports"]
    medium_airports = medium_airports["airports"]
    large_airports = large_airports["airports"]

    let large_markers = large_airports.map(airport => {
        return L.marker([airport.latitude_deg, airport.longitude_deg]).addTo(map).bindPopup(airport.name);
    });


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
                        .bindPopup(airport.name);
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
                    .bindPopup(airport.name);
            });
    }

    console.log(small_markers);
}

    map.on('zoomend', checkSmallMarkers);
    map.on('dragend', checkSmallMarkers);

    map.on('zoomend', checkMediumMarkers);
    map.on('dragend', checkMediumMarkers);
}