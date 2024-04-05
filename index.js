/** Language key for text comparisons. */
const language = "de";

/** Ingredients assumed to be available. */
const assumedIngredients = [
  "Salz",
  "Pfeffer"
];

/** Asynchronously loads and parses the data file. */
async function loadRecipesData() {
  // see: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
  const response = await fetch("assets/data.json");
  return await response.json();
}

/** Gets an array of all unique ingredients. */
function getUniqueIngredients(recipesData) {
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
  const uniqueIngredients = new Set();
  recipesData.forEach(recipeData => {
    recipeData.ingredients.forEach(alternatives  => {
      alternatives.forEach(ingredient => {
        uniqueIngredients.add(ingredient);
      });
    });
  });
  return [...uniqueIngredients];
}

// Obtain references to the recipes list and view
const recipesList = document.getElementById("recipes-list");
const recipeView = document.getElementById("recipe-view");
let currentRecipeIndex = -1;

/** Initializes the recipes list, creating one link per recipe. */
function initializeRecipesList(recipesData) {
  recipesData.forEach((recipeData, recipeIndex) => {
    const recipeElement = document.createElement("a");
    recipeElement.classList.add("recipe");
    recipeElement.href = "#recipe-view";
    recipeElement.dataset["fraction"] = 0;
    recipeElement.innerHTML = `${recipeData.title}<br />0/${recipeData.ingredients.length} Zutaten`;
    recipeElement.addEventListener("click", event => {
      // When clicked, update the contents of the recipe window with this
      // recipe's HTML contents, and show the recipe window.
      if (recipeIndex != currentRecipeIndex) {
        currentRecipeIndex = recipeIndex;
        recipeView.querySelector(".content").innerHTML = recipeData.html;
        setTimeout(() => {
          recipeView.scrollTo({ top: 0 });
        });
      }
      recipeView.style.display = "block";
      event.preventDefault();
      return false;
    });
    recipesList.appendChild(recipeElement);
    recipeData.element = recipeElement; // link DOM element to data item
  });
  recipeView.querySelector("a.close").addEventListener("click", evt => {
    // When clicking the recipe view's close button, hide the window.
    recipeView.style.display = "none";
    evt.preventDefault();
    return false;
  });
}

// Obtain references to the ingredients lists and their placeholders
const possibleIngredients = document.getElementById("possible-ingredients");
const noPossibleIngredients = document.getElementById("no-possible-ingredients");
const selectedIngredients = document.getElementById("selected-ingredients");
const noSelectedIngredients = document.getElementById("no-selected-ingredients");

function initializeIngredientsList(recipesData, uniqueIngredients) {
  // Add one button per ingredient and, when clicked, move the ingredient
  // between the sets of possible and selected ingredients.
  uniqueIngredients.forEach(ingredient => {
    const element = document.createElement("a");
    element.dataset["filter"] = ingredient.toLowerCase();
    element.classList.add("ingredient");
    element.innerHTML = ingredient;
    element.addEventListener("click", () => {
      if (element.parentNode == possibleIngredients) {
        // If currently in the list of possible ingredients, move to selected
        // ingredients. Display the noPossibleIngredients placeholder when there
        // are no more ingredients to select from.
        selectedIngredients.appendChild(element);
        noSelectedIngredients.style.display = "none";
        if (possibleIngredients.childNodes.length == 0) {
          noPossibleIngredients.style.display = "block";
        }
      } else {
        // If currently in the list of selected ingredients, move back to
        // possible ingredients. Display the noSelectedIngredients placeholder
        // when there are no more selected ingredients.
        possibleIngredients.appendChild(element);
        sortIngredientsList(possibleIngredients);
        noPossibleIngredients.style.display = "none";
        if (selectedIngredients.childNodes.length == 0) {
          noSelectedIngredients.style.display = "block";
        }
      }
      // Whenever an ingredient is moved, update the list of recipes
      updateRecipes(recipesData);
    });
    if (assumedIngredients.includes(ingredient)) {
      selectedIngredients.appendChild(element);
    } else {
      possibleIngredients.appendChild(element);
    }
  });
  sortIngredientsList(possibleIngredients);
  if (selectedIngredients.childNodes.length > 0) {
    sortIngredientsList(selectedIngredients);
    updateRecipes(recipesData);
  }
  noPossibleIngredients.style.display = possibleIngredients.childNodes.length == 0 ? "block" : "none";
  noSelectedIngredients.style.display = selectedIngredients.childNodes.length == 0 ? "block" : "none";
}

