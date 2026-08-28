"use strict";

const SupplementApi = (() => {
  const API_URL = "https://world.openfoodfacts.org/cgi/search.pl";

  const search = async (query, signal) => {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: "1",
      action: "process",
      json: "1",
      page_size: "8",
      fields:
        "code,product_name,generic_name,brands,quantity,ingredients_text,categories_tags,labels_tags,image_front_url,url",
    });

    const response = await fetch(`${API_URL}?${params}`, { signal });
    if (!response.ok) {
      throw new Error(
        `Supplement search failed with status ${response.status}.`,
      );
    }

    const data = await response.json();
    return Array.isArray(data.products)
      ? data.products.map(mapProduct).filter(isSupplementProduct)
      : [];
  };

  const supplementTags = [
    "food-supplements",
    "dietary-supplements",
    "vitamins",
    "minerals",
    "protein-supplements",
    "herbal-supplements",
    "omega-3s",
    "probiotics",
  ];

  const supplementKeywords = [
    "vitamin",
    "mineral",
    "omega",
    "protein",
    "collagen",
    "magnesium",
    "calcium",
    "zinc",
    "probiotic",
    "creatine",
    "fish oil",
    "melatonin",
    "glucosamine",
    "chondroitin",
    "adaptogen",
    "herbal",
    "supplement",
  ];

  const foodTags = [
    "beverages",
    "snacks",
    "breakfast-cereals",
    "desserts",
    "juices",
    "sodas",
    "milk",
    "dairy-products",
    "cheeses",
    "yogurts",
    "plant-based-milks",
    "fruit-juices",
    "fruit-drinks",
  ];

  const mapProduct = (product) => ({
    id:
      product.code ||
      product.url ||
      product.product_name ||
      `product-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: product.product_name || product.generic_name || "Unnamed product",
    brand: product.brands || "",
    quantity: product.quantity || "",
    ingredients: product.ingredients_text || "",
    categories: Array.isArray(product.categories_tags)
      ? product.categories_tags
      : [],
    labels: Array.isArray(product.labels_tags) ? product.labels_tags : [],
    image: product.image_front_url || "",
    url: product.url || "",
  });

  const isSupplementProduct = (product) => {
    const searchableText = [product.name, product.ingredients, product.brand]
      .join(" ")
      .toLowerCase();
    const hasSupplementTag = product.categories.some((tag) =>
      supplementTags.some((supplementTag) => tag.includes(supplementTag)),
    );
    const hasSupplementKeyword = supplementKeywords.some((keyword) =>
      searchableText.includes(keyword),
    );
    const isClearlyFood = product.categories.some((tag) =>
      foodTags.some((foodTag) => tag.includes(foodTag)),
    );

    return !isClearlyFood && (hasSupplementTag || hasSupplementKeyword);
  };

  return { search };
})();

if (typeof module !== "undefined") {
  module.exports = { SupplementApi };
}
