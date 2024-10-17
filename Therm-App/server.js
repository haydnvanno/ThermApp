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

// Fallback route for root URL (to serve an HTML file if needed)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Ensure your main HTML file is named 'index.html' and in the 'public' directory
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
