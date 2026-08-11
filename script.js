const recipeGrid = document.getElementById("recipe-grid");
const searchBox = document.getElementById("search-box");
const tagContainer = document.getElementById("tag-container");

let recipes = [];
let selectedTag = null;

fetch("recipes.json")
    .then(response => response.json())
    .then(data => {
        recipes = data;

        buildTags();
        displayRecipes(recipes);
    })
    .catch(error => {
        console.error("Could not load recipes:", error);
        recipeGrid.innerHTML = "<p>Recipes could not be loaded.</p>";
    });


function displayRecipes(recipeList) {

    recipeGrid.innerHTML = "";

    if (recipeList.length === 0) {
        recipeGrid.innerHTML = "<p>No recipes found.</p>";
        return;
    }

    recipeList.forEach(recipe => {

        const card = document.createElement("a");

        card.href = recipe.url;
        card.className = "recipe-card-link";

        card.innerHTML = `
            <div class="recipe-card">
                <h2>${recipe.title}</h2>
                <p class="recipe-from">From: ${recipe.from}</p>
                <p>${recipe.tags.join(" • ")}</p>
            </div>
        `;

        recipeGrid.appendChild(card);

    });
}


function buildTags() {

    const allTags = new Set();

    recipes.forEach(recipe => {
        recipe.tags.forEach(tag => allTags.add(tag));
    });

    [...allTags]
        .sort()
        .forEach(tag => {

            const button = document.createElement("button");

            button.textContent = tag;
            button.className = "tag-button";

            button.addEventListener("click", () => {

                if (selectedTag === tag) {
                    selectedTag = null;
                } else {
                    selectedTag = tag;
                }

                updateResults();
                updateTagButtons();

            });

            tagContainer.appendChild(button);

        });
}


function updateResults() {

    const searchText = searchBox.value.toLowerCase().trim();

    const filteredRecipes = recipes.filter(recipe => {

        const matchesSearch =
            recipe.title.toLowerCase().includes(searchText) ||
            recipe.from.toLowerCase().includes(searchText) ||
            recipe.tags.some(tag =>
                tag.toLowerCase().includes(searchText)
            );

        const matchesTag =
            selectedTag === null ||
            recipe.tags.includes(selectedTag);

        return matchesSearch && matchesTag;

    });

    displayRecipes(filteredRecipes);
}


function updateTagButtons() {

    document.querySelectorAll(".tag-button").forEach(button => {

        if (button.textContent === selectedTag) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }

    });
}


searchBox.addEventListener("input", updateResults);
