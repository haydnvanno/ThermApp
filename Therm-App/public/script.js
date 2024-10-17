// Maximum value for the thermometer
const MAX_VALUE = 15000000;

// Initial value for the thermometer
let currentValue = 0;

// Array to store the log entries
const logEntries = [];

// Array to store the fill elements and their colors
const fillElements = [];
const colors = ['red', 'green', 'blue', 'orange', 'purple', 'yellow', 'pink', 'brown', 'teal', 'indigo'];

// Get references to the necessary elements
const thermometerContainer = document.getElementById('thermometer');
const inputContainer = document.getElementById('input-container');
const logContainer = document.getElementById('log-container');
// Get the current total element by its ID
const currentTotalElement = document.getElementById('current-total');

// Add event listener for the "Make Change" button
// Get the button reference
const makeChangeButton = document.getElementById('make-change-button');
// Add event listener for the "Make Change" button
makeChangeButton.addEventListener('click', showInputForm);

// Render the initial state
renderThermometer();
renderLog();

// Function to render the thermometer
function renderThermometer() {
    // Remove all existing fill elements
    fillElements.forEach((fill) => fill.parentNode.removeChild(fill));
    fillElements.length = 0;

    let currentHeight = 0;
    logEntries.forEach((entry, index) => {
        const fillHeight = (entry.currentAmount / MAX_VALUE) * 200;  // Use currentAmount for the height
        const newFill = document.createElement('div');
        newFill.className = 'thermometer-fill';
        newFill.style.height = `${fillHeight}px`;
        newFill.style.bottom = `${currentHeight}px`;
        newFill.style.backgroundColor = colors[index % colors.length];
        thermometerContainer.appendChild(newFill);
        fillElements.push(newFill);
        currentHeight += fillHeight;
    });
    updateCurrentTotal(calculateTotal());
}

// Function to render the log entries as a table
function renderLog() {
  logContainer.innerHTML = '';  // Clear the previous content

  // Create table and table header
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  // Define the column titles
  const headers = ['Index', 'Name', 'Reason', 'Original Amount', 'Thermometer Amount'];
  headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement('tbody');

  logEntries.forEach((entry, index) => {
      const row = document.createElement('tr');
      
      // Create and append cells for each piece of data
      const indexCell = document.createElement('td');
      indexCell.textContent = index + 1;
      row.appendChild(indexCell);

      const nameCell = document.createElement('td');
      nameCell.textContent = entry.name;
      row.appendChild(nameCell);

      const reasonCell = document.createElement('td');
      reasonCell.textContent = entry.reason;
      row.appendChild(reasonCell);

      const originalAmountCell = document.createElement('td');
      originalAmountCell.textContent = entry.originalAmount;
      row.appendChild(originalAmountCell);

      const currentAmountCell = document.createElement('td');
      currentAmountCell.textContent = entry.currentAmount;
      row.appendChild(currentAmountCell);

      tbody.appendChild(row);  // Append the row to the table body
  });

  table.appendChild(tbody);  // Append the body to the table
  logContainer.appendChild(table);  // Append the table to the container

  // Update the total after rendering the log
  updateCurrentTotal(calculateTotal());
}

// Function to show the input form
function showInputForm() {
    const name = prompt('Enter your name:');
    const reason = prompt('Enter the reason for the change:');
    const amount = parseInt(prompt('Enter the amount (positive for addition, negative for removal):'));

    if (!isNaN(amount)) {
        updateValue(amount, name, reason);
    } else {
        alert('Invalid amount entered.');
    }
}



// Function to update the current total
function updateCurrentTotal(newTotal) {
  // Update the text content of the element
  currentTotalElement.textContent = `Current Total: ${newTotal}`;
}

// Function to calculate the total of all current amounts in the log
function calculateTotal() {
  return logEntries.reduce((total, entry) => total + entry.currentAmount, 0);
}

