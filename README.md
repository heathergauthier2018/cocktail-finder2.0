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

Cocktail Finder — All Rights Reserved License  
Copyright © 2025 Heather Gauthier

All rights reserved.

This project, including all code, designs, documentation, and assets, is protected under copyright
and remains the exclusive property of Heather Gauthier.

You MAY NOT:
- Copy or redistribute this code
- Use the code in a personal, commercial, or academic project
- Modify, adapt, or republish the code
- Use any part of the UI, logic, or features in your own apps
- Sell or sublicense any portion of the code
- Create derivative projects using this codebase

You MAY:
- View the project for learning or reference
- Clone the repository for personal, local-only use
- Inspect the logic for educational purposes

Future Development:
Cocktail Finder may evolve into a commercial application. Unauthorized reuse or republishing
of the code, including core features and concepts, is strictly prohibited.

Ownership:
All intellectual property rights remain with: Heather Gauthier.
No rights are granted to users other than the ability to view code.

Liability:
This software is provided “as is,” with no warranty of any kind. The owner is not liable for any issues
arising from viewing or referencing the code.

For licensing or commercial inquiries:
heathergauthier18@gmail.com

