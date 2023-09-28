import { defineCustomElements } from 'https://www.unpkg.com/@mapsindoors/components/dist/esm/loader.js';
import { placeSearch } from './components/search/search.js';
import { initializeMapClicks } from './components/mapInteraction/clickListening.js';
import { createGeoData, integrationApiKey } from './components/integrationApi/integrationApi.js';



let mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN



defineCustomElements();
// Get the venue selector and building selector elements
const venueSelector = document.getElementById('venue-select');
const buildingSelector = document.getElementById('building-select');
const addressDisplay = document.getElementById('building-address');



let buildings; // Declare the buildings variable

// Function to populate the venue selector dropdown
function populateVenueSelector(venues) {
  venues.forEach(venue => {
    const option = document.createElement('option');
    option.value = venue.id;
    option.textContent = venue.name;
    venueSelector.appendChild(option);

  });

  // Trigger building selector population with the first venue
  const firstVenueId = venues[0].id;
  populateBuildingSelector(firstVenueId);
}

// Function to populate the building selector dropdown
function populateBuildingSelector(venueId) {
  mapsindoors.services.VenuesService.getBuildings(venueId).then(retrievedBuildings => {
    buildings = retrievedBuildings; // Update the buildings variable

    // Clear previous options
    buildingSelector.innerHTML = '';

    buildings.forEach(building => {
      const option = document.createElement('option');
      option.value = building.id;
      option.textContent = building.buildingInfo.name; // Use building name from buildingInfo
      buildingSelector.appendChild(option);
    });

    // Set default building's address
    const defaultBuilding = buildings[0];
    console.log(defaultBuilding)
    const defaultAddress = defaultBuilding && defaultBuilding.address;

    if (defaultAddress) {
      addressDisplay.textContent = defaultAddress;
    } else {
      addressDisplay.textContent = 'No address stored';
    }
  });
}

// Event listener for building selector changes
buildingSelector.addEventListener('change', event => {
  const selectedBuildingId = event.target.value;
  const selectedBuilding = buildings.find(building => building.id === selectedBuildingId);
  console.log(selectedBuilding)
  const address = selectedBuilding && selectedBuilding.address;

  if (address) {
    addressDisplay.textContent = address;
  } else {
    addressDisplay.textContent = 'No address stored';
  }
});


export const miMapElement = document.querySelector('mi-map-mapbox');
const mapViewOptions = {
  accessToken: mapboxToken,
  element: document.getElementById('map'),
  center: { lat: 48.146443278182595, lng: 17.130318221624492 },
  zoom: 20,
  maxZoom: 22,
};

const mapViewInstance = new mapsindoors.mapView.MapboxView(mapViewOptions);
const mapsIndoorsInstance = new mapsindoors.MapsIndoors({ mapView: mapViewInstance });
const mapInstance = mapViewInstance.getMap();

// Floor Selector
const floorSelectorElement = document.createElement('div');
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);
mapInstance.addControl({
  onAdd: function () {
    return floorSelectorElement;
  },
  onRemove: function () {}
});

const miSearchElement = document.getElementById('search-input');
const miListElement = document.getElementById('search-list');

mapsIndoorsInstance.on('ready', () => {
  mapsindoors.services.VenuesService.getVenues().then(venues => {

            console.log(venues);
            const anchorCoordinates = venues[0].anchor.coordinates;
            mapInstance.setCenter(anchorCoordinates);
            // mapsIndoorsInstance.setCenter(anchorCoordinates);
        }).catch(error => {
            console.error(error);
        });
  // Hide MI_BUILDING and MI_VENUE layers on the map. This will prevent them from being clicked.
  mapsIndoorsInstance.setDisplayRule(['MI_BUILDING', 'MI_VENUE'], {
    visible: false
  });

  // Initialize search and click handling
  placeSearch(miSearchElement, miListElement, mapsIndoorsInstance, mapInstance);
  initializeMapClicks(mapsIndoorsInstance, mapInstance);

  // Fetch the venues and populate the venue selector
mapsindoors.services.VenuesService.getVenues().then(venues => {
  populateVenueSelector(venues);

});

// Event listener for venue selector changes
venueSelector.addEventListener('change', event => {
  const selectedVenueId = event.target.value;
  console.log(selectedVenueId)
  populateBuildingSelector(selectedVenueId);

    mapsindoors.services.VenuesService.getVenue(selectedVenueId).then(venue => {
    console.log(venue);
    const anchorCoordinates = venue.anchor.coordinates;
    mapInstance.setCenter(anchorCoordinates);
    mapsIndoorsInstance.setZoom(20);
    miSearchElement.setAttribute('mi-venue', venueId);
  });
});




  
  // Retrieve the venues and populate the venue select dropdown
});

// Get the form and the submit button
const form = document.getElementById('work-order-form');
const submitButton = form.querySelector('button[type="submit"]');

// Get the location input field
const locationInput = document.getElementById('work-order-location');

// Disable the submit button initially
submitButton.disabled = false;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  console.log("Submit button clicked!");

  // Extract values from the form
  const requesterName = document.getElementById('requester-name').value;
  const requesterContact = document.getElementById('requester-contact').value;
  const workOrderTitle = document.getElementById('work-order-title').value;
  const category = document.getElementById('categorySelector').value;
  const descriptionText = document.getElementById('work-order-description').value; // renamed to avoid conflict
  const priority = document.getElementById('work-order-priority').value;
  const dateNeeded = document.getElementById('work-order-date').value;

  console.log("Form Data:", {
    requesterName,
    requesterContact,
    workOrderTitle,
    category,
    descriptionText,
    priority,
    dateNeeded
  });

  // Ensure we have the coordinates from map click
  if (!window.currentlySelectedLocation) {
    alert('Please select a location on the map before submitting.');
    return;
  }

  if (!window.currentlySelectedParentId) {
        alert('Failed to determine the location parentId. Please try again.');
        return;
    }

  // Gather the data for createGeoData
  const parentId = currentlySelectedParentId;

  const name = workOrderTitle;
  const description = descriptionText;
  const coordinates = window.currentlySelectedLocation; 

  try {
    const geoDataResult = await createGeoData({ parentId, name, description, coordinates });

    // Check if the status code is in the range 200-299, which indicates a successful response
    if (geoDataResult.status >= 200 && geoDataResult.status <= 299) {
        const locationId = geoDataResult.data[0]; // Assuming the response is an array with the ID as its first element
        const link = `https://storage.googleapis.com/mimtw-289/index.html?locationId=${locationId}&apiKey=${integrationApiKey}`;
        console.log('GeoData successfully created! Link:', link);
    } else {
        console.log('Failed to create GeoData.');
    }
} catch (error) {
    console.error("Error creating GeoData:", error);
    alert('An error occurred while creating GeoData. Please try again later.');
}



});

