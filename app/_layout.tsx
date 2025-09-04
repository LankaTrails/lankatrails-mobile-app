// app/_layout.tsx
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import "@/app/globals.css";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { StripeProvider } from "@stripe/stripe-react-native";

// Only if you're using persistence (optional)
const persistor = persistStore(store);

// Stripe publishable key (use your test key for development)
const STRIPE_PUBLISHABLE_KEY = "pk_test_51S2Xb6DdM2gdqwVS3sPgDnRnIOtC5mOsbttDp2wLd6PPUT9rzaRIFQjIwrs1qongTKnabp1NwrRs7GoDJQ1bpKfD00qzeWJFWV"; // Replace with your actual Stripe publishable key

export default function RootLayout() {
  return (
    <Provider store={store}>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        {/* Remove AuthProvider since we're using Redux only */}
        {/* Optional: Add PersistGate if you want to persist your Redux state */}
        {/* <PersistGate loading={null} persistor={persistor}> */}
        <Stack screenOptions={{ headerShown: false, animation: "none" }} />
        {/* </PersistGate> */}
      </StripeProvider>
    </Provider>
  );
}
