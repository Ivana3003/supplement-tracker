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
    addTime: "Dodaj vreme",
    removeTime: "Ukloni vreme",
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
    addTime: "Add time",
    removeTime: "Remove time",
  },
};

// 3. GLOBAL APPLICATION STATE (Data)
let currentLang = "sr";
const loadStoredData = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
};

const storedSupplements = loadStoredData("mySupplements", []);
const normalizeSupplement = (supplement) => {
  if (!supplement || typeof supplement !== "object") return null;

  const legacyTimes =
    typeof supplement.time === "string" ? [supplement.time] : [];
  const times = Array.isArray(supplement.times)
    ? supplement.times
    : legacyTimes;
  const validTimes = [
    ...new Set(times.filter((time) => /^\d{2}:\d{2}$/.test(time))),
  ];
  const name = String(supplement.name || "").trim();
  const dosage = String(supplement.dosage || "").trim();

  if (!name || !dosage || validTimes.length === 0) return null;

  return {
    id: supplement.id ?? Date.now() + Math.random(),
    name,
    dosage,
    times: validTimes,
  };
};

let supplements = Array.isArray(storedSupplements)
  ? storedSupplements.map(normalizeSupplement).filter(Boolean)
  : [];
let draftTimes = [];
let editingId = null;
let supplementFilter = "";
let supplementSortMode = "name";
const storedWater = loadStoredData("myWater", 0);
let waterCount = Number.isFinite(Number(storedWater)) ? Number(storedWater) : 0;

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
const emptyState = document.getElementById("empty-state");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const waterCountDisplay = document.getElementById("water-count");
const addTimeBtn = document.getElementById("add-time-btn");
const selectedTimes = document.getElementById("selected-times");
const supplementSearch = document.getElementById("supplement-search");
const supplementSort = document.getElementById("supplement-sort");

// 5. FUNCTIONS FOR LOGIC AND DISPLAY

// Function for changing language
function setLanguage(lang) {
  currentLang = lang;

  cancelEditBtn.hidden = false;
  // Updating all texts from the dictionary
  mainTitle.textContent = translations[lang].mainTitle;
  lblName.textContent = translations[lang].lblName;
  lblDosage.textContent = translations[lang].lblDosage;
  lblTime.textContent = translations[lang].lblTime;
  addBtn.textContent = translations[lang].addBtn;
  listTitle.textContent = translations[lang].listTitle;
  waterTitle.textContent = translations[lang].waterTitle;
  addWaterBtn.textContent = translations[lang].addWater;
  cancelEditBtn.hidden = true;
  resetWaterBtn.textContent = translations[lang].resetWater;
  inputName.placeholder = translations[lang].placeholderName;
  inputDosage.placeholder = translations[lang].placeholderDosage;
  addTimeBtn.textContent = translations[lang].addTime;

  // Activating button in the header
  document.getElementById("btn-sr").classList.toggle("active", lang === "sr");
  document.getElementById("btn-en").classList.toggle("active", lang === "en");

  // Refresh water display because the suffix (čaša/glasses) has changed
  updateWaterUI();
}

// Save to browser memory
function saveData(nextSupplements = supplements, nextWaterCount = waterCount) {
  try {
    localStorage.setItem("mySupplements", JSON.stringify(nextSupplements));
    localStorage.setItem("myWater", String(nextWaterCount));
    return true;
  } catch {
    alert(
      currentLang === "sr"
        ? "Podaci nisu mogli biti sačuvani."
        : "Data could not be saved.",
    );
    return false;
  }
}

// Drawing cards on screen
function renderSupplements() {
  supplementList.innerHTML = "";
  const visibleSupplements = [...supplements]
    .filter((sup) =>
      `${sup.name} ${sup.dosage}`
        .toLowerCase()
        .includes(supplementFilter.toLowerCase()),
    )
    .sort((first, second) => {
      if (supplementSortMode === "time") {
        return first.times[0].localeCompare(second.times[0]);
      }
      if (supplementSortMode === "newest") return second.id - first.id;
      return first.name.localeCompare(second.name);
    });

  emptyState.hidden = visibleSupplements.length > 0;
  emptyState.textContent =
    currentLang === "sr"
      ? supplementFilter
        ? "Nema suplemenata koji odgovaraju pretrazi."
        : "Još nema dodatih suplemenata."
      : supplementFilter
        ? "No supplements match the search."
        : "No supplements have been added yet.";

  visibleSupplements.forEach((sup) => {
    const card = document.createElement("div");
    card.className = "card";
    const details = document.createElement("div");
    const name = document.createElement("strong");
    const metadata = document.createElement("span");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    name.textContent = sup.name;
    metadata.textContent = `${sup.dosage} - ${sup.times.join(", ")}`;
    editButton.type = "button";
    editButton.className = "edit-btn";
    editButton.textContent = currentLang === "sr" ? "Izmeni" : "Edit";
    editButton.addEventListener("click", () => startEditSupplement(sup.id));
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "×";
    deleteButton.setAttribute(
      "aria-label",
      currentLang === "sr" ? `Obriši ${sup.name}` : `Delete ${sup.name}`,
    );
    deleteButton.addEventListener("click", () => deleteSupplement(sup.id));

    details.append(name, document.createElement("br"), metadata);
    const actions = document.createElement("div");
    actions.className = "card-actions";
    actions.append(editButton, deleteButton);
    card.append(details, actions);
    supplementList.appendChild(card);
  });
}

