# ImPortal

A cross-platform e-commerce app built with React Native and Expo. Browse products from the [Fake Store API](https://fakestoreapi.com), filter by category, manage a shopping cart, and experience a responsive UI that adapts between mobile and web.

## Features

- **Authentication** — Login with token-based auth
- **Product catalog** — Grid layout with search and category filtering
- **Product detail** — Full product info with quantity selector and add-to-cart
- **Shopping cart** — Add, remove, and review items before checkout
- **Responsive design** — Dedicated layouts for web (4-column grid, horizontal navbar) and mobile (2-column grid, hamburger menu)
- **Pull to refresh** — Reload product list with a swipe gesture on mobile

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) (SDK 52) |
| Navigation | [Expo Router](https://expo.github.io/router) (file-based) |
| Language | TypeScript |
| State | React Context API |
| Styling | React Native StyleSheet |
| API | [Fake Store API](https://fakestoreapi.com) |

## Project structure

```
app/
  _layout.tsx          # Root layout, navigation config, providers
  index.tsx            # Auth redirect (login / products)
  login.tsx            # Login screen
  products/
    index.tsx          # Product listing with search and filters
    [id].tsx           # Product detail screen
  cart.tsx             # Shopping cart screen

components/
  CartButton.tsx       # Header cart icon with item count badge
  CategoryModal.tsx    # Bottom sheet for category filtering (mobile)
  ProductCard.tsx      # Reusable product card for the grid
  Toast.tsx            # Animated success notification

context/
  AuthContext.tsx      # Authentication state (token)
  CartContext.tsx      # Cart state (items, totals, actions)

services/
  api.ts               # Fake Store API client

constants/
  theme.ts             # Colors, spacing, border radius tokens

types/
  index.ts             # Product type definition
```

## Getting started

1. Install dependencies

```bash
npm install
```

2. Start the development server

```bash
npx expo start
```

Then choose your target from the terminal:

- Press `w` to open in the browser
- Press `a` to open in an Android emulator
- Press `i` to open in an iOS simulator
- Scan the QR code with [Expo Go](https://expo.dev/go) on your device

## Test credentials

The app connects to the public Fake Store API. Use these credentials to log in:

```
Username: mor_2314
Password: 83r5^_
```
