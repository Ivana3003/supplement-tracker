"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { AppHelpers } = require("../js/app-helpers.js");

test("creates user-scoped storage keys when a user ID exists", () => {
  assert.equal(
    AppHelpers.createStorageKey("mySupplements", "user-123"),
    "user-user-123-mySupplements",
  );
  assert.equal(AppHelpers.createStorageKey("myWater", ""), "myWater");
});

test("keeps today's hydration value within the supported range", () => {
  const today = "2026-08-28";

  assert.equal(
    AppHelpers.normalizeWaterState({ date: today, count: 5 }, today),
    5,
  );
  assert.equal(AppHelpers.normalizeWaterState(12, today), 10);
  assert.equal(AppHelpers.normalizeWaterState(-2, today), 0);
});

test("resets hydration when the saved value belongs to a previous day", () => {
  assert.equal(
    AppHelpers.normalizeWaterState(
      { date: "2026-08-27", count: 8 },
      "2026-08-28",
    ),
    0,
  );
});

test("formats reminder times and creates stable reminder keys", () => {
  const date = new Date(2026, 7, 28, 8, 5);

  assert.equal(AppHelpers.formatTime(date), "08:05");
  assert.equal(
    AppHelpers.createReminderKey("2026-08-28", 42, "08:05"),
    "2026-08-28-42-08:05",
  );
});
