import { useEffect } from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { StripeProvider } from "@stripe/stripe-react-native";
import { store } from "@/redux/store";
import { checkAuth } from "@/redux/slices/authSlice";
import { APP_SCHEME, STRIPE_PUBLISHABLE_KEY } from "@/utils/config";
import "@/app/globals.css";

export default function RootLayout() {
  // Restore the stored session once, whichever route the app was opened on (including deep links)
  useEffect(() => {
    store.dispatch(checkAuth());
  }, []);

  return (
    <Provider store={store}>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} urlScheme={APP_SCHEME}>
        <Stack screenOptions={{ headerShown: false, animation: "none" }} />
      </StripeProvider>
    </Provider>
  );
}
