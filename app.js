/* ===========================
   BloodLink – FINAL app.js
=========================== */

const API = "https://blood-link-1.onrender.com";

/* ===========================
   STATE
=========================== */

const state = {
  donors: [],
  banks: [],
  stock: [],
  donations: [],
  requests: [],
  patients: [],
  emergency: []
};

/* ===========================
   NAVIGATION
=========================== */

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");
const pageTitle = document.getElementById("page-title");

navItems.forEach(item => {

  item.addEventListener("click", () => {

    const sectionId = item.dataset.section;

    if (!sectionId) return;

    navItems.forEach(n =>
      n.classList.remove("active")
    );

    sections.forEach(s =>
      s.classList.remove("active")
    );

    item.classList.add("active");

    const activeSection =
      document.getElementById(`section-${sectionId}`);

    if (activeSection) {
      activeSection.classList.add("active");
    }

    pageTitle.textContent =
      item.querySelector("span")?.textContent ||
      "Dashboard";

  });

});

/* ===========================
   SIDEBAR
=========================== */

function toggleSidebar() {

  document
    .getElementById("sidebar")
    ?.classList.toggle("active");

  document
    .getElementById("overlay")
    ?.classList.toggle("active");

}

function closeSidebar() {

  document
    .getElementById("sidebar")
    ?.classList.remove("active");

  document
    .getElementById("overlay")
    ?.classList.remove("active");

}

/* ===========================
   LOGOUT
=========================== */

function handleLogout() {

  sessionStorage.removeItem("bl_user");

  window.location.href = "login.html";

}

/* ===========================
   MODAL
=========================== */

function openModal(id) {
  document.getElementById(id)?.classList.add("active");
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove("active");
}

/* ===========================
   TOAST
=========================== */

function showToast(message, type = "success") {

  const toast =
    document.getElementById("toast");

  if (!toast) return;

  toast.innerHTML = message;

  toast.className =
    `toast show ${type}`;

  setTimeout(() => {

    toast.className = "toast";

  }, 3000);

}

/* ===========================
   FILTER TABLE
=========================== */

function filterTable(tableId, value) {

  const filter =
    value.toLowerCase();

  const rows =
    document.querySelectorAll(`#${tableId} tbody tr`);

  rows.forEach(row => {

    const text =
      row.innerText.toLowerCase();

    row.style.display =
      text.includes(filter) ? "" : "none";

  });

}

/* ===========================
   DASHBOARD
=========================== */

function updateDashboard() {

  document.getElementById("s-donors").innerText =
    state.donors.length;

  document.getElementById("s-banks").innerText =
    state.banks.length;

  let totalStock = 0;

  state.stock.forEach(item => {

    totalStock += Number(item.quantity || 0);

  });

  document.getElementById("s-stock").innerText =
    totalStock;

  document.getElementById("s-donations").innerText =
    state.donations.length;

  document.getElementById("s-requests").innerText =
    state.requests.length;

  document.getElementById("s-patients").innerText =
    state.patients.length;

  renderBloodChart();

  renderRecentActivity();

  renderCriticalRequests();

}

/* ===========================
   BLOOD CHART
=========================== */

function renderBloodChart() {

  const chart =
    document.getElementById("blood-chart");

  if (!chart) return;

  const groups = {
    "A+": 0,
    "A-": 0,
    "B+": 0,
    "B-": 0,
    "AB+": 0,
    "AB-": 0,
    "O+": 0,
    "O-": 0
  };

  state.donors.forEach(d => {

    if (groups[d.blood_group] !== undefined) {
      groups[d.blood_group]++;
    }

  });

  chart.innerHTML =
    Object.entries(groups)
      .map(([bg, count]) => `
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between">
            <strong>${bg}</strong>
            <span>${count}</span>
          </div>
          <div style="height:10px;background:#eee;border-radius:10px;overflow:hidden">
            <div style="
              height:100%;
              width:${count * 10}%;
              background:#dc2626;
            "></div>
          </div>
        </div>
      `)
      .join("");

}

/* ===========================
   RECENT ACTIVITY
=========================== */

function renderRecentActivity() {

  const list =
    document.getElementById("activity-list");

  if (!list) return;

  const activities = [];

  state.donors.slice(-3).forEach(d => {
    activities.push(`🩸 Donor ${d.name} added`);
  });

  state.requests.slice(-3).forEach(r => {
    activities.push(`📋 Request ${r.id} created`);
  });

  state.donations.slice(-3).forEach(d => {
    activities.push(`❤️ Donation ${d.id} recorded`);
  });

  if (activities.length === 0) {

    list.innerHTML = `
      <li class="empty-state">
        No recent activity
      </li>
    `;

    return;
  }

  list.innerHTML =
    activities.reverse()
      .map(a => `<li>${a}</li>`)
      .join("");

}

