/* MIYU'S LITTLE KITCHEN v2.0 */
/* State variables */

let isOn = true;
let portionSize = 20;
let foodLevel = 200;
let feedCount = 0;
let autoFeed = false;

let currentMinute = 11 * 60;
let currentDay = 1;
let lastAutoFeedDay = -1;

const maxFood = 300;
const lowFoodThreshold = 40;
const $ = id => document.getElementById(id);

/* PIXEL MIYU — generated with SVG pixels */

function createMiyu(mood = "normal") {
  const pixels = [];
  const add = (x, y, w, h, color) => {
    pixels.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`
    );
  };

  const outline = "#77627e";
  const fur = "#c3b3d0";
  const light = "#e7d8dc";
  const gold = "#e7cba1";
  const blush = "#eaa9bc";

  // Tail behind body
  add(34, 24, 4, 12, outline);
  add(38, 21, 5, 5, outline);
  add(40, 18, 5, 5, fur);

  // Curly body
  add(13, 23, 24, 14, outline);
  add(15, 24, 20, 11, fur);
  add(17, 27, 5, 5, light);
  add(26, 27, 6, 5, gold);

  // Ears
  add(10, 6, 9, 12, outline);
  add(29, 6, 9, 12, outline);
  add(12, 9, 5, 7, blush);
  add(31, 9, 5, 7, blush);

  // Head and fluffy cheeks
  add(8, 14, 32, 17, outline);
  add(10, 15, 28, 14, fur);
  add(7, 19, 5, 7, fur);
  add(36, 19, 5, 7, fur);

  // Gold gradient patches
  add(11, 16, 8, 5, gold);
  add(29, 16, 8, 5, gold);
  add(18, 25, 12, 4, light);

  // Curly fur pixels
  [[10,15],[15,12],[21,13],[27,12],[34,15],
   [8,23],[38,23],[13,29],[32,29]].forEach(([x,y],i) => {
    add(x,y,3,3,i%2 ? light : gold);
  });

  // Eyes and expressions
  if (mood === "happy") {
    add(15,21,3,2,outline);
    add(18,19,2,2,outline);
    add(28,19,2,2,outline);
    add(30,21,3,2,outline);
    add(22,25,5,3,blush);
  } else if (mood === "sad") {
    add(15,20,4,3,outline);
    add(29,20,4,3,outline);
    add(23,26,4,2,outline);
    add(32,24,2,4,"#8ec7df");
  } else if (mood === "sleep") {
    add(15,21,5,2,outline);
    add(28,21,5,2,outline);
    add(22,25,5,2,outline);
  } else {
    add(16,20,3,4,outline);
    add(29,20,3,4,outline);
    add(23,24,3,2,blush);
    add(21,27,2,1,outline);
    add(26,27,2,1,outline);
  }

  // Rosy cheeks and paws
  add(11,24,4,2,blush);
  add(34,24,4,2,blush);
  add(16,34,7,5,outline);
  add(26,34,7,5,outline);
  add(17,34,5,3,light);
  add(27,34,5,3,light);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 42" shape-rendering="crispEdges">
    ${pixels.join("")}
  </svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function setMood(mood) {
  $("pixelCat").style.backgroundImage = createMiyu(mood);
  $("mood").textContent = {
    normal: "♡ HAPPY ♡",
    happy: "♡ YUMMY! ♡",
    sad: "♡ OH NO... ♡",
    sleep: "♡ ZZZ... ♡"
  }[mood];

  $("screen").classList.toggle("sad", mood === "sad");
}

function showMessage(text) {
  $("message").textContent = text;
}

function formatTime(total) {
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return String(hour).padStart(2, "0") + ":" +
    String(minute).padStart(2, "0");
}

function updateDisplay() {
  $("food").textContent = foodLevel + "g";
  $("portion").textContent = portionSize + "g";
  $("feeds").textContent = feedCount;

  $("bar").style.width =
    (foodLevel / maxFood * 100) + "%";

  $("powerStatus").textContent =
    isOn ? "● ONLINE" : "○ OFFLINE";

  $("powerBtn").textContent =
    isOn ? "⏻ Turn OFF" : "⏻ Turn ON";

  $("screen").classList.toggle("off", !isOn);

  $("status").textContent =
    isOn ? "READY TO EAT ♡" : "POWER OFF";

  $("warning").textContent =
    foodLevel < lowFoodThreshold
      ? "⚠ LOW FOOD! Please refill."
      : "";

  $("clock").textContent = formatTime(currentMinute);

  document.querySelectorAll(".portionBtn").forEach(btn => {
    btn.classList.toggle(
      "selected",
      Number(btn.dataset.size) === portionSize
    );
  });

  // Settings remain editable when power is off,
  // but feeding requires the device to be on.
}

function addHistory(source, grams) {
  const li = document.createElement("li");
  li.textContent =
    `Day ${currentDay} · ${formatTime(currentMinute)} · ${source}: ${grams}g`;

  if (feedCount === 1) {
    $("history").innerHTML = "";
  }

  $("history").prepend(li);
}

function hearts() {
  const container = $("hearts");

  for (let i = 0; i < 7; i++) {
    const heart = document.createElement("span");
    heart.className = "float-heart";
    heart.textContent = ["♡", "♥", "✦"][i % 3];
    heart.style.left = (35 + i * 5) + "%";
    heart.style.top = (45 + (i % 3) * 5) + "%";
    heart.style.color = ["#d88faf", "#b89acb", "#e4b48d"][i % 3];
    container.appendChild(heart);

    heart.addEventListener("animationend", () => heart.remove());
  }
}

function feedMiyu(source = "Manual") {
  if (!isOn) {
    showMessage("Power is OFF! Turn me on ♡");
    setMood("sleep");
    return false;
  }

  if (foodLevel < portionSize) {
    showMessage("Oh no! Not enough food!");
    setMood("sad");
    return false;
  }

  foodLevel -= portionSize;
  feedCount++;

  addHistory(source, portionSize);
  showMessage("Yummy! Miyu has been fed ♡");
  setMood("happy");

  const screen = $("screen");
  const feeder = document.querySelector(".feeder");

  screen.classList.remove("happy");
  feeder.classList.remove("dispensing");

  void screen.offsetWidth;

  screen.classList.add("happy");
  feeder.classList.add("dispensing");

  hearts();
  updateDisplay();
  return true;
}

/* EVENT LISTENERS */

$("powerBtn").addEventListener("click", () => {
  isOn = !isOn;

  showMessage(isOn
    ? "Welcome back, Miyu!"
    : "Good night, Miyu ♡");

  setMood(isOn ? "normal" : "sleep");
  updateDisplay();
});

document.querySelectorAll(".portionBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    portionSize = Number(btn.dataset.size);
    showMessage("Portion set to " + portionSize + "g");
    updateDisplay();
  });
});

$("feedBtn").addEventListener("click", () => {
  feedMiyu("Manual");
});

$("auto").addEventListener("change", event => {
  autoFeed = event.target.checked;
  showMessage(autoFeed
    ? "Auto feeding enabled ♡"
    : "Auto feeding disabled.");
});

/* SIMULATION CLOCK: 30-minute increments */

$("advance").textContent = "+ 30 MIN";

$("advance").addEventListener("click", () => {
  const previousMinute = currentMinute;
  currentMinute += 30;

  if (currentMinute >= 1440) {
    currentMinute -= 1440;
    currentDay++;
  }

  const [hour, minute] = $("feedTime").value
    .split(":")
    .map(Number);

  const scheduledMinute = hour * 60 + minute;

  // Did the clock cross the scheduled time?
  const crossedSchedule =
    currentMinute >= previousMinute
      ? scheduledMinute > previousMinute &&
        scheduledMinute <= currentMinute
      : scheduledMinute > previousMinute ||
        scheduledMinute <= currentMinute;

  if (autoFeed &&
      crossedSchedule &&
      lastAutoFeedDay !== currentDay) {

    if (feedMiyu("Automatic")) {
      lastAutoFeedDay = currentDay;
    }

  } else {
    showMessage("Time advanced to " + formatTime(currentMinute));
  }

  updateDisplay();
});

$("refill").addEventListener("click", () => {
  foodLevel = maxFood;
  showMessage("Food tank refilled! ♡");
  setMood(isOn ? "normal" : "sleep");
  updateDisplay();
});

$("reset").addEventListener("click", () => {
  isOn = true;
  portionSize = 20;
  foodLevel = 200;
  feedCount = 0;
  autoFeed = false;
  currentMinute = 11 * 60;
  currentDay = 1;
  lastAutoFeedDay = -1;

  $("auto").checked = false;
  $("feedTime").value = "12:00";
  $("history").innerHTML = "<li>No feedings yet ♡</li>";

  $("screen").classList.remove("happy", "sad");
  document.querySelector(".feeder").classList.remove("dispensing");

  setMood("normal");
  showMessage("Simulation reset! Hello Miyu ♡");
  updateDisplay();
});

/* START APPLICATION */

setMood("normal");
updateDisplay();