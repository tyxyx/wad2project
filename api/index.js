const express = require("express");
const path = require("path");

const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

// Endpoint to get API config
app.get("/api/config", (req, res) => {
  res.json({
    firebaseConfig: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    mapsApi: {
      mapsApi: process.env.MAPS_API_KEY,
    },
  });
});

module.exports = app;