/* ===========================
   CRITICAL REQUESTS
=========================== */

function renderCriticalRequests() {

  const list =
    document.getElementById("critical-list");

  if (!list) return;

  const critical =
    state.requests.filter(r =>
      r.priority === "Critical"
    );

  if (critical.length === 0) {

    list.innerHTML = `
      <li class="empty-state">
        No critical requests
      </li>
    `;

    return;
  }

  list.innerHTML =
    critical.map(r => `
      <li>
        🚨 ${r.id} - ${r.blood_group}
      </li>
    `).join("");

}

/* =========================================================
   DONORS
========================================================= */

async function saveDonor(e) {

  e.preventDefault();

  const donor = {
    id: document.getElementById("d-id").value,
    name: document.getElementById("d-name").value,
    age: document.getElementById("d-age").value,
    gender: document.getElementById("d-gender").value,
    blood_group: document.getElementById("d-bg").value,
    last_donation: document.getElementById("d-last").value,
    eligibility: document.getElementById("d-eligibility").value
  };

  try {

    await fetch(`${API}/donors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(donor)
    });

    showToast("Donor Added");

    closeModal("donor-modal");

    loadDonors();

  } catch (err) {

    console.log(err);

    showToast("Failed", "error");

  }

}

async function loadDonors() {

  try {

    const res =
      await fetch(`${API}/donors`);

    const data =
      await res.json();

    state.donors =
      Array.isArray(data) ? data : [];

    renderDonors();

    updateDashboard();

  } catch (err) {

    console.log(err);

  }

}

function renderDonors() {

  const tbody =
    document.getElementById("donors-tbody");

  if (!tbody) return;

  if (state.donors.length === 0) {

    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="no-data">
          No donors yet
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML =
    state.donors.map(d => `
      <tr>
        <td>${d.id}</td>
        <td>${d.name}</td>
        <td>${d.age}</td>
        <td>${d.gender}</td>
        <td>${d.blood_group}</td>
        <td>${d.last_donation || "-"}</td>
        <td>${d.eligibility || "-"}</td>
        <td>
          <button class="btn-danger"
            onclick="deleteDonor('${d.id}')">
            Delete
          </button>
        </td>
      </tr>
    `).join("");

}

async function deleteDonor(id) {

  try {

    await fetch(`${API}/donors/${id}`, {
      method: "DELETE"
    });

    showToast("Donor Deleted");

    loadDonors();

  } catch (err) {

    console.log(err);

  }

}

/* =========================================================
   BLOOD BANKS
========================================================= */

async function saveBank(e) {

  e.preventDefault();

  const bank = {
    id: document.getElementById("b-id").value,
    name: document.getElementById("b-name").value,
    location: document.getElementById("b-location").value,
    contact: document.getElementById("b-contact").value
  };

  try {

    await fetch(`${API}/banks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bank)
    });

    showToast("Bank Added");

    closeModal("bank-modal");

    loadBanks();

  } catch (err) {

    console.log(err);

  }

}

async function loadBanks() {

  try {

    const res =
      await fetch(`${API}/banks`);

    state.banks =
      await res.json();

    renderBanks();

    updateDashboard();

  } catch (err) {

    console.log(err);

  }

}

function renderBanks() {

  const tbody =
    document.getElementById("banks-tbody");

  if (!tbody) return;

  tbody.innerHTML =
    state.banks.map(b => `
      <tr>
        <td>${b.id}</td>
        <td>${b.name}</td>
        <td>${b.location}</td>
        <td>${b.contact}</td>
      </tr>
    `).join("");

}

/* =========================================================
   STOCK
========================================================= */

async function saveStock(e) {

  e.preventDefault();

  const stock = {
    id: document.getElementById("s-id").value,
    bank_id: document.getElementById("s-bank").value,
    blood_group: document.getElementById("s-bg").value,
    quantity: document.getElementById("s-qty").value,
    expiry_date: document.getElementById("s-expiry").value
  };

  try {

    await fetch(`${API}/stock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(stock)
    });

    showToast("Stock Added");

    closeModal("stock-modal");

    loadStock();

  } catch (err) {

    console.log(err);

  }

}

async function loadStock() {

  try {

    const res =
      await fetch(`${API}/stock`);

    state.stock =
      await res.json();

    renderStock();

    updateDashboard();

  } catch (err) {

    console.log(err);

  }

}

function renderStock() {

  const tbody =
    document.getElementById("stock-tbody");

  if (!tbody) return;

  tbody.innerHTML =
    state.stock.map(s => `
      <tr>
        <td>${s.id}</td>
        <td>${s.bank_id}</td>
        <td>${s.blood_group}</td>
        <td>${s.quantity}</td>
        <td>${s.expiry_date}</td>
        <td>${s.last_updated || "-"}</td>
      </tr>
    `).join("");

}

/* =========================================================
   DONATIONS
========================================================= */

async function saveDonation(e) {

  e.preventDefault();

  const donation = {
    id: document.getElementById("dn-id").value,
    donor_id: document.getElementById("dn-donor").value,
    bank_id: document.getElementById("dn-bank").value,
    quantity: document.getElementById("dn-qty").value,
    donation_date: document.getElementById("dn-date").value
  };

  try {

    await fetch(`${API}/donations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(donation)
    });

    showToast("Donation Added");

    closeModal("donation-modal");

    loadDonations();

  } catch (err) {

    console.log(err);

  }

}

