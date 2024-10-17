const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (HTML, CSS, JavaScript)
app.use(express.static('public')); // Ensure your HTML and frontend files are in the 'public' directory

// Endpoint to save log data to CSV
app.post('/save-log', (req, res) => {
  const logData = req.body.data;
  fs.writeFile('log.csv', logData, (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to save log entries.' });
    }
    res.json({ success: true });
  });
});

// Endpoint to get log data from CSV
app.get('/get-log', (req, res) => {
  fs.readFile('log.csv', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to read log entries.' });
    }
    res.send(data); // Send the contents of the log.csv file
  });
});

// Endpoint to save the highest value
app.post('/save-highest', (req, res) => {
  const { highest } = req.body;

  // Check if highest is provided
  if (highest === undefined) {
      return res.status(400).json({ success: false, message: 'No highest value provided' });
  }

  // Save the value to a file (or database)
  fs.writeFile('highest.txt', highest.toString(), (err) => {
      if (err) {
          return res.status(500).json({ success: false, message: 'Failed to save value' });
      }
      res.json({ success: true });
  });
});

// Endpoint to get the highest value
app.get('/get-highest', (req, res) => {
  // Read the value from the file
  fs.readFile('highest.txt', 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ success: false, message: 'Failed to read value' });
      }
      
      // Check if the file is empty
      if (!data) {
          return res.status(404).json({ success: false, message: 'No highest value found' });
      }

      // Send the highest value as a response
      res.json({ success: true, highest: data });
  });
});



// Fallback route for root URL (to serve an HTML file if needed)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Ensure your main HTML file is named 'index.html' and in the 'public' directory
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
