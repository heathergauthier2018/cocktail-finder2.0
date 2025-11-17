🍹 Cocktail Finder 2.0

A lightweight, fast, and friendly single-page cocktail discovery app powered by TheCocktailDB API.
Users can generate random cocktails, search by name, and save their favorites — all with clean UI and zero friction.

👉 Live Demo:
https://heathergauthier2018.github.io/cocktail-finder2.0/

✨ Features
🍀 Random Cocktail Generator

Fetches a completely random cocktail

Includes image, ingredients, instructions, and glass type

One-click “Generate Another” flow

🔍 Search

Search cocktails by full or partial name

Displays results in a clean card grid

Expand a cocktail for full details

❤️ Favorites

Save & remove favorites

Stored using localStorage

Persistent between sessions

📱 Fully Responsive

Optimized for desktop, tablet, and mobile.

🛠️ Tech Stack

Frontend:

HTML5

CSS3

JavaScript (Vanilla JS)

Data Source:

TheCocktailDB API

Persistence:

localStorage

🗂️ Folder Structure

Matches your current file layout exactly:

COCKTAIL-FINDER2.0/
│── .vscode/
│── img/                   # Images & icons
│── index.html             # Main UI
│── script.js              # App logic
│── styles.css             # Stylesheet
└── README.md              # Project documentation

🔧 Installation & Usage

Clone the repository:

git clone https://github.com/heathergauthier2018/cocktail-finder2.0.git
cd cocktail-finder2.0


Open the app:

Just open index.html directly in any browser.

🔌 API Endpoints Used
Random Cocktail
GET https://www.thecocktaildb.com/api/json/v1/1/random.php

Search by Name
GET https://www.thecocktaildb.com/api/json/v1/1/search.php?s={query}

🧩 Architecture Overview

High-level flow of script.js:

script.js
│
├── fetchRandomDrink()
├── fetchBySearch()
├── renderRandomView()
├── renderSearchResults()
├── renderFavorites()
├── saveFavorite()
├── removeFavorite()
└── loadFavorites()

🧪 Future Enhancements

Ingredient filters

Mocktail-only mode

“Build My Bar” → suggest drinks based on ingredients the user already has

Recently viewed

Favorites sorting & tagging

Shareable recipe cards

📸 Screenshots

(Add files inside /img and link them here.)

📝 License

MIT License
