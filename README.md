# LankaTrails Mobile App

[![CI](https://github.com/LankaTrails/lankatrails-mobile-app/actions/workflows/ci.yml/badge.svg)](https://github.com/LankaTrails/lankatrails-mobile-app/actions/workflows/ci.yml)

The tourist app of [LankaTrails](https://github.com/LankaTrails/lankatrails-backend), a travel
platform for Sri Lanka. Tourists discover places and local services, plan trips with friends, book
and pay providers, and chat with them in real time.

## Features

- **Explore:** search a city, use your current location or pin a spot on the map; see popular
  places (Google Places) next to bookable services from LankaTrails providers.
- **Service details:** accommodation, tour guides, transport, activities and food & beverage, with
  photos, policies, prices, reviews and the provider's profile.
- **Trip planning:** trips with a day-by-day schedule, a route map, group members invited by link,
  and a budget with categories and expenses.
- **Bookings and payments:** availability checks and Stripe PaymentSheet checkout.
- **Chat:** real-time messaging with providers and trip groups.
- **Account:** favourites, reviews, complaints with photos, notification settings and profile.

## Tech stack

Expo SDK 58 · React Native 0.88 · React 19 · TypeScript · Expo Router · NativeWind (Tailwind) ·
Redux Toolkit · Axios · STOMP over SockJS · Stripe React Native · React Native Maps · Reanimated

## Run it

The app talks to the LankaTrails backend, so start the backend stack first by following the
[backend README](https://github.com/LankaTrails/lankatrails-backend#run-the-whole-system-with-docker)
(this repo should sit next to `lankatrails-backend`).

### 1. Configure

```bash
cp .env.example .env
```

A phone can't reach `localhost` on your computer, so point the app at your machine's LAN IP:

```
EXPO_PUBLIC_API_URL=http://192.168.1.20:8080/api
EXPO_PUBLIC_URL=http://192.168.1.20:8080
```

The Google, Stripe and OpenWeather keys are optional; features that need a missing key are hidden or
show an empty state.

### 2. Start the dev server (Docker)

From `lankatrails-backend`:

```bash
MOBILE_PACKAGER_HOST=192.168.1.20 MOBILE_METRO_BIND=0.0.0.0 \
  docker compose -f docker-compose.dev.yml --profile mobile run --rm --service-ports mobile-app
```

Scan the QR code with **Expo Go** (SDK 58) on a phone on the same Wi-Fi. Press `r` in the terminal
to reload. Dependencies are installed inside the container, and reinstalled automatically when
`package-lock.json` changes.

Without Docker, use Node 24 and run `npm ci && npx expo start --go` instead.

### 3. Sign in

Load the demo data from the backend (`./docker/seed/load-seed.sh`), then sign in as
`tourist@lankatrails.dev` with the `DEMO_USER_PASSWORD` from the backend's `.env`. You can also sign up
for a new tourist account; the verification email needs the backend's mail settings.

## Environment variables

Only `EXPO_PUBLIC_*` variables reach the app, and anything in the bundle can be extracted: never put
server secrets here. Restart the dev server after changing `.env`.

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend REST API, e.g. `http://<LAN IP>:8080/api` |
| `EXPO_PUBLIC_URL` | Backend origin for uploaded images and the `/ws` chat endpoint |
| `EXPO_PUBLIC_SCHEME` | Deep-link scheme, also the Stripe return URL |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Native Google Maps SDK |
| `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` | Place search, details and photos (needs billing enabled) |
| `EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY` | Trip route map; falls back to the Places key |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`); payments are off without it |
| `EXPO_PUBLIC_OPENWEATHER_API_KEY` | Trip weather; the card is hidden without it |

Restrict Google keys to the APIs they use and to the app's bundle ID / package name.

## Checks

```bash
npm run typecheck     # tsc --noEmit
npx eslint .
npm run doctor        # expo-doctor: SDK version alignment and config
```

In Docker, prefix any of them with
`docker compose -f docker-compose.dev.yml run --rm --no-deps mobile-app` from `lankatrails-backend`.
GitHub Actions runs all three on every push and pull request.

## Project layout

```
app/          screens and navigation (Expo Router, file-based)
  (auth)/     sign in and sign up
  (tabs)/     home, explore, trips and profile tabs
components/   shared UI
services/     API clients (backend, Google, weather)
redux/        store and slices (auth)
utils/        config, token handling, logging
types/        shared TypeScript types
```

## Screenshots

<!-- Screenshots and GIFs of the app go here. -->

_Coming soon._

## License

[MIT](LICENSE)
