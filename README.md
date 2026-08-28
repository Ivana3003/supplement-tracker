# 💊 Supplement Tracker

## 📸 Preview

![Supplement Tracker Screenshot](./screenshot.png)

> A responsive supplement and hydration tracker with Firebase authentication, smart reminders, and bilingual support.

[Live Demo](https://it-supplement-tracker.netlify.app/) · [Repository](https://github.com/Ivana3003/supplement-tracker)

## 🔬 Project Context

As a **Master of Organic Chemistry**, I built this project around the practical need to record supplement names, dosages, and daily reminder times in one place.

- **Domain Focus:** Supplement names, dosage details, and reminder times are stored as individual tracker entries.
- **Current Scope:** The project is a client-side tracker with Firebase authentication and browser-based data persistence.

## 🌟 Features

- **Firebase Authentication:** Email/password registration, login, session persistence, and logout.
- **User-Scoped Data:** Supplements and hydration data use Firebase `uid`-scoped LocalStorage keys, so accounts remain separate in the same browser.
- **Supplement Management:** Add, edit, delete, search, and sort supplements with a dosage and multiple reminder times.
- **Smart Reminders:** Uses the **Browser Notification API** to check for due supplements every minute.
- **Hydration Tracker:** Tracks a daily goal of up to 10 glasses and resets the displayed count for a new day.
- **Supplement Search:** Searches the OpenFoodFacts API and filters results to prioritize supplement-related products.
- **Multi-language Support (i18n):** Instant toggle between Serbian and English using a dictionary-based translation system.
- **In-App Feedback:** Displays validation, auth, API, and app errors in the relevant interface area.
- **Responsive Design:** Optimized for mobile, tablet, and desktop layouts with CSS custom properties, Flexbox, Grid, and media queries.

## 🛠️ Tech Stack

- **HTML5:** Semantic structure focusing on accessibility and clear document flow.
- **CSS3:** Custom styling using Flexbox, Grid, and **CSS Variables** for a robust design system.
- **JavaScript (ES6+):** DOM updates, async requests, state handling, and reusable pure helpers.
- **Firebase Authentication:** Email/password provider with persistent auth state.
- **Browser APIs:** Notification API, Fetch API, and LocalStorage.
- **OpenFoodFacts API:** Product search with request cancellation and supplement filtering.
- **Testing:** Node.js built-in test runner.
- **Development Server:** `serve`.

## 🧪 Educational Goals & Learning Outcomes

This project demonstrates proficiency in:

1. **Firebase Authentication:** Implementing email/password authentication, session restoration, protected UI, and logout.
2. **Async API Integration:** Handling external search requests, request cancellation, loading states, and failed responses.
3. **Internationalization (i18n):** Building a dictionary-based Serbian and English interface.
4. **User-Specific Persistence:** Scoping LocalStorage data to the authenticated Firebase user.
5. **Browser Notifications:** Checking and delivering due supplement reminders.
6. **Automated Testing:** Testing API and pure application helper logic with Node's built-in test runner.

## 🚀 Installation & Usage

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Configure `js/firebase-config.js` with your Firebase Web app configuration.
3. In Firebase Console, enable the **Email/Password** sign-in provider and authorize `localhost` for local development.
4. Start the app:

```bash
npm start
```

5. Open `http://localhost:3000` in a modern browser.
6. Allow notifications when prompted to enable smart reminders.

## ✅ Testing

Run the automated test suite with:

```bash
npm test
```

The suite contains six tests covering the OpenFoodFacts API helper, supplement filtering, failed API responses, user-scoped storage keys, hydration normalization and daily reset logic, plus reminder time and key generation.

## ℹ️ Data Storage Note

Firebase Authentication manages user accounts. Supplement and hydration data are currently saved in the browser's LocalStorage under user-specific keys, so they do not sync across browsers or devices.

---

### 👩‍🔬 Author

**[Ivana Tatić]**
_Master of Organic Chemistry & Aspiring Web Developer_

Feel free to connect or check out my other projects!
