// 1. REQUEST PERMISSION FOR NOTIFICATIONS
if ("Notification" in window) {
  if (
    Notification.permission !== "granted" &&
    Notification.permission !== "denied"
  ) {
    Notification.requestPermission().then((permission) => {
      console.log("Status notifikacija:", permission);
    });
  }
}

// 2. DICTIONARY WITH TRANSLATIONS (i18n)
const translations = {
  sr: {
    mainTitle: "Pratilac suplemenata",
    lblName: "Naziv",
    lblDosage: "Doza",
    lblTime: "Vreme",
    addBtn: "Dodaj",
    listTitle: "Moji suplementi",
    waterTitle: "Podsetnik za vodu 💧",
    waterSuffix: "čaša",
    addWater: "Dodaj čašu",
    resetWater: "Resetuj",
    placeholderName: "npr. Koenzim Q10",
    placeholderDosage: "npr. 100 mg",
    fillFields: "Molimo popunite sva polja",
  },
  en: {
    mainTitle: "Supplement Tracker",
    lblName: "Name",
    lblDosage: "Dosage",
    lblTime: "Time",
    addBtn: "Add",
    listTitle: "My Supplements",
    waterTitle: "Water Reminder 💧",
    waterSuffix: "glasses",
    addWater: "Add Glass",
    resetWater: "Reset",
    placeholderName: "e.g. Coenzyme Q10",
    placeholderDosage: "e.g. 100 mg",
    fillFields: "Please fill in all fields",
  },
};

// 3. GLOBAL APPLICATION STATE (Data)
let currentLang = "sr";
let supplements = JSON.parse(localStorage.getItem("mySupplements")) || [];
let waterCount = parseInt(localStorage.getItem("myWater")) || 0;

// 4. ELEMENT SELECTORS
const mainTitle = document.getElementById("main-title");
const lblName = document.getElementById("lbl-name");
const lblDosage = document.getElementById("lbl-dosage");
const lblTime = document.getElementById("lbl-time");
const addBtn = document.getElementById("add-btn");
const listTitle = document.getElementById("list-title");
const waterTitle = document.getElementById("water-title");
const addWaterBtn = document.getElementById("add-water");
const resetWaterBtn = document.getElementById("reset-water");
const inputName = document.getElementById("input-name");
const inputDosage = document.getElementById("input-dosage");
const inputTime = document.getElementById("input-time");
const supplementList = document.getElementById("supplement-list");
const waterCountDisplay = document.getElementById("water-count");

// 5. FUNCTIONS FOR LOGIC AND DISPLAY

// Function for changing language
function setLanguage(lang) {
  currentLang = lang;

  // Updating all texts from the dictionary
  mainTitle.textContent = translations[lang].mainTitle;
  lblName.textContent = translations[lang].lblName;
  lblDosage.textContent = translations[lang].lblDosage;
  lblTime.textContent = translations[lang].lblTime;
  addBtn.textContent = translations[lang].addBtn;
  listTitle.textContent = translations[lang].listTitle;
  waterTitle.textContent = translations[lang].waterTitle;
  addWaterBtn.textContent = translations[lang].addWater;
  resetWaterBtn.textContent = translations[lang].resetWater;
  inputName.placeholder = translations[lang].placeholderName;
  inputDosage.placeholder = translations[lang].placeholderDosage;

  // Activating button in the header
  document.getElementById("btn-sr").classList.toggle("active", lang === "sr");
  document.getElementById("btn-en").classList.toggle("active", lang === "en");

  // Refresh water display because the suffix (čaša/glasses) has changed
  updateWaterUI();
}

// Save to browser memory
function saveData() {
  localStorage.setItem("mySupplements", JSON.stringify(supplements));
  localStorage.setItem("myWater", waterCount);
}

// Drawing cards on screen
function renderSupplements() {
  supplementList.innerHTML = "";
  supplements.forEach((sup) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
            <div>
                <strong>${sup.name}</strong><br>
                <span>${sup.dosage} - ${sup.time}</span>
            </div>
            <button onclick="deleteSupplement(${sup.id})" class="delete-btn">×</button>
        `;
    supplementList.appendChild(card);
  });
}

// Deleting a supplement
function deleteSupplement(id) {
  supplements = supplements.filter((sup) => sup.id !== id);
  saveData();
  renderSupplements();
}

// FUNCTION FOR SENDING NOTIFICATION
function sendReminder(name, dose) {
  if (Notification.permission === "granted") {
    new Notification("Vreme je za suplement! 💊", {
      body: `Uzmi svoj ${name} (${dose})`,
      icon: "https://cdn-icons-png.flaticon.com/512/822/822143.png",
    });
  }
}

// Update water display with dynamic translation
function updateWaterUI() {
  // Goal of 10 glasses is a fixed reference, but suffix is bilingual
  waterCountDisplay.textContent = `${waterCount} / 10 ${translations[currentLang].waterSuffix}`;
}

// Adding new supplement
function addSupplement() {
  const name = inputName.value;
  const dosage = inputDosage.value;
  const time = inputTime.value;

  if (name === "" || dosage === "" || time === "") {
    alert(translations[currentLang].fillFields);
    return;
  }

  const newSupplement = {
    id: Date.now(),
    name: name,
    dosage: dosage,
    time: time,
  };

  supplements.push(newSupplement);
  saveData();
  renderSupplements();

  // Reset fields after input
  inputName.value = "";
  inputDosage.value = "";
  inputTime.value = "";
}

// 6. EVENT LISTENERS
document
  .getElementById("btn-sr")
  .addEventListener("click", () => setLanguage("sr"));
document
  .getElementById("btn-en")
  .addEventListener("click", () => setLanguage("en"));

addBtn.addEventListener("click", addSupplement);

addWaterBtn.addEventListener("click", () => {
  if (waterCount < 20) {
    waterCount++;
    saveData();
    updateWaterUI();
  }
});

resetWaterBtn.addEventListener("click", () => {
  waterCount = 0;
  saveData();
  updateWaterUI();
});

// 7. INITIALIZATION (Runs when page loads)
// This ensures the app starts with correct data and language
setLanguage(currentLang);
renderSupplements();
updateWaterUI();

// 8. CHECK ALARMS EVERY MINUTE
setInterval(() => {
  const now = new Date();
  // Extract hours and minutes in "HH:MM" format
  const currentTime =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");
  supplements.forEach((s) => {
    if (s.time === currentTime) {
      sendReminder(s.name, s.dosage);
    }
  });
}, 60000); // 60 seconds
