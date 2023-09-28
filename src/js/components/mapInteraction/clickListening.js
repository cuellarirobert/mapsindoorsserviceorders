const apikey = import.meta.env.VITE_MAPSINDOORS_API_KEY;





export function initializeMapClicks(mapsIndoorsInstance, mapInstance) {
    mapInstance.on('click', (event) => {
        console.log("Raw map click coordinates:", event.lngLat);

        window.currentlySelectedLocation = {
            geometry: {
                coordinates: [event.lngLat.lng, event.lngLat.lat], // Format depending on your needs
                type: "Point"
            }
        };
        
        placeMarker(event.lngLat, mapInstance);
        mapsIndoorsInstance.addListener('click', (location) => handleMapsIndoorsClick(location, event.lngLat));
    });
}



let currentMarker = null;

function placeMarker(coordinates, mapInstance) {
    if (currentMarker) {
        currentMarker.setLngLat(coordinates);
    } else {
        currentMarker = new mapboxgl.Marker()
            .setLngLat(coordinates)
            .addTo(mapInstance);
    }
}

function handleMapsIndoorsClick(location, rawCoordinates) {
    if (location) {
        handleMapClickForWorkOrder(location, rawCoordinates);
    }
}

function handleMapClickForWorkOrder(location, rawCoordinates) {
    const { name, building, venue, floorName, type, externalId } = location.properties;
    console.log(location.properties);

    updateLocationInfo(name, building, venue, floorName, type, externalId);
    
    fetchGeocodeData(rawCoordinates.lat, rawCoordinates.lng, location.properties.floor);
}

export let currentlySelectedParentId = null; 

async function fetchGeocodeData(lat, lng, floor) {
    const apiUrl = `https://integration.mapsindoors.com/${apikey}/api/geocode?lat=${lat}&lng=${lng}&floor=${floor}`;
    
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'accept': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log(data);

        // Determine parentId based on your criteria
        const floorData = data.find(item => item.baseType === "floor");
        if (floorData) {
            currentlySelectedParentId = floorData.id;
        } else {
            const venueData = data.find(item => item.baseType === "venue");
            currentlySelectedParentId = venueData.id;
        }

        window.currentlySelectedParentId = currentlySelectedParentId

    } catch (error) {
        console.error('Error fetching geocode data:', error);
    }
}




function updateLocationInfo(name, building, venue, floorName, type, externalId) {
    document.getElementById('location-name').innerText = name;
    document.getElementById('location-building').innerText = building;
    document.getElementById('location-venue').innerText = venue;
    document.getElementById('location-floor').innerText = floorName;
    document.getElementById('location-type').innerText = type;
    document.getElementById('location-externalId').innerText = externalId;
}