/** Sorts a list of ingredients elements by name */
function sortIngredientsList(list) {
  [...list.childNodes]
    .sort((a, b) => a.innerText.localeCompare(b.innerText, language))
    .forEach(element => list.appendChild(element));
}

// Obtain references to the filter text input and clear button
const filterInput = document.getElementById("filter-input");
const filterClear = document.getElementById("filter-clear");
let filterUpdateTimeout = null;

// Observe inputs into the filter text input, after a slight delay updating
// the possible ingredients list to only show ingredients matching the given
// filter value
filterInput.addEventListener("input", () => {
  if (filterUpdateTimeout) clearTimeout(filterUpdateTimeout);
  filterUpdateTimeout = setTimeout(updateFilter, 500);
});

filterClear.addEventListener("click", () => {
  // When clicking the "X" next to the filter input, clear the input and
  // update the filter, which now is empty, showing all ingredients again
  filterInput.value = "";
  updateFilter();
});

/** Hides ingredients not matching the filter and shows those that do. */
function updateFilter() {
  const filterValue = filterInput.value;
  let numVisible = 0;
  possibleIngredients.childNodes.forEach(element => {
    if (element.dataset["filter"].startsWith(filterValue.toLocaleLowerCase(language))) {
      numVisible += 1;
      element.style.display = "inline";
    } else {
      element.style.display = "none";
    }
  });
  if (numVisible == 0) {
    noPossibleIngredients.style.display = "block";
  } else {
    noPossibleIngredients.style.display = "none";
  }
}

/** Updates the list of recipes to match selected ingredients. */
function updateRecipes(recipesData) {
  // Obtain all unique selected ingredients
  const uniqueSelectedIngredients = new Set();
  selectedIngredients.childNodes.forEach(element => {
    uniqueSelectedIngredients.add(element.dataset["filter"]);
  });

  // Compare each recipe's ingredients with the set of selected ingredients
  // and count the number of ingredients that are available for this recipe
  recipesData.forEach(recipe => {
    let haveIngredients = 0;
    recipe.ingredients.forEach(alternatives => {
      for (let i = 0; i < alternatives.length; i++) {
        if (uniqueSelectedIngredients.has(alternatives[i].toLowerCase())) {
          haveIngredients += 1;
          break;
        }
      }
    });
    // Update the recipe item to display the ratio of available ingredients
    const recipeElement = recipe.element;
    const fraction = haveIngredients / recipe.ingredients.length;
    recipeElement.innerHTML = `${recipe.title}<br />${haveIngredients}/${recipe.ingredients.length} Zutaten`;
    recipeElement.dataset["fraction"] = fraction;
    recipeElement.style.setProperty("--fraction", fraction);
  });

  // Sort the list of recipes by fraction of available ingredients. Makes an
  // array of all recipe elements, sorts the array, and reinserts the sorted
  // elements into the list element in desired order.
  [...recipesList.childNodes]
    .sort((a, b) => b.dataset["fraction"] - a.dataset["fraction"])
    .forEach(element => recipesList.appendChild(element));
}

// Initialize the app once the data file has been loaded
loadRecipesData().then(recipesData => {
  initializeRecipesList(recipesData);
  initializeIngredientsList(recipesData, getUniqueIngredients(recipesData));
});
