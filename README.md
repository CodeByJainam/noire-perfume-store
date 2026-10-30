# NOIRÉ — React fragrance store

A responsive React + Vite perfume storefront with an Express API, local cart
persistence, product browsing, collections, About and Journal pages, and
Razorpay checkout integration.

## Requirements

- Node.js 22.12+ (Node.js 24 is also suitable)
- npm
- MongoDB Atlas connection string for live database data
- Razorpay Test Mode API keys to test checkout

## Install

From the project root:

```bash
npm install
cd server
npm install
copy .env.example .env
```

Edit `server/.env` with your own MongoDB URI and Razorpay **test** keys.
Never commit or share this file. If the MongoDB password has special characters,
URL-encode them in the URI.

## Run locally

Terminal 1 — API:

```bash
cd server
npm start
```

Check the API at <http://localhost:5000/api/health>.

Terminal 2 — frontend, from the project root:

```bash
npm run dev
```

Open the local URL printed by Vite, usually <http://localhost:5173>.

The frontend cart is stored in the browser so it survives page refreshes and
does not depend on an in-memory server cart. During local development, the API
can return the checked-in seed catalogue if MongoDB is unavailable. The
`/api/health` route remains available while the database is disconnected.
Payment creation still requires valid Razorpay Test Mode keys; a successful
payment flow also requires the Razorpay order/payment APIs to be reachable.

## Seed the database

Once `MONGO_URI` is valid and MongoDB Atlas Network Access allows your IP:

```bash
cd server
node seedProducts.js
```

This upserts the sample NOIRÉ catalogue into the database.

## API endpoints

- `GET /api/health` — API and dependency status
- `GET /api/products` — catalogue
- `/api/cart` — legacy in-memory cart endpoints (the React UI uses browser storage)
- `POST /api/payments/create-order` — server-calculated Razorpay order
- `POST /api/payments/verify` — signature and captured-payment verification
- `POST /api/payments/webhook` — optional signature-verified webhook endpoint

## Vercel

The `api/[...path].js` function forwards API requests to the Express app.
Configure environment variables in Vercel; the local `.env` file is not deployed.
If the frontend and API share one origin, leave `VITE_API_URL` unset. For
separate deployments, set it to the backend origin and configure `CLIENT_URL`
as the frontend origin. Redeploy after changing variables.

## Important notes

- Never put `RAZORPAY_KEY_SECRET` or `MONGO_URI` in frontend variables.
- Rotate any database credentials that have been exposed.
- The local seed catalogue is a demo catalogue. For production, keep MongoDB
  available and seed the same product IDs/prices into the database.
- The app verifies Razorpay signatures and checks the fetched Razorpay order
  against the captured payment. Persistent order history/inventory is not yet
  implemented; add an Order model before operating a real commercial store.


## Database-only product catalogue

The frontend and API now load products exclusively from MongoDB. There is no local demo-catalogue fallback. If MongoDB is unavailable, the product API returns an error instead of demo products. Ensure the Atlas database has product documents in the collection mapped by `server/models/Product.js`.
