# 🍔 QuickBite — Frontend Client

The frontend application for **QuickBite**, a real-time food delivery and order management web app built with **React 18**, **Vite**, **Material UI (MUI v6)**, **Tailwind CSS**, and **Socket.io Client**.

---

## 🚀 Features

- **Food Menu Catalog**: Category filtering, real-time search, interactive food item cards with quantity toggles.
- **Cart & Checkout**: Slide-out cart drawer, tax/delivery fee calculation, delivery notes, and address validation.
- **Real-Time Order Tracking**: Visual 5-step status timeline (`Placed` ➔ `Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`) updated instantly via WebSockets without page reload.
- **Role-Based Authentication**: Seamless modal login/signup supporting Customer and Kitchen Staff roles with persistent JWT authentication.
- **Kitchen & Admin Dashboard**: Real-time kitchen board to accept, advance, and manage incoming orders.
- **Mobile Responsive**: Fully responsive design across smartphones, tablets, and desktop viewports.

---

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **UI & Styling**: Material UI (MUI v6), Tailwind CSS, Lucide React Icons
- **State & Context**: React Context API (`AuthContext`, `CartContext`, `SocketContext`)
- **Real-Time Communication**: Socket.io Client
- **HTTP Client**: Axios with request/response interceptors
- **Testing**: Vitest & React Testing Library (Unit tests), Playwright (E2E tests)

---

## 💻 Getting Started

### 1. Prerequisites
- Node.js `>= 18.0.0`
- npm `>= 9.0.0`

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```

Ensure `.env` points to your backend:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Running the Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run Playwright End-to-End tests
npm run test:e2e
```

---

## 🌐 Deploying to Vercel

1. Push this repository to your GitHub account (e.g. `quickbite-frontend`).
2. Log into [Vercel](https://vercel.com) and click **Add New... ➔ Project**.
3. Import your `quickbite-frontend` repository.
4. Framework Preset will auto-detect as **Vite**.
5. Configure Environment Variables:
   - `VITE_API_URL`: `https://<your-backend-url>.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://<your-backend-url>.onrender.com`
6. Click **Deploy**. Single-page app routing is pre-configured via `vercel.json`.
