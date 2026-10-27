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

# NOIRÉ — Premium Perfume Store

A modern, elegant e-commerce perfume store built with React.js and Node.js. NOIRÉ offers a premium shopping experience with a refined interface, product browsing, cart functionality, and online payment integration.

## ✨ Features

- Premium, responsive user interface
- Perfume product browsing
- Shopping cart functionality
- React.js frontend
- Node.js and Express.js backend
- Razorpay payment gateway integration
- Payment verification on the server
- Environment-based configuration
- Vercel deployment support

## 🛠️ Tech Stack

**Frontend**
- React.js
- JavaScript
- HTML5
- CSS3

**Backend**
- Node.js
- Express.js
- REST APIs

**Payment Gateway**
- Razorpay

**Deployment**
- Vercel

## 📁 Project Structure

The project structure may vary depending on your implementation.

```text
noire-perfume-store/
├── public/
├── src/
├── server/
│   └── server.js
├── .gitignore
├── package.json
├── README.md
└── .env
```

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- Git
- A GitHub account
- Razorpay account for payment integration

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/noire-perfume-store.git
cd noire-perfume-store
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Install Dependencies

Install the frontend dependencies from the directory containing the frontend `package.json`:

```bash
npm install
```

If the backend has a separate `package.json`, navigate to the backend directory and install its dependencies separately.

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the appropriate backend directory and configure the variables required by your application.

Example:

```env
PORT=5000
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Use the exact variable names expected by your existing code. If your frontend needs the Razorpay Key ID, configure the appropriate frontend environment variable for your build tool.

**Security:** Never commit your `.env` file or expose your Razorpay Key Secret in frontend code. Add `.env` to `.gitignore`.

### 4. Run the Application Locally

Start the frontend from its project directory:

```bash
npm start
```

For Vite-based projects, use:

```bash
npm run dev
```

Start the backend from the directory containing the server's `package.json`:

```bash
node server.js
```

Use the scripts defined in your actual `package.json` files. Your frontend and backend may run on separate local ports.

## 💳 Razorpay Integration

The payment integration is designed to support the following flow:

1. The customer initiates checkout.
2. The backend creates a Razorpay order.
3. Razorpay Checkout opens on the frontend.
4. The customer completes the payment.
5. The backend verifies the payment signature.
6. The application displays the appropriate payment result.

For production, verify payments on the server and confirm the payment status before treating an order as paid.

## ☁️ Deployment on Vercel

The project has been deployed on Vercel.

General deployment steps:

1. Push the latest code to GitHub.
2. Import the repository into Vercel.
3. Configure the correct project root and build settings.
4. Add the required environment variables in Vercel Project Settings.
5. Deploy the application.
6. Test the live website and payment flow.

**Important:** If the backend is deployed separately or uses a Vercel serverless function, configure the API routes and frontend API base URL accordingly. A traditional Express server may require adaptation for Vercel serverless deployment.

Never expose secret environment variables in frontend builds.

## 🔐 Security

- Keep API secrets in environment variables.
- Exclude `.env` files from Git.
- Never expose payment secrets in browser code.
- Verify payment signatures on the backend.
- Use HTTPS for production.
- Configure production API URLs and allowed origins appropriately.

## 📌 Future Improvements

- User authentication
- Product search and filtering
- Product reviews and ratings
- Order history
- Inventory management
- Improved checkout and order tracking

## 👨‍💻 Author

**NOIRÉ Project**

Built with React.js and Node.js.

## 📄 License

This project is currently intended for learning and development. Add a license if you plan to distribute or reuse the code publicly.

