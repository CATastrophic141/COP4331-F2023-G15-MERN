const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const account = require("./routes/account.js");
const pins = require("./routes/pins.js");
const client = require('./config/db.js');
const dotenv = require('dotenv');
const path = require('path')

// assign port
const PORT = process.env.PORT || 5000;

// create express app
const app = express();

// searches for the env file
dotenv.config();

// set port, listen for requests
app.set('port', (process.env.PORT || 5000))

// parse requests of content-type - application/x-www-form-urlencoded
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// parse requests of content-type - application/json
app.use("/api", account);
app.use("/api", pins);

// cors error handling
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods', 
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
});

/**
 * This function connects the client to the MongoDB server and sends a ping to confirm a successful connection.
 * If the connection is unsuccessful, an error message is logged.
 * Finally, the function ensures that the client will close when you finish/error.
 */
async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch {
    console.log("Unable to connect to MongoDB. Check connection.");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

//  set the route to the index.html file and serve it
if (process.env.NODE_ENV === 'production')
{

  // Set static folder
  app.use(express.static('frontend/build'));
  // Serve index.html file if it exists on the server (production)
  app.get('*', (req, res) =>
  {
    console.log('__dirname:', __dirname);
    console.log('Resolved Path:', path.resolve(__dirname, 'frontend', 'build', 'index.html'));
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}

run().catch(console.dir);