import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";

/** Return URL for Stripe bank redirects (3-D Secure etc.): hands the URL to Stripe, then goes back. */
export default function StripeRedirect() {
  const { handleURLCallback } = useStripe();
  const url = Linking.useURL();

  useEffect(() => {
    if (!url) return;
    handleURLCallback(url).finally(() => {
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)/trips");
    });
  }, [url, handleURLCallback]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#008080" />
    </View>
  );
}
