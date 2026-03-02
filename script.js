document.addEventListener("DOMContentLoaded", () => {
  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");
  const searchBtn = document.getElementById("searchBtn");
  const trainListings = document.querySelector(".train-listings");
  const trainResults = document.getElementById("trainResults");
  const searchSummary = document.getElementById("searchSummary");

  const bookingPage = document.getElementById("bookingPage");
  const bookingConfirmed = document.getElementById("bookingConfirmed");

  // Populate stations
  if (typeof stations !== "undefined" && fromSelect && toSelect) {
    stations.forEach(st => {
      const opt1 = document.createElement("option");
      opt1.value = st;
      opt1.textContent = st;
      fromSelect.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = st;
      opt2.textContent = st;
      toSelect.appendChild(opt2);
    });
  }

  // Search Trains
  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const from = fromSelect.value;
      const to = toSelect.value;
      const dateVal = document.getElementById("date").value;

      if (!from || !to || !dateVal) {
        alert("Please select From, To and Date!");
        return;
      }

      searchSummary.textContent = `Searching trains from ${from} to ${to} on ${dateVal} for 1 passenger(s).`;

      trainResults.innerHTML = "";
      trainListings.classList.remove("hidden");
      bookingPage.classList.add("hidden");
      bookingConfirmed.classList.add("hidden");

      for (let i = 0; i < 3; i++) {
        const trainNo = Math.floor(12000 + Math.random() * 1000);
        const price = 500 + Math.floor(Math.random() * 2000);
        const depHour = 5 + Math.floor(Math.random() * 15);
        const depMin = Math.floor(Math.random() * 60).toString().padStart(2, "0");
        const arrHour = depHour + 5 + Math.floor(Math.random() * 5);
        const arrMin = depMin;

        const card = document.createElement("div");
        card.className = "train-card";
        card.setAttribute("data-train", `Express (${trainNo})`);
        card.setAttribute("data-route", `${from} → ${to}`);
        card.setAttribute("data-departure", `${depHour}:${depMin}`);
        card.setAttribute("data-price", price);

        card.innerHTML = `
          <div class="train-header">
            <div class="train-info">
              <h3>Express (${trainNo})</h3>
              <span class="train-number">${from} → ${to}</span>
            </div>
            <div class="train-price">
              <span class="price">₹${price}</span>
              <span class="class">Sleeper</span>
            </div>
          </div>
          <div class="train-details">
            <div class="time-info">
              <div class="departure">
                <span class="time">${depHour}:${depMin}</span>
                <span class="station">${from}</span>
              </div>
              <div class="duration">
                <span class="travel-time">~${arrHour - depHour}h</span>
                <div class="route-line"></div>
              </div>
              <div class="arrival">
                <span class="time">${arrHour}:${arrMin}</span>
                <span class="station">${to}</span>
              </div>
            </div>
          </div>
          <div class="train-footer">
            <span class="available">Available</span>
            <button class="btn btn-book">Book Now</button>
          </div>
        `;

        // Book Now event
        card.querySelector(".btn-book").addEventListener("click", () => {
          openBooking(card);
        });

        trainResults.appendChild(card);
      }

      trainListings.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Booking Page
  function openBooking(card) {
    trainListings.classList.add("hidden");
    bookingPage.classList.remove("hidden");
    bookingConfirmed.classList.add("hidden");

    const train = card.getAttribute("data-train");
    const route = card.getAttribute("data-route");
    const departure = card.getAttribute("data-departure");
    const price = card.getAttribute("data-price");

    document.getElementById("summaryTrain").textContent = train;
    document.getElementById("summaryRoute").textContent = route;
    document.getElementById("summaryDeparture").textContent = departure;
    document.getElementById("summaryPrice").textContent = `₹${price}`;
    document.getElementById("summaryTotal").textContent = `₹${price}`;
    document.getElementById("summaryPassengers").textContent = "1";

    document.getElementById("passengerFields").innerHTML = `
      <div class="passenger-row" style="display:flex; gap:1rem; margin-bottom:1rem;">
        <input type="text" name="name[]" placeholder="Full Name" required style="flex:2;">
        <input type="number" name="age[]" placeholder="Age" min="0" required style="width:80px;">
        <input type="tel" name="phone[]" placeholder="Contact No." required style="width:150px;">
        <select name="gender[]" required style="width:120px;">
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
    `;
  }

  // Add Passenger
  const addPassengerBtn = document.getElementById("addPassengerBtn");
  if (addPassengerBtn) {
    addPassengerBtn.addEventListener("click", () => {
      const row = document.createElement("div");
      row.className = "passenger-row";
      row.style.display = "flex";
      row.style.gap = "1rem";
      row.style.marginBottom = "1rem";
      row.innerHTML = `
        <input type="text" name="name[]" placeholder="Full Name" required style="flex:2;">
        <input type="number" name="age[]" placeholder="Age" min="0" required style="width:80px;">
        <input type="tel" name="phone[]" placeholder="Contact No." required style="width:150px;">
        <select name="gender[]" required style="width:120px;">
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      `;
      document.getElementById("passengerFields").appendChild(row);
      updateSummary();
    });
  }

  // Update Summary
  function updateSummary() {
    const count = document.querySelectorAll("#passengerFields .passenger-row").length;
    document.getElementById("summaryPassengers").textContent = count;

    const price = parseInt(document.getElementById("summaryPrice").textContent.replace(/[^\d]/g, ""));
    const total = price * count;

    document.getElementById("summaryTotal").textContent = `₹${total}`;
  }

  // Confirm Booking
  const passengerForm = document.getElementById("passengerForm");
  if (passengerForm) {
    passengerForm.addEventListener("input", updateSummary);

    passengerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      bookingPage.classList.add("hidden");
      bookingConfirmed.classList.remove("hidden");

      // Booking ID + details
      const bookingId = Date.now();
      const train = document.getElementById("summaryTrain").textContent;
      const route = document.getElementById("summaryRoute").textContent;
      const dep = document.getElementById("summaryDeparture").textContent;
      const total = document.getElementById("summaryTotal").textContent;
      const journeyDate = document.getElementById("date").value;

      // Fill confirmation section
      document.getElementById("bookingId").textContent = bookingId;
      document.getElementById("confirmedTrain").textContent = train;
      document.getElementById("confirmedRoute").textContent = route;
      document.getElementById("confirmedDate").textContent = journeyDate;
      document.getElementById("confirmedTotal").textContent = total;

      // Passenger details
      const passengers = document.querySelectorAll("#passengerFields .passenger-row");
      const passengerDiv = document.getElementById("confirmedPassengers");
      passengerDiv.innerHTML = "";

      passengers.forEach((row, index) => {
        const name = row.querySelector("input[name='name[]']").value;
        const age = row.querySelector("input[name='age[]']").value;
        const phone = row.querySelector("input[name='phone[]']").value;
        const gender = row.querySelector("select[name='gender[]']").value;
        const seat = "S" + (60 + index); // example seat numbers

        passengerDiv.innerHTML += `
          <p>${name}, ${age} years, ${gender}, Phone: ${phone}, Seat: ${seat}</p>
        `;
      });
    });
  }
});

// === Send booking to FastAPI ===
const bookingData = {
  from: route.split(" → ")[0],
  to: route.split(" → ")[1],
  date: journeyDate,
  train_name: train.split("(")[0].trim(),
  train_number: train.match(/\((.*?)\)/)[1],
  departure_time: dep,
  price: parseInt(total.replace(/[^\d]/g, "")),
  total: parseInt(total.replace(/[^\d]/g, "")),
  passengers: Array.from(passengers).map(row => ({
    name: row.querySelector("input[name='name[]']").value,
    age: parseInt(row.querySelector("input[name='age[]']").value),
    phone: row.querySelector("input[name='phone[]']").value,
    gender: row.querySelector("select[name='gender[]']").value
  }))
};

fetch("http://localhost:8000/book", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(bookingData)
})
  .then(res => res.json())
  .then(data => console.log("✅ Booking saved:", data))
  .catch(err => console.error("❌ Error saving booking:", err));

