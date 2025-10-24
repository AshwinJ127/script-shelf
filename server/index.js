// Load environment variables from .env file
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// === Middleware ===
// Enable Cross-Origin Resource Sharing so your front-end can talk to your back-end
app.use(cors()); 
// Allow the server to understand incoming requests with JSON payloads
app.use(express.json()); 

// === Routes ===
// A simple test route to make sure the server is working
app.get('/', (req, res) => {
  res.send('ScriptShelf API is running!');
});

// === Server Start ===
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
