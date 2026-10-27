# NOIRÉ — React fragrance store

A responsive React + Vite perfume storefront with an Express API. The interface uses a warm ivory, ink and burgundy palette with editorial typography, fragrance photography, responsive navigation, collection search/filter/sort, cart quantity controls, and dedicated About and Journal pages.

## Pages

- `/` — Home
- `/products` or `/shop` — Shop all fragrances
- `/collection` — Fragrance collection
- `/about` — NOIRÉ story
- `/blog` — Scent journal preview
- `/cart` — Shopping bag and order summary

## Requirements

Use a current Node.js release compatible with the Vite version in `package.json`.

## Install and run

Open a terminal in this project folder and install dependencies:

```bash
npm install
```

Start the Express API in terminal 1:

```bash
npm start
```

The API runs at `http://localhost:5000`.

Start the Vite frontend in terminal 2:

```bash
npm run dev
```

Open the local URL Vite prints in the terminal (usually `http://localhost:5173`).

## Notes

- Product and cart data are held in memory by the demo API. Restarting the API resets the cart and any products added through the API.
- Checkout, newsletter signup, customer support, inventory, accounts, and payment processing are not connected to live services.
- Fragrance photography loads from Unsplash, and the Google Fonts stylesheet loads DM Sans and Playfair Display. A fallback font stack is included.
- If you see an error about a missing Vite/Rolldown native binding, delete `node_modules` and reinstall dependencies with `npm install` in your local environment. Do not copy `node_modules` between different operating systems.
