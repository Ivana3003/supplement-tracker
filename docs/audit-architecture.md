# Supplement Tracker: Audit and Architecture

## Scope

This document records the Day 1 audit of the current Supplement Tracker prototype and defines the boundaries for the next implementation phases. It describes the existing behavior, target architecture, risks, and acceptance criteria without changing the current application flow.

## Current State

Supplement Tracker is a static browser application built with HTML, CSS, and vanilla JavaScript. It currently provides:

- Serbian and English interface text
- supplement creation with name, dosage, and time
- supplement list rendering and deletion
- hydration counter with increment and reset actions
- browser notification checks on a 60-second interval
- browser-local persistence through `localStorage`

There is currently no backend, authentication, API integration, automated test suite, build pipeline, or CI workflow.

## Existing Data Model

The current application uses two unscoped `localStorage` keys:

### `mySupplements`

An array of supplement records:

```json
[
  {
    "id": 1724567890123,
    "name": "Coenzyme Q10",
    "dosage": "100 mg",
    "time": "08:30"
  }
]
```

### `myWater`

A single numeric hydration count:

```json
7
```

This data is local to the current browser profile. It is not associated with a user and cannot be synchronized between devices.

## Current Risks and Gaps

- Corrupted `localStorage` JSON can break startup.
- Supplement names, dosages, and times have limited validation.
- Duplicate supplements are not prevented.
- Supplements cannot currently be edited.
- Entries are not filtered or sorted.
- Supplement IDs rely on `Date.now()`.
- The hydration display goal and the actual counter limit are inconsistent.
- Reminder text does not consistently follow the selected language.
- Notification permission and browser support are not handled comprehensively.
- A 60-second exact-time check can miss reminders and does not yet model timezone or daylight-saving edge cases.
- Health-related data is not isolated by user and should not remain in an unscoped storage model after authentication is introduced.

## Target Architecture

### Authentication

Use Firebase Authentication for:

- registration
- login
- logout
- session state restoration
- user-facing authentication errors

The application should show an authentication loading state while the Firebase session is being resolved. Unauthenticated users should not see or access private supplement data.

### Firestore Data Model

Use a user-scoped collection structure:

```text
users/{uid}
  profile
  supplements/{supplementId}
  hydration/{yyyy-mm-dd}
```

A supplement document should contain:

```json
{
  "name": "Coenzyme Q10",
  "dosage": "100 mg",
  "time": "08:30",
  "active": true,
  "createdAt": "server timestamp",
  "updatedAt": "server timestamp"
}
```

A hydration document should contain:

```json
{
  "date": "2026-08-24",
  "count": 7,
  "goal": 10,
  "updatedAt": "server timestamp"
}
```

The client should not use a user-provided UID as an authorization decision. Firestore Security Rules must compare the authenticated UID with the document path UID.

### Security Boundary

The minimum Firestore rule model is:

```text
Authenticated users can read and write only users/{their-own-uid}/**.
Unauthenticated users cannot read or write private user data.
```

Firebase configuration values used by a web client are not private secrets. Private API keys or server credentials must never be committed to front-end source files.

## API Integration Boundary

A supplement or ingredient search API will be added only after its data quality, browser compatibility, CORS behavior, rate limits, licensing, and API-key requirements are checked.

The search layer must provide:

- debounced queries
- request loading state
- empty-result state
- user-readable error state
- retry behavior
- protection against stale responses
- safe rendering of external data

External supplement information is informational only and must not be presented as medical advice.

## Implementation Order

1. Stabilize current supplement and hydration flows.
2. Add validation, edit, filter, and sort behavior.
3. Improve hydration and reminder behavior.
4. Add Firebase Authentication.
5. Add user-scoped Firestore persistence and Security Rules.
6. Add and verify the supplement search API.
7. Centralize error handling and add loading, empty, and offline states.
8. Add unit and browser-level tests.
9. Apply code-quality changes, update the README, and refresh screenshots.

## Day 1 Acceptance Criteria

The audit phase is complete when:

- current user flows and storage keys are documented
- current limitations and risks are documented
- the target authenticated data model is defined
- the user-data security boundary is explicit
- API selection criteria are documented
- local-only storage is clearly separated from future authenticated data
- the next implementation branch and scope are agreed before code changes begin

## Planned Feature Branches

```text
feature/supplement-tracker-core-ux
feature/supplement-tracker-auth
feature/supplement-tracker-user-data
feature/supplement-tracker-api
feature/supplement-tracker-reminders
feature/supplement-tracker-error-handling
feature/supplement-tracker-code-quality
docs/supplement-tracker-readme
```

## Privacy and Product Notes

Supplement Tracker may contain health-related user data. The implementation should minimize stored data, keep records user-scoped, avoid unnecessary analytics, and clearly state that the app does not provide medical advice. Local storage should be treated as a prototype mechanism, not a secure multi-user data store.
