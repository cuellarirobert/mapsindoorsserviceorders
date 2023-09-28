const miUsername = import.meta.env.VITE_MI_USERNAME;
const miPassword = import.meta.env.VITE_MI_PASSWORD;
export const integrationApiKey = import.meta.env.VITE_MAPSINDOORS_API_KEY;

let cachedToken = null;
let tokenExpiryTime = null;

const isTokenExpired = () => {
    if (!tokenExpiryTime) return true;
    const currentTime = Date.now();
    return currentTime >= tokenExpiryTime;
};

// Fetch bearer token from MapsIndoors
const fetchBearerToken = async () => {
    if (cachedToken && !isTokenExpired()) {
        return cachedToken;
    }

    const response = await fetch('https://auth.mapsindoors.com/connect/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `client_id=client&username=${miUsername}&grant_type=password&password=${miPassword}`
    });
    const json = await response.json();

    // Cache the token and set the expiry time.
    cachedToken = `Bearer ${json.access_token}`;
    // Assuming token expiry is in seconds, convert to milliseconds and subtract a small buffer (e.g., 10 seconds) to ensure we refresh before it actually expires.
    tokenExpiryTime = Date.now() + (json.expires_in - 10) * 1000;

    return cachedToken;
};
const getDatasetId = async (apiKey) => {
    const response = await fetch(`https://integration.mapsindoors.com/${apiKey}/api/dataset`);
    if (!response.ok) {
        throw new Error('Failed to fetch datasetId');
    }
    const data = await response.json();
    return data.id;
};

const createGeoData = async ({ parentId, name, description, coordinates }) => {
    const datasetId = await getDatasetId(integrationApiKey);

    const actualCoordinates = coordinates.geometry.coordinates;


    const payload = [{
        parentId: parentId,
        datasetId: datasetId,
        externalId: Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10), // Randomly generated
        baseType: 'poi',
        displayTypeId: 'c2dce6f2339f4ad29da89169',
        geometry: {
            coordinates: actualCoordinates,
            type: 'Point'
        },
        anchor: {
            coordinates: actualCoordinates,
            type: 'Point'
        },
        aliases: [],
        categories: [], // Consider adding category ids if needed.
        status: 3,
        baseTypeProperties: {
            capacity: '0',
            obstacle: 'false'
            // Consider adding other properties like "administrativeid", "imageurl" if required.
        },
        properties: {
            'name@en': name,
            'description@en': description,
            'name@generic': 'generic'
            // Consider adding other properties as seen in the example if required.
        }
    }];

    const bearerToken = await fetchBearerToken(); // Get the token (either cached or fetch a new one)
    const response = await fetch(`https://integration.mapsindoors.com/${integrationApiKey}/api/geodata`, {
        method: 'POST',
        headers: {
            'Authorization': bearerToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return {
        status: response.status,
        data: await response.json()
    };
};



export {
    fetchBearerToken,
    createGeoData
};