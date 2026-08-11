const recipeGrid = document.getElementById("recipe-grid");
const searchBox = document.getElementById("search-box");
const tagContainer = document.getElementById("tag-container");

let recipes = [];
let selectedTag = null;


// Load the list of recipe files
fetch("recipes.json")
    .then(response => response.json())
    .then(files => Promise.all(files.map(loadRecipe)))
    .then(loadedRecipes => {

        recipes = loadedRecipes;

        buildTags();
        displayRecipes(recipes);

    })
    .catch(error => {

        console.error("Could not load recipes:", error);

        recipeGrid.innerHTML =
            "<p>Recipes could not be loaded.</p>";

    });


// Open an individual recipe HTML file
// and pull its information directly from the page
async function loadRecipe(url) {

    const response = await fetch(url);
    const html = await response.text();

    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");

    const title =
        document.querySelector(".recipe-title")?.textContent.trim()
        || "Untitled Recipe";

    const from =
        document.querySelector(".recipe-source")?.textContent.trim()
        || "";

    const tags =
        [...document.querySelectorAll(".tags span")]
        .map(tag => tag.textContent.trim())
        .filter(Boolean);

    return {
        title,
        url,
        from,
        tags
    };
}


// Build recipe cards
function displayRecipes(recipeList) {

    recipeGrid.innerHTML = "";

    if (recipeList.length === 0) {

        recipeGrid.innerHTML =
            "<p>No recipes found.</p>";

        return;
    }

    recipeList.forEach(recipe => {

        const card = document.createElement("a");

        card.href = recipe.url;
        card.className = "recipe-card-link";

        card.innerHTML = `
            <div class="recipe-card">
                <h2>${recipe.title}</h2>

                ${
                    recipe.from
                    ? `<p class="recipe-from">
                           From: ${recipe.from}
                       </p>`
                    : ""
                }

                <p>${recipe.tags.join(" • ")}</p>
            </div>
        `;

        recipeGrid.appendChild(card);

    });
}


// Automatically build tag buttons
function buildTags() {

    tagContainer.innerHTML = "";

    const allTags = new Set();

    recipes.forEach(recipe => {

        recipe.tags.forEach(tag => {
            allTags.add(tag);
        });

    });

    [...allTags]
        .sort()
        .forEach(tag => {

            const button =
                document.createElement("button");

            button.textContent = tag;
            button.className = "tag-button";

            button.addEventListener("click", () => {

                selectedTag =
                    selectedTag === tag
                    ? null
                    : tag;

                updateResults();
                updateTagButtons();

            });

            tagContainer.appendChild(button);

        });
}


// Search + tag filtering
function updateResults() {

    const searchText =
        searchBox.value
        .toLowerCase()
        .trim();

    const filteredRecipes =
        recipes.filter(recipe => {

            const matchesSearch =
                recipe.title
                    .toLowerCase()
                    .includes(searchText)

                ||

                recipe.from
                    .toLowerCase()
                    .includes(searchText)

                ||

                recipe.tags.some(tag =>
                    tag
                        .toLowerCase()
                        .includes(searchText)
                );

            const matchesTag =
                selectedTag === null
                ||
                recipe.tags.includes(selectedTag);

            return matchesSearch && matchesTag;

        });

    displayRecipes(filteredRecipes);
}


// Highlight selected tag
function updateTagButtons() {

    document
        .querySelectorAll(".tag-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.textContent === selectedTag
            );

        });

}


searchBox.addEventListener(
    "input",
    updateResults
);
