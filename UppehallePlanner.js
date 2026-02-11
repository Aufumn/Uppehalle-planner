let recipes = [];

document.addEventListener("DOMContentLoaded", () => {
  loadCSV();
});

async function loadCSV() {
  try {
    const response = await fetch("./Uppehalle_CSV.csv");
    const text = await response.text();

    const rows = text.trim().split("\n");

    // Proper CSV split that respects quotes
    const headers = parseCSVRow(rows[0]);

    for (let i = 1; i < rows.length; i++) {
      const values = parseCSVRow(rows[i]);
      let recipe = {};

      headers.forEach((header, index) => {
        recipe[header.trim()] = values[index]?.trim();
      });

      recipes.push(recipe);
    }

    console.log("CSV Loaded:", recipes);
  } catch (error) {
    console.error("Error loading CSV:", error);
  }
}

// Handles quoted CSV properly
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

function findRecipes() {
  console.log("Button clicked");

  if (recipes.length === 0) {
    alert("Recipes are still loading.");
    return;
  }

  const allergies = {
    Gluten: document.getElementById("Gluten").checked,
    Dairy: document.getElementById("Dairy").checked,
    Eggs: document.getElementById("Eggs").checked,
    Nuts: document.getElementById("Nuts").checked
  };

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

  safeRecipes.slice(0, 3).forEach(recipe => {
    resultsDiv.innerHTML += `
      <h3>${recipe.Recipe}</h3>
      <p><strong>Ingredients:</strong> ${recipe.Ingredients}</p>
      <p><strong>Instructions:</strong> ${recipe.Instructions}</p>
      <hr>
    `;
  });
}
