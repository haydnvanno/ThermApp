// Maximum value for the thermometer
const MAX_VALUE = 100;

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

// Add event listener for the "Make Change" button
const makeChangeButton = document.createElement('button');
makeChangeButton.textContent = 'Make Change';
inputContainer.appendChild(makeChangeButton);
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
    const fillHeight = (entry.amount / MAX_VALUE) * 200;
    const newFill = document.createElement('div');
    newFill.className = 'thermometer-fill';
    newFill.style.height = `${fillHeight}px`;
    newFill.style.bottom = `${currentHeight}px`;
    newFill.style.backgroundColor = colors[index % colors.length];
    thermometerContainer.appendChild(newFill);
    fillElements.push(newFill);
    currentHeight += fillHeight;
  });
}

// Function to render the log entries
function renderLog() {
  logContainer.innerHTML = '';

  logEntries.forEach((entry, index) => {
    const logEntry = document.createElement('div');
    logEntry.textContent = `${index + 1}. ${entry.name} - ${entry.reason} (${entry.amount})`;
    logContainer.appendChild(logEntry);
  });
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

// Function to update the value, log the change, and render the thermometer and log
function updateValue(amount, name, reason) {
  currentValue += amount;
  currentValue = Math.max(0, Math.min(currentValue, MAX_VALUE)); // Clamp the value between 0 and MAX_VALUE

  const logEntry = { name, reason, amount };
  logEntries.push(logEntry);

  renderThermometer();
  renderLog();
}

// Function to fetch log data from the log.csv file
function fetchLogData() {
  fetch('log.csv')
    .then(response => response.text())
    .then(data => {
      const rows = data.trim().split('\n');
      const parsedData = rows.map(row => {
        const [name, reason, amount] = row.split(',');
        return { name, reason, amount: parseInt(amount) };
      });
      logEntries.push(...parsedData);
      renderThermometer();
      renderLog();
    })
    .catch(error => console.error('Error fetching log data:', error));
}

// Load data when the page loads
window.addEventListener('load', fetchLogData);