function startEditSupplement(id) {
  const supplement = supplements.find((sup) => sup.id === id);
  if (!supplement) return;

  editingId = id;
  inputName.value = supplement.name;
  inputDosage.value = supplement.dosage;
  inputTime.value = "";
  draftTimes = [...supplement.times];
  renderSelectedTimes();
  addBtn.textContent = currentLang === "sr" ? "Sačuvaj" : "Save";
  cancelEditBtn.hidden = false;
  inputName.focus();
}

function cancelEditSupplement() {
  editingId = null;
  draftTimes = [];
  inputName.value = "";
  inputDosage.value = "";
  inputTime.value = "";
  addBtn.textContent = translations[currentLang].addBtn;
  cancelEditBtn.hidden = true;
  renderSelectedTimes();
}

// Deleting a supplement
function deleteSupplement(id) {
  const nextSupplements = supplements.filter((sup) => sup.id !== id);
  if (saveData(nextSupplements)) {
    supplements = nextSupplements;
    renderSupplements();
  }
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
  const name = inputName.value.trim();
  const dosage = inputDosage.value.trim();
  const times = [...draftTimes];
  if (inputTime.value && !times.includes(inputTime.value)) {
    times.push(inputTime.value);
  }

  if (name === "" || dosage === "" || times.length === 0) {
    alert(translations[currentLang].fillFields);
    return;
  }

  const duplicate = supplements.some(
    (sup) =>
      sup.name.toLowerCase() === name.toLowerCase() && sup.id !== editingId,
  );

  if (duplicate) {
    alert(
      currentLang === "sr"
        ? "Ovaj suplement već postoji."
        : "This supplement already exists.",
    );
    return;
  }

  const nextSupplements = editingId
    ? supplements.map((supplement) =>
        supplement.id === editingId
          ? { ...supplement, name, dosage, times }
          : supplement,
      )
    : [...supplements, { id: Date.now(), name, dosage, times }];

  if (!saveData(nextSupplements)) return;
  supplements = nextSupplements;
  renderSupplements();

  // Reset fields after input
  inputName.value = "";
  inputDosage.value = "";
  inputTime.value = "";
  draftTimes = [];
  editingId = null;
  cancelEditBtn.hidden = true;
  addBtn.textContent = translations[currentLang].addBtn;
  renderSelectedTimes();
}

// 6. EVENT LISTENERS
document
  .getElementById("btn-sr")
  .addEventListener("click", () => setLanguage("sr"));
document
  .getElementById("btn-en")
  .addEventListener("click", () => setLanguage("en"));

addBtn.addEventListener("click", addSupplement);
cancelEditBtn.addEventListener("click", cancelEditSupplement);
addTimeBtn.addEventListener("click", () => {
  const time = inputTime.value;

  if (!time) {
    alert(translations[currentLang].fillFields);
    return;
  }

  const existingSupplement = supplements.find(
    (sup) => sup.name.toLowerCase() === inputName.value.trim().toLowerCase(),
  );

  if (existingSupplement && editingId === null) {
    if (existingSupplement.times.includes(time)) {
      alert(
        currentLang === "sr"
          ? "Ovo vreme je već dodato."
          : "This time is already added.",
      );
      return;
    }

    const nextSupplements = supplements.map((supplement) =>
      supplement.id === existingSupplement.id
        ? { ...supplement, times: [...supplement.times, time].sort() }
        : supplement,
    );

    if (!saveData(nextSupplements)) return;
    supplements = nextSupplements;
    renderSupplements();
    inputTime.value = "";
    return;
  }

  if (draftTimes.includes(time)) {
    alert(
      currentLang === "sr"
        ? "Ovo vreme je već dodato."
        : "This time is already added.",
    );
    return;
  }

  draftTimes.push(time);
  inputTime.value = "";
  renderSelectedTimes();
});

supplementSearch.addEventListener("input", (event) => {
  supplementFilter = event.target.value.trim();
  renderSupplements();
});

supplementSort.addEventListener("change", (event) => {
  supplementSortMode = event.target.value;
  renderSupplements();
});

function renderSelectedTimes() {
  selectedTimes.innerHTML = "";
  draftTimes.forEach((time) => {
    const item = document.createElement("li");
    const removeButton = document.createElement("button");
    item.textContent = time;
    removeButton.type = "button";
    removeButton.className = "remove-time-btn";
    removeButton.textContent = "×";
    removeButton.setAttribute(
      "aria-label",
      `${translations[currentLang].removeTime}: ${time}`,
    );
    removeButton.addEventListener("click", () => {
      draftTimes = draftTimes.filter((draftTime) => draftTime !== time);
      renderSelectedTimes();
    });
    item.append(removeButton);
    selectedTimes.append(item);
  });
}

addWaterBtn.addEventListener("click", () => {
  if (waterCount < 10) {
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
    if (s.times.includes(currentTime)) {
      sendReminder(s.name, s.dosage);
    }
  });
}, 60000); // 60 seconds
