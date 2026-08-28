"use strict";

const AppHelpers = (() => {
  const createStorageKey = (key, userId) =>
    userId ? `user-${userId}-${key}` : key;

  const normalizeWaterState = (storedWater, currentDate) => {
    const storedState =
      storedWater && typeof storedWater === "object"
        ? storedWater
        : { date: currentDate, count: Number(storedWater) || 0 };
    const count = storedState.date === currentDate ? storedState.count : 0;

    return Number.isFinite(Number(count))
      ? Math.min(Math.max(Number(count), 0), 10)
      : 0;
  };

  const formatTime = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes(),
    ).padStart(2, "0")}`;

  const createReminderKey = (dateKey, supplementId, time) =>
    `${dateKey}-${supplementId}-${time}`;

  return {
    createStorageKey,
    normalizeWaterState,
    formatTime,
    createReminderKey,
  };
})();

if (typeof module !== "undefined") {
  module.exports = { AppHelpers };
}
