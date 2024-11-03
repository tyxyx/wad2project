let firebaseConfig = {}; // Initialize as an empty object
let mapsApi = {}; // Initialize as an empty object

// Function to fetch the configuration
const fetchConfig = async () => {
  try {
    const response = await fetch("/api/config");
    const config = await response.json();

    firebaseConfig = config.firebaseConfig; // Update with fetched config
    mapsApi = config.mapsApi; // Update with fetched config

  } catch (error) {
    console.error("Error fetching config:", error);
  }
};

// Immediately invoke the function to fetch the config
fetchConfig();

// Export the configuration variables
export { firebaseConfig, mapsApi };
