// Simple localStorage-based mechanic dashboard

// DOM Elements
const loginSection = document.getElementById('login-section');
const userSection = document.getElementById('userSection');
const currentMechanicSpan = document.getElementById('currentMechanic');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const mechanicNameInput = document.getElementById('mechanicNameInput');

const dashboard = document.getElementById('dashboard');

const clockInBtn = document.getElementById('clockInBtn');
const clockOutBtn = document.getElementById('clockOutBtn');
const clockStatus = document.getElementById('clockStatus');

const repairForm = document.getElementById('repairForm');
const logsBody = document.getElementById('logsBody');

let mechanicName = null;
let isClockedIn = false;
let clockInTime = null;

// Login Function
loginBtn.addEventListener('click', () => {
  const name = mechanicNameInput.value.trim();
  if (!name) return alert('Please enter your name');
  mechanicName = name;
  localStorage.setItem('currentMechanic', mechanicName);
  showDashboard();
});

// Logout
logoutBtn.addEventListener('click', () => {
  mechanicName = null;
  isClockedIn = false;
  clockInTime = null;
  localStorage.removeItem('currentMechanic');
  localStorage.removeItem(`${mechanicName}_clockIn`);
  loginSection.style.display = 'block';
  userSection.style.display = 'none';
  dashboard.style.display = 'none';
});

// Show Dashboard after login
function showDashboard() {
  loginSection.style.display = 'none';
  userSection.style.display = 'block';
  dashboard.style.display = 'block';
  currentMechanicSpan.textContent = mechanicName;
  loadClockStatus();
  loadLogs();
}

// Clock In
clockInBtn.addEventListener('click', () => {
  if (isClockedIn) return alert('You are already clocked in!');
  clockInTime = new Date().toISOString();
  localStorage.setItem(`${mechanicName}_clockIn`, clockInTime);
  isClockedIn = true;
  updateClockStatus();
});

// Clock Out
clockOutBtn.addEventListener('click', () => {
  if (!isClockedIn) return alert('You are not clocked in!');
  const clockOutTime = new Date().toISOString();
  const clockInStored = localStorage.getItem(`${mechanicName}_clockIn`);
  if (!clockInStored) return alert('Error: No clock in time found');
  // Save time worked (in minutes)
  const timeWorked = (new Date(clockOutTime) - new Date(clockInStored)) / 60000;
  // Save the session to logs
  const sessions = JSON.parse(localStorage.getItem(`${mechanicName}_sessions`) || '[]');
  sessions.push({
    clockIn: clockInStored,
    clockOut: clockOutTime,
    minutesWorked: timeWorked.toFixed(2),
  });
  localStorage.setItem(`${mechanicName}_sessions`, JSON.stringify(sessions));
  localStorage.removeItem(`${mechanicName}_clockIn`);
  isClockedIn = false;
  clockInTime = null;
  updateClockStatus();
  alert(`Clocked out! You worked ${timeWorked.toFixed(2)} minutes`);
});

// Update clock status display
function updateClockStatus() {
  if (isClockedIn) {
    clockStatus.textContent = `Clocked in at ${new Date(clockInTime).toLocaleTimeString()}`;
  } else {
    clockStatus.textContent = 'Not clocked in';
  }
}

// Load clock status from localStorage
function loadClockStatus() {
  const storedClockIn = localStorage.getItem(`${mechanicName}_clockIn`);
  if (storedClockIn) {
    isClockedIn = true;
    clockInTime = storedClockIn;
  } else {
    isClockedIn = false;
    clockInTime = null;
  }
  updateClockStatus();
}

// Repair form submit
repairForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!mechanicName) return alert('Please login first');

  const customerName = document.getElementById('customerName').value.trim();
  const vehiclePlate = document.getElementById('vehiclePlate').value.trim();
  const vehicleModel = document.getElementById('vehicleModel').value.trim();
  const repairDetails = document.getElementById('repairDetails').value.trim();
  const partsUsed = document.getElementById('partsUsed').value.trim();
  const price = parseFloat(document.getElementById('price').value);

  if (!customerName || !vehiclePlate || !vehicleModel || !repairDetails || isNaN(price)) {
    return alert('Please fill all required fields correctly');
  }

  // Create new log entry
  const newLog = {
    date: new Date().toISOString(),
    mechanic: mechanicName,
    customerName,
    vehiclePlate,
    vehicleModel,
    repairDetails,
    partsUsed,
    price: price.toFixed(2),
  };

  // Save log to localStorage
  const logs = JSON.parse(localStorage.getItem('repairLogs') || '[]');
  logs.push(newLog);
  localStorage.setItem('repairLogs', JSON.stringify(logs));

  // Reset form
  repairForm.reset();

  // Refresh logs table
  loadLogs();
  alert('Repair logged successfully!');
});

// Load and display repair logs
function loadLogs() {
  const logs = JSON.parse(localStorage.getItem('repairLogs') || '[]');
  logsBody.innerHTML = '';
  logs.forEach((log) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(log.date).toLocaleString()}</td>
      <td>${log.mechanic}</td>
      <td>${log.customerName}</td>
      <td>${log.vehiclePlate}</td>
      <td>${log.vehicleModel}</td>
      <td>${log.repairDetails}</td>
      <td>${log.partsUsed}</td>
      <td>$${log.price}</td>
    `;
    logsBody.appendChild(tr);
  });
}

// Auto-login if mechanic name stored
window.onload = () => {
  const storedMechanic = localStorage.getItem('currentMechanic');
  if (storedMechanic) {
    mechanicName = storedMechanic;
    showDashboard();
  }
};
