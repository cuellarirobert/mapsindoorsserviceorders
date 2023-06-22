import { defineCustomElements } from 'https://www.unpkg.com/@mapsindoors/components/dist/esm/loader.js';
import { placeSearch } from './components/search/search.js';
import { initializeMapClicks } from './components/mapInteraction/clickListening.js';


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
submitButton.disabled = true;





// Add an event listener to the form's submit event
form.addEventListener('submit', (event) => {
  // If a location has not been selected, prevent form submission
  if (locationInput.value === '') {
    event.preventDefault();
    alert('Please select a location before submitting the form.');
  }
});

// Enable the submit button whenever the location input field has a value
locationInput.addEventListener('input', () => {
  submitButton.disabled = locationInput.value === '';
});


