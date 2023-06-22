export function placeSearch(miSearchElement, miListElement, mapsIndoorsInstance, mapInstance) {

  // //set the state of the previousId to null
let previousId = null


  miSearchElement.addEventListener('results', (event) => {
    // Reset search results list
    miListElement.innerHTML = null;

    // Append new search results
    event.detail.forEach(location => {
      const miListItemElement = document.createElement('mi-list-item-location');
      location.properties.imageURL = mapsIndoorsInstance.getDisplayRule(location).icon
      miListItemElement.location = location;

      miListElement.appendChild(miListItemElement);
    });
  });

  miSearchElement.addEventListener('cleared', (event) => {
    // Reset search results list
    miListElement.innerHTML = null;
    mapsIndoorsInstance.filter(null);

    // Clear the location info table
    ['name', 'building', 'venue', 'floor', 'type'].forEach(prop => {
      document.getElementById(`location-${prop}`).innerText = '';
    });
  });

  miListElement.addEventListener('click', (event) => {
    // Get the selected location
    const selectedLocation = event.target.location;
    mapsIndoorsInstance.setFloor(selectedLocation.properties.floor);
    mapInstance.setCenter(selectedLocation.properties.anchor.coordinates);
    mapInstance.setPitch(0);
    // mapInstance.setZoom(20);


        mapsIndoorsInstance.addListener('click', async location => {
        try {
            //set the display rule back to the location's original settings with null in the display rule argument
            mapsIndoorsInstance.setDisplayRule(previousId, null);
        } catch (e) {
            // console.log("No previous selected location", e)
        }
        //setting the new display rule from the click event
        mapsIndoorsInstance.setDisplayRule(location.id, {
            visible: true,

            polygonVisible: true,
            polygonFillColor: "#d99830",
            polygonStrokeColor: "#d99830",
            polygonFillOpacity: 1,
            labelVisible: true,
            label: location.properties.name
        });

        previousId = location.id;
      });

    // Do something with the selected location, for example:
    console.log('Selected location:', selectedLocation);

    // Set the selected location text as the value of the search box
    miSearchElement.setAttribute('value', selectedLocation.properties.name);
    miListElement.style.display = 'none';

    // Update the location info table
    document.getElementById('location-name').innerText = selectedLocation.properties.name;
    document.getElementById('location-building').innerText = selectedLocation.properties.building;
    document.getElementById('location-venue').innerText = selectedLocation.properties.venue;
    document.getElementById('location-floor').innerText = selectedLocation.properties.floorName;
    document.getElementById('location-type').innerText = selectedLocation.properties.type;
  });

  miSearchElement.addEventListener('input', () => {
    miListElement.style.display = 'block';
  });
}
