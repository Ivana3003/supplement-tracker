"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { SupplementApi } = require("../js/supplement-api.js");

const originalFetch = global.fetch;

test.afterEach(() => {
  global.fetch = originalFetch;
});

test("returns supplement products and filters food products", async () => {
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      products: [
        {
          code: "vitamin-c",
          product_name: "Vitamin C 1000 mg",
          brands: "Example Brand",
          categories_tags: ["en:vitamins"],
        },
        {
          code: "orange-juice",
          product_name: "Orange juice",
          categories_tags: ["en:beverages"],
        },
      ],
    }),
  });

  const products = await SupplementApi.search("vitamin c");

  assert.deepEqual(products, [
    {
      id: "vitamin-c",
      name: "Vitamin C 1000 mg",
      brand: "Example Brand",
      quantity: "",
      ingredients: "",
      categories: ["en:vitamins"],
      labels: [],
      image: "",
      url: "",
    },
  ]);
});

test("throws a descriptive error when the API request fails", async () => {
  global.fetch = async () => ({ ok: false, status: 503 });

  await assert.rejects(
    SupplementApi.search("magnesium"),
    /Supplement search failed with status 503/,
  );
});
