export default async function handler(req, res) {
  const mapsApiKey = "AIzaSyBKsbxkeZV3IiL1yofwzuzUh3RBPn2JL1s";
  // const mapsApiKey = process.env.MAPS_API_KEY;
  const { placeId } = req.query;
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${mapsApiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    console.log("api data:" + data)
    console.log("api data.result:" + data.result);
    res.status(200).json(data.result || []); // Return reviews or an empty array if none
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
