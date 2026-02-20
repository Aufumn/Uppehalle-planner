console.log("JS file is connected");

let recipes = [];

// Load CSV after page loads
document.addEventListener("DOMContentLoaded", () => {
  loadCSV();

  // Attach button listener
  document.getElementById("findBtn").addEventListener("click", findRecipes);
});

//Load CSV
async function loadCSV() {
  try {
    const response = await fetch("./Uppehalle_CSV.csv");
    if (!response.ok) throw new Error("CSV file not found");

    const text = await response.text();
    const rows = text.trim().split("\n");

    // Parse header row
    const headers = parseCSVRow(rows[0]);

    // Clear recipes array in case of reload
    recipes = [];

    // Parse each recipe row
    for (let i = 1; i < rows.length; i++) {
      const values = parseCSVRow(rows[i]);
      let recipe = {};

      headers.forEach((header, index) => {
        recipe[header.trim()] = values[index]?.trim();
        recipe[header.trim()] = values[index]?.trim().replace(/\r/g, "");
      });
   
      recipes.push(recipe);
    }

    console.log("CSV Loaded Successfully:", recipes);
  } catch (error) {
    console.error("Error loading CSV:", error);
  }
}

//Handle quotes in CSV
function parseCSVRow(row) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let char of row) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

//Find safe recipes
function findRecipes() {
  if (recipes.length === 0) {
    alert("Recipes are still loading. Please wait.");
    return;
  }

  const allergies = {
    Gluten: document.getElementById("Gluten").checked,
    Dairy: document.getElementById("Dairy").checked,
    Eggs: document.getElementById("Eggs").checked,
    Nuts: document.getElementById("Nuts").checked
  };

  // Filter recipes
  let safeRecipes = recipes.filter(recipe => {
    for (let allergy in allergies) {
      if (
        allergies[allergy] &&
        recipe[allergy]?.trim().toUpperCase() !== "N"
      ) {
        return false;
      }
    }
    return true;
  });

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (safeRecipes.length === 0) {
    resultsDiv.innerHTML = "<p>No safe recipes found.</p>";
    return;
  }

  // Shuffle recipes
  safeRecipes.sort(() => 0.5 - Math.random());

  // Show up to 3
  safeRecipes.slice(0, 3).forEach(recipe => {
    const card = document.createElement("div");
    card.classList.add("recipe-card");

    const title = document.createElement("h3");
    title.textContent = recipe.Recipe;

    const tagContainer = document.createElement("div");
    tagContainer.classList.add("recipe-tags");

    const allergenList = ["Gluten", "Dairy", "Eggs", "Nuts"];
    let hasAllergens = false;

    allergenList.forEach(allergen => {
      if (recipe[allergen]?.trim().toUpperCase() === "Y") {
        hasAllergens = true;
        const tag = document.createElement("span");
        tag.classList.add("tag");
        tag.textContent = allergen;
        tagContainer.appendChild(tag);
      }
    });

    if (!hasAllergens) {
      const safeTag = document.createElement("span");
      safeTag.classList.add("tag");
      safeTag.textContent = "No Allergens";
      tagContainer.appendChild(safeTag);
    }

    const ingredients = document.createElement("p");
    ingredients.innerHTML = `<strong>Ingredients:</strong> ${recipe.Ingredients}`;

    const instructions = document.createElement("p");
    instructions.innerHTML = `<strong>Instructions:</strong> ${recipe.Instructions}`;

    card.appendChild(title);
    card.appendChild(tagContainer);
    card.appendChild(ingredients);
    card.appendChild(instructions);

    resultsDiv.appendChild(card);
  });
}