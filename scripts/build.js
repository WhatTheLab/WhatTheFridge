import fs from "fs";
import { glob } from "glob";
import { marked } from "marked";

function trimWhitespace(string) {
  return string.trim();
}

/**
 * Parses a recipe given its markdown contents, extracing its ingredients by
 * recognizing and eliding the custom ingredient pattern `#[Ingredient|...]`.
 */
function parseRecipe(markdown) {
  const texts = [];
  const ingredients = [];
  markdown = markdown.replaceAll(/#\[([^\]]+)\]/g, ($0, match) => {
    // #[Möhren|Möhre,Äpfel|Apfel]
    const alternativesParts = match.split(",").map(trimWhitespace);
    const alternativesTexts = [];
    const alternatives = [];
    alternativesParts.forEach(alternativePart => {
      const textAndOptionalKey = alternativePart.split("|", 2).map(trimWhitespace);
      if (textAndOptionalKey.length == 1) {
        // Text and key are identical
        alternativesTexts.push(textAndOptionalKey[0]);
        alternatives.push(textAndOptionalKey[0]);
      } else {
        // Text and key differ
        alternativesTexts.push(textAndOptionalKey[0]);
        alternatives.push(textAndOptionalKey[1]);
      }
    });
    ingredients.push(alternatives);
    return alternativesTexts.join(" oder ");
  });
  return {
    markdown,
    ingredients
  };
}

// List of all recipe source files
console.log("Reading list of recipes from recipes/ folder...");
const recipeFiles = await glob("./recipes/*.md");

// Data structure used by the app
const recipesData = [];

// Read and parse all recipe source files, generating the app's data file
for (const file of recipeFiles) {
  console.log(`- Parsing ${file}`);
  const markdownSource = await fs.promises.readFile(file, { encoding: "utf8" });
  const { ingredients, markdown } = parseRecipe(markdownSource);
  const html = marked.parse(markdown);
  const titleResult = /<h1>([^<]+)<\/h1>/.exec(html);
  if (titleResult) {
    if (ingredients.length > 0) {
      recipesData.push({
        title: titleResult[1],
        ingredients,
        html
      });
      console.log("  SUCCESS!");
      console.log(`  - Title: ${titleResult[1]}`);
      console.log(`  - Ingredients: ${ingredients}`);
    } else {
      console.log("  ERROR: Has no ingredients (pattern not found)");
    }
  } else {
    console.log("  ERROR: Unable to parse title (first heading not found)");
  }
}

// Save the data file
console.log("Saving prepared recipes data to assets/data.json");
await fs.promises.writeFile("./assets/data.json", JSON.stringify(recipesData, null, 2));
