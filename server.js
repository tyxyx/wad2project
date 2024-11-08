require("dotenv").config({ path: "./keys.env" }); // Load environment variables

const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Access the API keys from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const mapsApiKey = process.env.MAPS_API_KEY;

// Make the Firebase config and Maps API key available to client-side code
app.get("/api/config", (req, res) => {
  res.json({
    firebaseConfig,
    mapsApiKey,
  });
});

app.use(express.static("public"));

app.get("/api/reviews/:place_id", async (req, res) => {
  const { place_id } = req.params;
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${mapsApiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(response)
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    res.json(data.result.reviews || []); // Return reviews or an empty array if none
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Export the configurations for use in other modules
module.exports = {
  firebaseConfig,
  mapsApiKey,
};
