const express = require("express");
const cors = require("cors");
const csvtojson = require("csvtojson");
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const propertySearch = require("./services/propertySearch");
// const propertyPreBook = require('./services/preBook');
const propertyBook = require("./services/bookProperty");
const basketBooking = require("./services/basketBooking");
const showBooking = require("./services/showBooking");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'orbis_imp'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  db.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send('User registered');
      }
    }
  );
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else if (result.length > 0) {
        res.status(200).send({ message: 'Login successful', user: result[0] });
      } else {
        res.status(400).send({ message: 'Invalid credentials' });
      }
    }
  );
});


app.get("/api/regions", async (req, res) => {
  const { searchQuery } = req.query;
  try {
    const jsonData = await csvtojson().fromFile(__dirname + "/Location.csv");
    const filteredRegions = jsonData.filter((row) =>
      row.Country.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const uniqueRegions = Array.from(
      new Set(filteredRegions.map((row) => row.RegionID))
    ).map((regionID) => {
      return filteredRegions.find((row) => row.RegionID === regionID);
    });
    res.json(uniqueRegions);
  } catch (error) {
    console.error("Error fetching regions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/resorts", async (req, res) => {
  const { regionId } = req.query;
  try {
    const jsonData = await csvtojson().fromFile(__dirname + "/Location.csv");
    const resorts = jsonData.filter((row) => row.RegionID === regionId);
    res.json(resorts);
  } catch (error) {
    console.error("Error fetching resorts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/properties", async (req, res) => {
  const { resorts } = req.query;
  if (!resorts) {
    return res
      .status(400)
      .json({ error: "Resorts query parameter is required" });
  }
  const resortIds = resorts.split(",");
  try {
    const jsonData = await csvtojson().fromFile(
      __dirname + "/PropertyFile_Locations.csv"
    );
    const properties = jsonData.filter((row) =>
      resortIds.includes(row.ResortID)
    );
    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/property-search", async (req, res) => {
  const {
    arrivalDate,
    duration,
    propertyReferenceIDs,
    adults,
    children,
    childAges,
    infant,
  } = req.body;
  const propertyIds = Array.isArray(propertyReferenceIDs)
    ? propertyReferenceIDs
    : [propertyReferenceIDs];
  try {
    const searchResult = await propertySearch(
      "OrbisTechnomineTest",
      "Techn0m1n3Test#24",
      arrivalDate,
      duration,
      propertyIds,
      adults,
      children,
      childAges,
      infant
    );
    console.log("Backend Response:", searchResult);
    res.json(searchResult);
  } catch (error) {
    console.error("Error performing property search:", error);
    res.status(500).json({ error: "Failed to perform property search" });
  }
});

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.post("/api/property-book", async (req, res) => {
  const {
    arrivalDate,
    duration,
    propertyReferenceID,
    roomBookings,
    bookingToken,
  } = req.body;
  try {
    const bookResult = await propertyBook(
      "OrbisTechnomineTest",
      "Techn0m1n3Test#24",
      bookingToken,
      arrivalDate,
      duration,
      propertyReferenceID,
      roomBookings
    );
    console.log("Backend Response:", bookResult);
    res.json(bookResult);
  } catch (error) {
    console.error("Error performing property book:", error);
    res.status(500).json({ error: "Failed to perform property book" });
  }
});

app.post("/api/show-book", async (req, res) => {
  try {
    const showResult = await showBooking();
    console.log("Show Response", showResult);
    res.json(showResult);
  } catch (error) {
    console.error("Error performing show booking:", error);
    res.status(500).json({ error: "Failed to perform show booking" });
  }
});

// Endpoint for performing basket booking
app.post("/api/basket-book", async (req, res) => {
  const {
      leadCustomer,
      guestDetails,
      propertyBookings
  } = req.body;

  try {
      // Call basketBooking function here
      const bookResult = await basketBooking(
          "OrbisTechnomineTest",
          "Techn0m1n3Test#24",
          "OBS1802",
          leadCustomer,
          guestDetails,
          propertyBookings
      );

      res.json(bookResult);
  } catch (error) {
      console.error("Error performing basket booking:", error);
      res.status(500).json({ error: "Failed to perform basket booking" });
  }
});





app.post("/api/book-property", async (req, res) => {
  const { arrivalDate, duration, bookingToken, roomBookings, contactDetails } =
    req.body;
  try {
    const bookResult = await propertyBook(
      "OrbisTechnomineTest",
      "Techn0m1n3Test#24",
      arrivalDate,
      duration,
      bookingToken,
      roomBookings,
      contactDetails
    );
    console.log("Backend Response:", bookResult);
    res.json(bookResult);
  } catch (error) {
    console.error("Error performing property book:", error);
    res.status(500).json({ error: "Failed to perform property book" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