async function loadDonations() {

  try {

    const res =
      await fetch(`${API}/donations`);

    state.donations =
      await res.json();

    renderDonations();

    updateDashboard();

  } catch (err) {

    console.log(err);

  }

}

function renderDonations() {

  const tbody =
    document.getElementById("donations-tbody");

  if (!tbody) return;

  tbody.innerHTML =
    state.donations.map(d => `
      <tr>
        <td>${d.id}</td>
        <td>${d.donor_id}</td>
        <td>${d.bank_id}</td>
        <td>${d.donation_date}</td>
        <td>${d.quantity}</td>
      </tr>
    `).join("");

}

/* =========================================================
   REQUESTS
========================================================= */

async function saveRequest(e) {

  e.preventDefault();

  const request = {
    id: document.getElementById("r-id").value,
    patient_id: document.getElementById("r-patient").value,
    blood_group: document.getElementById("r-bg").value,
    quantity: document.getElementById("r-qty").value,
    bank_id: document.getElementById("r-bank").value,
    priority: document.getElementById("r-priority").value,
    status: document.getElementById("r-status").value,
    request_date: document.getElementById("r-date").value
  };

  try {

    await fetch(`${API}/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });

    showToast("Request Added");

    closeModal("request-modal");

    loadRequests();
    loadNotifications();

  } catch (err) {

    console.log(err);

  }

}

async function loadRequests() {

  try {

    const res =
      await fetch(`${API}/requests`);

    state.requests =
      await res.json();

    renderRequests();

    updateDashboard();

  } catch (err) {

    console.log(err);

  }

}

function renderRequests() {

  const tbody =
    document.getElementById("requests-tbody");

  if (!tbody) return;

  tbody.innerHTML =
    state.requests.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.patient_id}</td>
        <td>${r.blood_group}</td>
        <td>${r.quantity}</td>
        <td>${r.bank_id}</td>
        <td>${r.priority}</td>
        <td>${r.status}</td>
        <td>${r.request_date || "-"}</td>
      </tr>
    `).join("");

}

/* =========================================================
   PATIENTS
========================================================= */

async function savePatient(e) {

  e.preventDefault();

  const patient = {
    id: document.getElementById("p-id").value,
    name: document.getElementById("p-name").value,
    age: document.getElementById("p-age").value,
    gender: document.getElementById("p-gender").value,
    blood_group: document.getElementById("p-bg").value,
    disease: document.getElementById("p-disease").value
  };

  try {

    await fetch(`${API}/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(patient)
    });

    showToast("Patient Added");

    closeModal("patient-modal");

    loadPatients();

  } catch (err) {

    console.log(err);

  }

}

async function loadPatients() {

  try {

    const res =
      await fetch(`${API}/patients`);

    state.patients =
      await res.json();

    renderPatients();

    updateDashboard();

  } catch (err) {

    console.log(err);

  }

}

function renderPatients() {

  const tbody =
    document.getElementById("patients-tbody");

  if (!tbody) return;

  tbody.innerHTML =
    state.patients.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.age}</td>
        <td>${p.gender}</td>
        <td>${p.blood_group}</td>
        <td>${p.disease}</td>
      </tr>
    `).join("");

}

/* =========================================================
   EMERGENCY TIMER
========================================================= */

async function saveEmergency(e) {

  e.preventDefault();

  const deadline =
    document.getElementById("em-deadline-date").value +
    " " +
    document.getElementById("em-deadline-time").value +
    ":00";

  const emergency = {
    id: document.getElementById("em-id").value,
    patient_id: document.getElementById("em-patient").value,
    blood_group: document.getElementById("em-bg").value,
    units: document.getElementById("em-qty").value,
    hospital: document.getElementById("em-hospital").value,
    contact: document.getElementById("em-contact").value,
    status: document.getElementById("em-status").value,
    notes: document.getElementById("em-notes").value,
    deadline: deadline
  };

  try {

    await fetch(`${API}/emergency`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emergency)
    });

    showToast("Emergency Request Added");

    closeModal("emergency-modal");

    loadEmergency();

  } catch (err) {

    console.log(err);

    showToast("Failed to save", "error");

  }

}

