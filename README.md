=======
# 🍹 Cocktail Finder 2.0 — A Lightweight Cocktail Explorer

**Cocktail Finder** is a lightweight, fast, and friendly single-page cocktail discovery app powered by **TheCocktailDB**.  
It’s designed for quick inspiration and low-friction browsing: generate a random drink, search by name, and save favorites — all in a clean, approachable interface.

👉 **Live Demo:**  
https://heathergauthier2018.github.io/cocktail-finder2.0/

---

## ✨ What This Project Demonstrates

Cocktail Finder showcases front-end fundamentals, API integration, and thoughtful UX in a small, focused project.

### 🎨 Product & UX

- Simple, **approachable interface** (no sign-in, no clutter)  
- Clear separation of modes: **Random**, **Search**, and **Favorites**  
- Intuitive buttons and flows (“Generate”, “Search”, “Save to Favorites”)  
- Friendly empty states and helpful defaults  
- Designed to feel fun and light, not overly technical

### ⚙️ Front-End Engineering

- Single-page architecture with **vanilla JavaScript**  
- Clean separation between:
  - Fetching data from the API
  - Rendering UI views
  - Managing favorites in `localStorage`
- Dynamic DOM updates (no frameworks required)  
- Basic responsiveness for desktop, tablet, and mobile  

### 🌐 API Integration

- Uses **TheCocktailDB** REST API  
- Handles:
  - Random cocktail retrieval  
  - Search by name / partial name  
  - Safely reading response data (name, image, ingredients, etc.)

---

## 🌞 Core Features

### 🍀 Random Cocktail Generator

- Fetches a **completely random** cocktail  
- Displays:
  - Drink name  
  - Image  
  - Ingredients + measurements  
  - Instructions  
  - Glass type  
- “Generate another” button for quick inspiration  
- One-click option to **save to Favorites**

---

### 🔍 Search by Name

- Search cocktails by **full or partial name**  
- Results rendered in a clean card layout  
- Each card shows:
  - Drink name  
  - Thumbnail image  
  - Quick access to details  
- Ability to favorite from search results

---

### ❤️ Favorites (localStorage)

- Save any drink as a **favorite**  
- Favorites are stored in **`localStorage`**  
- Persist across browser sessions  
- Dedicated **Favorites view** to:
  - Browse saved cocktails  
  - Re-open details  
  - Remove drinks from favorites

---

### 📱 Responsive & Accessible

- Works on desktop, tablet, and mobile  
- Focus on:
  - Readable text  
  - Clear spacing  
  - Semantic structure where possible  
- A good base for future accessibility improvements

---

## 🧱 Tech Stack

- **HTML5**  
- **CSS3**  
- **JavaScript** (vanilla JS)  
- **TheCocktailDB API**  
- **localStorage** for persistence  

---

## 📂 Project Structure

```text
COCKTAIL-FINDER2.0/
│── .vscode/           # Editor/project settings (optional)
│── img/               # Images & icons
│
│── index.html         # Main UI shell
│── script.js          # App logic (fetching, rendering, state)
│── styles.css         # Layout & styling
│
└── README.md          # Project documentation
```

---

## 🚀 Running Cocktail Finder Locally

You can run this project locally without any special build steps.

### 1️⃣ Clone the repository

```bash
git clone https://github.com/heathergauthier2018/cocktail-finder2.0.git
cd cocktail-finder2.0
```

### 2️⃣ Open the app

Option A — Directly open the file:

- Open `index.html` in your browser (double-click or drag into a browser window).

Option B — Use a simple local server (optional, but nice for dev):

```bash
# Using Python 3
python -m http.server 8000

# Then visit:
# http://localhost:8000
```

---

## 🔌 API Endpoints Used

### 🎲 Random Cocktail

```http
GET https://www.thecocktaildb.com/api/json/v1/1/random.php
```

Used for the **Random** view to fetch a single random cocktail.

### 🔍 Search by Name

```http
GET https://www.thecocktaildb.com/api/json/v1/1/search.php?s={query}
```

Used for the **Search** view to find cocktails by full or partial name.

---

## 🧩 High-Level Architecture

`script.js` is organized around a simple, readable flow:

```text
script.js
│
├── fetchRandomDrink()       # Calls the API for a random cocktail
├── fetchBySearch(query)     # Calls the API using the search endpoint
│
├── renderRandomView(drink)  # Renders the random cocktail UI
├── renderSearchResults(list)# Renders search results as cards
├── renderFavorites()        # Renders all saved favorites
│
├── saveFavorite(drink)      # Saves a drink to localStorage
├── removeFavorite(id)       # Removes a drink from favorites
└── loadFavorites()          # Loads favorites from localStorage on startup
```

This keeps:

- **Data fetching** (API calls)  
- **State management** (favorites, current view)  
- **UI rendering** (DOM updates)  

logically separated but still very simple.

---

## 🌱 Future Enhancements Roadmap

These are planned or aspirational improvements for future versions of Cocktail Finder.

### 🌱 Short-Term Enhancements

- Ingredient / category / glass filtering  
- Clickable ingredients (e.g., click “rum” → see more rum drinks)  
- Non-alcoholic mode (mocktail-only results)  
- Improved mobile layout & spacing  
- Better empty states for:
  - “No results found”  
  - Empty favorites list  

### 🌿 Medium-Term Enhancements

- Ingredient chips/badges on search results  
- Light animations & transitions for view changes  
- Copy / share ingredients and instructions  
- Lightweight grouping/sorting options for favorites  
- Recently viewed cocktails list  

### 🌳 Long-Term / Stretch Ideas

- **“Build My Bar”**: user enters ingredients they have → suggested drinks  
- “Missing ingredients” helper  
- Export favorites or shopping list  
- Flavor / mood-based discovery:
  - Tropical  
  - Citrus  
  - Cozy  
  - Refreshing  
  - Dessert-style  
- Visual exploration of related drinks (graph-style or collections)

---

## 📝 License — All Rights Reserved

**Cocktail Finder © 2025 — Heather Gauthier**

All rights reserved.

This project, including all source code, designs, assets, and documentation, is the exclusive property of the creator.

### You MAY NOT:

- Copy, redistribute, or republish this code  
- Use the code in personal, academic, or commercial projects  
- Modify and release derivative versions of this project  
- Use any part of the UI, logic, or design in your own applications  
- Sell, sublicense, or bundle the project as part of another product  

For licensing or commercial inquiries:  
📧 **heathergauthier18@gmail.com**
