// 1. DICTIONARY WITH TRANSLATIONS (i18n)
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
    searchSupplements: "Pretraži suplemente",
    sortSupplements: "Sortiraj suplemente",
    sortName: "Naziv A–Z",
    sortTime: "Najranije vreme",
    sortNewest: "Najnovije dodato",
    emptySupplements: "Još nema dodatih suplemenata.",
    emptySearch: "Nema suplemenata koji odgovaraju pretrazi.",
    edit: "Izmeni",
    save: "Sačuvaj",
    cancel: "Otkaži",
    delete: "Obriši",
    duplicateSupplement: "Ovaj suplement već postoji.",
    duplicateTime: "Ovo vreme je već dodato.",
    dataSaveError: "Podaci nisu mogli biti sačuvani.",
    reminderTitle: "Vreme je za suplement! 💊",
    reminderBody: (name, dose) => `Uzmi svoj ${name} (${dose})`,
    enableReminders: "Omogući podsetnike",
    remindersEnabled: "Podsetnici su uključeni",
    remindersDenied: "Podsetnici su blokirani u browseru",
    notificationsUnavailable: "Ovaj browser ne podržava podsetnike.",
    notificationPermissionError:
      "Dozvola za podsetnike nije mogla biti zatražena.",
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
    searchSupplements: "Search supplements",
    sortSupplements: "Sort supplements",
    sortName: "Name A–Z",
    sortTime: "Earliest time",
    sortNewest: "Recently added",
    emptySupplements: "No supplements have been added yet.",
    emptySearch: "No supplements match the search.",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    duplicateSupplement: "This supplement already exists.",
    duplicateTime: "This time is already added.",
    dataSaveError: "Data could not be saved.",
    reminderTitle: "Time for your supplement! 💊",
    reminderBody: (name, dose) => `Take ${name} (${dose})`,
    enableReminders: "Enable reminders",
    remindersEnabled: "Reminders are enabled",
    remindersDenied: "Reminders are blocked in the browser",
    notificationsUnavailable: "This browser does not support reminders.",
    notificationPermissionError: "Reminder permission could not be requested.",
  },
};

const LANGUAGE_KEY = "supplement-tracker-language";
let currentLang = "sr";
try {
  const storedLanguage = localStorage.getItem(LANGUAGE_KEY);
  if (translations[storedLanguage]) currentLang = storedLanguage;
} catch {
  // Language preference is unavailable.
}