async function loadEmergency() {

  try {

    const res =
      await fetch(`${API}/emergency`);

    const data =
      await res.json();

    state.emergency =
      Array.isArray(data) ? data : [];

    renderEmergency();

  } catch (err) {

    console.log(err);

  }

}

function renderEmergency() {

  const tbody =
    document.getElementById("emergency-tbody");

  if (!tbody) return;

  if (state.emergency.length === 0) {

    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="no-data">
          No emergency requests yet
        </td>
      </tr>
    `;

    return;
  }

  let critical = 0;
  let urgent = 0;
  let moderate = 0;
  let stable = 0;

  tbody.innerHTML = state.emergency.map(item => {

    let remaining = 0;

    if (item.remaining_seconds !== undefined) {
      remaining = item.remaining_seconds;
    } else {

      const now =
        new Date().getTime();

      const end =
        new Date(item.deadline).getTime();

      remaining =
        Math.floor((end - now) / 1000);
    }

    let urgency = "Stable";
    let urgencyClass = "stable";

    if (remaining <= 3600) {

      urgency = "Critical";
      urgencyClass = "critical";
      critical++;

    } else if (remaining <= 14400) {

      urgency = "Urgent";
      urgencyClass = "urgent";
      urgent++;

    } else if (remaining <= 43200) {

      urgency = "Moderate";
      urgencyClass = "moderate";
      moderate++;

    } else {

      stable++;

    }

    const hours =
      Math.max(0, Math.floor(remaining / 3600));

    const minutes =
      Math.max(0, Math.floor((remaining % 3600) / 60));

    return `
      <tr>
        <td>${item.id}</td>
        <td>${item.patient_id}</td>
        <td>${item.blood_group}</td>
        <td>${item.hospital}</td>
        <td>${item.units}</td>
        <td>${item.deadline || "-"}</td>
        <td>${hours}h ${minutes}m</td>
        <td>
          <span class="badge ${urgencyClass}">
            ${urgency}
          </span>
        </td>
        <td>${item.status}</td>
        <td>
          <button onclick="deleteEmergency('${item.id}')">
            Delete
          </button>
        </td>
      </tr>
    `;

  }).join("");

  document.getElementById("em-stat-critical").innerText =
    critical;

  document.getElementById("em-stat-urgent").innerText =
    urgent;

  document.getElementById("em-stat-moderate").innerText =
    moderate;

  document.getElementById("em-stat-stable").innerText =
    stable;

}

async function deleteEmergency(id) {

  try {

    await fetch(`${API}/emergency/${id}`, {
      method: "DELETE"
    });

    showToast("Emergency Deleted");

    loadEmergency();

  } catch (err) {

    console.log(err);

  }

}

/* =========================================================
   NOTIFICATIONS
========================================================= */

let notifications = [];

// Open / Close Notification
function toggleNotifications() {

  const dropdown =
    document.getElementById(
      "notificationDropdown"
    );

  if (dropdown.style.display === "block") {

    dropdown.style.display = "none";

  } else {

    dropdown.style.display = "block";

  }

}

// Add Single Notification
function addNotification(message) {

  notifications.unshift({
    message: message,
    time: new Date().toLocaleTimeString()
  });

  renderNotifications();

}

// Clear Notifications
function clearNotifications() {

  notifications = [];

  renderNotifications();

  showToast("Notifications Cleared");

}

// Load Notifications
function loadNotifications() {

  notifications = [];

  // Blood Requests
  state.requests.forEach(r => {

    notifications.push({
      message:
        `Blood Request Added (${r.blood_group})`,
      time: new Date().toLocaleTimeString()
    });

  });

  // Emergency Requests
  state.emergency.forEach(e => {

    notifications.push({
      message:
        `Emergency Request (${e.blood_group})`,
      time: new Date().toLocaleTimeString()
    });

  });

  renderNotifications();

}

// Render Notifications
function renderNotifications() {

  const list =
    document.getElementById(
      "notificationList"
    );

  if (!list) return;

  list.innerHTML = "";

  // Empty State
  if (notifications.length === 0) {

    list.innerHTML = `
      <li class="empty-state">
        No notifications
      </li>
    `;

  } else {

    notifications.forEach((n) => {

      const li =
        document.createElement("li");

      li.innerHTML = `
        🔔 ${n.message}
        <br>
        <small>${n.time}</small>
      `;

      list.appendChild(li);

    });

  }

  // Update Count
  document.getElementById(
    "notificationCount"
  ).innerText = notifications.length;

}

/* =========================================================
   INITIAL LOAD
========================================================= */

window.onload = async () => {

  await loadDonors();

  await loadBanks();

  await loadStock();

  await loadDonations();

  await loadRequests();

  await loadPatients();

  await loadEmergency();

  // Load notifications AFTER data loads
  loadNotifications();

};