// Function to update the value, log the change, and render the thermometer and log
function updateValue(amount, name, reason) {
    if (amount < 0) {
        // Handle negative amounts (subtractions)
        subtractEvenly(-amount);  // Pass the absolute value to subtract
        const logEntry = { 
            name, 
            reason, 
            originalAmount: amount,  // Log the original negative amount
            currentAmount: 0          // Set currentAmount to 0 after subtraction
        };
        logEntries.push(logEntry);  // Add entry to log
        saveLogEntry(logEntries);
    } else {
        currentValue = amount;
        currentValue = Math.max(0, Math.min(currentValue, MAX_VALUE)); // Clamp the value between 0 and MAX_VALUE

        const logEntry = { 
            name, 
            reason, 
            originalAmount: amount,  // Log the original positive amount
            currentAmount: currentValue // Log the updated current amount
        };
        logEntries.push(logEntry);  // Store the log entry

        // Send the new log entry to the server
        saveLogEntry(logEntries);
    }

    renderThermometer();
    renderLog();
    updateCurrentTotal(calculateTotal());
}

// Function to subtract a negative amount evenly from all existing log entries
function subtractEvenly(amount) {
  const nonZeroEntries = logEntries.filter(entry => entry.currentAmount > 0); // Filter out entries with currentAmount of 0
  const totalValue = nonZeroEntries.reduce((sum, entry) => sum + entry.currentAmount, 0);  // Get total current value from non-zero entries
  
  // Ignore if the total value is 0 or if the amount is 0
  if (totalValue === 0 || amount === 0) return;  // Avoid dividing by zero and ignore if amount is 0

  const scale = amount / totalValue;  // Proportional scale for subtraction

  nonZeroEntries.forEach(entry => {
      const subtractAmount = entry.currentAmount * scale;
      entry.currentAmount = Math.max(0, entry.currentAmount - subtractAmount);  // Ensure currentAmount doesn't go below zero
  });

  currentValue = logEntries.reduce((sum, entry) => sum + entry.currentAmount, 0);  // Recalculate current value
  currentValue = Math.max(0, Math.min(currentValue, MAX_VALUE)); // Clamp between 0 and MAX_VALUE
  updateCurrentTotal(calculateTotal());
}


// Function to save the log entries to the server
function saveLogEntry(entries) {
    const csvData = entries.map(entry => `${entry.name},${entry.reason},${entry.originalAmount},${entry.currentAmount}`).join('\n');

    fetch('/save-log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: csvData }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Log entry saved successfully');
        } else {
            console.error('Failed to save log entry:', data.message);
        }
    })
    .catch(error => {
        console.error('Error saving log entry:', error);
    });
}

// Function to fetch log data from the log.csv file
function fetchLogData() {
  fetch('/get-log')  // Fetch the data from the /get-log API endpoint
      .then(response => response.text())
      .then(data => {
          const rows = data.trim().split('\n');  // Split rows by newline

          // Check if rows are empty after trimming
          if (rows.length === 0 || (rows.length === 1 && rows[0] === '')) {
              logEntries.length = 0;  // Clear existing log entries
              renderThermometer();  // Render the thermometer (it should be empty)
              renderLog();  // Render the log entries (it should be blank)
              return;  // Exit the function early
          }

          const parsedData = rows.map(row => {
              const [name, reason, originalAmount, currentAmount] = row.split(',');  // Split by comma
              return { 
                  name, 
                  reason, 
                  originalAmount: parseInt(originalAmount),  // Store original amount
                  currentAmount: parseInt(currentAmount)   // Initialize current amount
              };
          });

          logEntries.length = 0;  // Clear existing log entries
          logEntries.push(...parsedData);  // Add parsed data to log entries
          renderThermometer();  // Render the thermometer with new data
          renderLog();  // Render the log entries
      })
      .catch(error => console.error('Error fetching log data:', error));
}


// Load data when the page loads
window.addEventListener('load', fetchLogData);