const t = (key, ...args) => {
  const value = translations[currentLang]?.[key] ?? translations.sr[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
};

// 3. GLOBAL APPLICATION STATE (Data)
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
const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const storedWaterState =
  storedWater && typeof storedWater === "object"
    ? storedWater
    : { date: todayKey(), count: Number(storedWater) || 0 };
let waterCount =
  storedWaterState.date === todayKey() &&
  Number.isFinite(Number(storedWaterState.count))
    ? Math.min(Math.max(Number(storedWaterState.count), 0), 10)
    : 0;
const sentReminders = new Set();

// 3. ELEMENT SELECTORS
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
const supplementSearchLabel = document.querySelector(
  'label[for="supplement-search"]',
);
const supplementSortLabel = document.querySelector(
  'label[for="supplement-sort"]',
);
const supplementSortOptions = supplementSort.querySelectorAll("option");
const notificationBtn = document.getElementById("notification-btn");

// 5. FUNCTIONS FOR LOGIC AND DISPLAY

// Function for changing language
function setLanguage(lang) {
  currentLang = translations[lang] ? lang : "sr";
  document.documentElement.lang = currentLang;
  try {
    localStorage.setItem(LANGUAGE_KEY, currentLang);
  } catch {
    // Language preference cannot be persisted.
  }

  // Updating all texts from the dictionary
  mainTitle.textContent = t("mainTitle");
  lblName.textContent = t("lblName");
  lblDosage.textContent = t("lblDosage");
  lblTime.textContent = t("lblTime");
  addBtn.textContent = editingId === null ? t("addBtn") : t("save");
  listTitle.textContent = t("listTitle");
  waterTitle.textContent = t("waterTitle");
  addWaterBtn.textContent = t("addWater");
  resetWaterBtn.textContent = t("resetWater");
  notificationBtn.textContent =
    "Notification" in window && Notification.permission === "granted"
      ? t("remindersEnabled")
      : "Notification" in window && Notification.permission === "denied"
        ? t("remindersDenied")
        : t("enableReminders");
  inputName.placeholder = t("placeholderName");
  inputDosage.placeholder = t("placeholderDosage");
  addTimeBtn.textContent = t("addTime");
  supplementSearchLabel.textContent = t("searchSupplements");
  supplementSearch.placeholder = t("searchSupplements");
  supplementSortLabel.textContent = t("sortSupplements");
  supplementSortOptions[0].textContent = t("sortName");
  supplementSortOptions[1].textContent = t("sortTime");
  supplementSortOptions[2].textContent = t("sortNewest");
  cancelEditBtn.textContent = t("cancel");

  // Activating button in the header
  document
    .getElementById("btn-sr")
    .classList.toggle("active", currentLang === "sr");
  document
    .getElementById("btn-en")
    .classList.toggle("active", currentLang === "en");

  // Refresh water display because the suffix (čaša/glasses) has changed
  updateWaterUI();
  renderSupplements();
  renderSelectedTimes();
}

// Save to browser memory
function saveData(nextSupplements = supplements, nextWaterCount = waterCount) {
  try {
    localStorage.setItem("mySupplements", JSON.stringify(nextSupplements));
    localStorage.setItem(
      "myWater",
      JSON.stringify({ date: todayKey(), count: nextWaterCount }),
    );
    return true;
  } catch {
    alert(t("dataSaveError"));
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
  emptyState.textContent = supplementFilter
    ? t("emptySearch")
    : t("emptySupplements");

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
    editButton.textContent = t("edit");
    editButton.addEventListener("click", () => startEditSupplement(sup.id));
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `${t("delete")}: ${sup.name}`);
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
  addBtn.textContent = t("save");
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
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(t("reminderTitle"), {
        body: t("reminderBody", name, dose),
        icon: "https://cdn-icons-png.flaticon.com/512/822/822143.png",
      });
    } catch {
      // Notification creation can fail in restricted browser contexts.
    }
  }
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert(t("notificationsUnavailable"));
    return;
  }

  try {
    await Notification.requestPermission();
    setLanguage(currentLang);
  } catch {
    alert(t("notificationPermissionError"));
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
    alert(t("fillFields"));
    return;
  }

  const duplicate = supplements.some(
    (sup) =>
      sup.name.toLowerCase() === name.toLowerCase() && sup.id !== editingId,
  );

  if (duplicate) {
    alert(t("duplicateSupplement"));
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
    alert(t("fillFields"));
    return;
  }

  const existingSupplement = supplements.find(
    (sup) => sup.name.toLowerCase() === inputName.value.trim().toLowerCase(),
  );

  if (existingSupplement && editingId === null) {
    if (existingSupplement.times.includes(time)) {
      alert(t("duplicateTime"));
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
    alert(t("duplicateTime"));
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
    removeButton.setAttribute("aria-label", `${t("removeTime")}: ${time}`);
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
    if (saveData()) updateWaterUI();
  }
});

resetWaterBtn.addEventListener("click", () => {
  waterCount = 0;
  if (saveData()) updateWaterUI();
});

notificationBtn.addEventListener("click", requestNotificationPermission);

// 7. INITIALIZATION (Runs when page loads)
// This ensures the app starts with correct data and language
setLanguage(currentLang);
renderSupplements();
updateWaterUI();

function checkDueReminders() {
  const now = new Date();
  const currentTime =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");

  supplements.forEach((s) => {
    if (s.times.includes(currentTime)) {
      const reminderKey = `${todayKey()}-${s.id}-${currentTime}`;
      if (sentReminders.has(reminderKey)) return;
      sentReminders.add(reminderKey);
      sendReminder(s.name, s.dosage);
    }
  });
}

setInterval(checkDueReminders, 60000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) checkDueReminders();
});
