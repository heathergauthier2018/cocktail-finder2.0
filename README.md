🍸 README #2 — Cocktail Finder (API Project)

A lightweight single-page cocktail discovery app using TheCocktailDB API
(API-focused, clean, technical)

🍹 Cocktail Finder

A fast, simple, mobile-friendly web app that lets you:

Generate random cocktail recipes

Search for cocktails by name

Save your favorites using localStorage

It is built to be lightweight, approachable, and fun.

Live Demo:
👉 https://heathergauthier2018.github.io/cocktail-finder2.0/

✨ Features
🍀 Random Mode

Fetches a random cocktail from the API

Displays full details (ingredients, instructions, glass type)

Smooth re-generate flow

🔍 Search Mode

Search for cocktails by full or partial name

Clean grid results

Expand for detailed view

❤️ Favorites

Save any drink to a persistent favorites list

Stored via localStorage

Quick remove / revisit

🛠 Tech Stack

HTML5

CSS3

Vanilla JavaScript

TheCocktailDB API

LocalStorage

Responsive design principles

🧩 Architecture Diagram
index.html
│
└── app.js
    ├── fetchRandomDrink()
    ├── searchDrinks(query)
    ├── renderRandomView()
    ├── renderSearchView()
    ├── renderFavoritesView()
    └── localStorage helpers

📂 Project Structure
cocktail-finder/
│── index.html
│── style.css
│── script.js
└── README.md

🚀 Installation

No build tools required.

Clone repo:

git clone https://github.com/yourusername/cocktail-finder.git
cd cocktail-finder


Open index.html in your browser.

🔗 API Reference — TheCocktailDB

Endpoints used:

Random Cocktail
GET https://www.thecocktaildb.com/api/json/v1/1/random.php

Search by Name
GET https://www.thecocktaildb.com/api/json/v1/1/search.php?s={query}

🧪 Testing (Recommended Upgrade)

Later enhancements:

Add Cypress UI tests

Add Postman API tests

Add input validation unit tests

🚧 Known Limitations

Some cocktails in API lack ingredients

No ingredient filtering yet

No mobile animations (planned)

Search results cannot currently sort or filter

🗺️ Roadmap
Short Term

Ingredient filters

Better empty states

UI polish

Medium Term

“Build My Bar” feature → suggestions based on your ingredients

Recently viewed

Mocktail-only mode

Long Term

Flavor graph

Recommendations engine

Tagging system (“summer,” “cozy,” “tropical”)

📸 Screenshots (Add later)
/assets/random.png
/assets/search.png
/assets/favorites.png

💛 Motivation

Built as a fun, approachable way to explore cocktails, learn ingredients, and quickly save favorites — all without accounts or complexity.

🤍 License

MIT License
