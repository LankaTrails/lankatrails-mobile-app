import * as Linking from "expo-linking";
import { STRIPE_PUBLISHABLE_KEY } from "@/utils/config";
import { useState } from "react";
import { Alert } from "react-native";
import {
  useStripe,
  initPaymentSheet,
  presentPaymentSheet,
} from "@stripe/stripe-react-native";
import { createBooking, confirmBooking } from "@/services/bookingService";
import type { PaymentRequest } from "@/types/bookingTypes";
import { logger } from "@/utils/logger";

interface PaymentGatewayProps {
  onPaymentStart?: () => void;
  onPaymentSuccess?: (
    bookingId: number,
    paymentAmount: number,
    currency: string
  ) => void;
  onPaymentFailure?: (error: string) => void;
  onPaymentCancel?: () => void;
}

interface PaymentGatewayReturn {
  processPayment: (tripItemId: number) => Promise<void>;
  isProcessing: boolean;
}

export const usePaymentGateway = ({
  onPaymentStart,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentCancel,
}: PaymentGatewayProps): PaymentGatewayReturn => {
  const stripe = useStripe();
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = async (tripItemId: number): Promise<void> => {
    if (!stripe) {
      const errorMsg = "Stripe is not initialized. Please try again.";
      onPaymentFailure?.(errorMsg);
      Alert.alert("Error", errorMsg);
      return;
    }

    if (isProcessing) {
      Alert.alert("Processing", "Please wait, payment is being processed...");
      return;
    }

    setIsProcessing(true);
    if (!STRIPE_PUBLISHABLE_KEY) {
      Alert.alert("Payments unavailable", "Card payments are not configured in this build.");
      return;
    }
    onPaymentStart?.();

    try {
      // Step 1: Create booking and get payment intent
      const bookingResponse = await createBooking(tripItemId);

      if (!bookingResponse.success || !bookingResponse.data) {
        const errorMsg = bookingResponse.message || "Failed to create booking";
        onPaymentFailure?.(errorMsg);
        Alert.alert("Error", errorMsg);
        return;
      }

      const paymentRequest: PaymentRequest = bookingResponse.data;
      const {
        bookingId,
        paymentIntentId,
        clientSecret,
        paymentAmount,
        currency,
      } = paymentRequest;


      // Step 2: Initialize Payment Sheet with client secret
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "LankaTrails",
        paymentIntentClientSecret: clientSecret,
        style: "automatic", // Follows system theme
        allowsDelayedPaymentMethods: false,
        // Bank redirects (3-D Secure etc.) come back to app/stripe-redirect.tsx
        returnURL: Linking.createURL("stripe-redirect"),
      });

      if (initError) {
        logger.error("Payment Sheet init error:", initError);
        const errorMsg =
          initError.message ||
          "Could not initialize payment. Please try again.";
        onPaymentFailure?.(errorMsg);
        Alert.alert("Payment Setup Failed", errorMsg);
        return;
      }

      // Step 3: Present Payment Sheet (shows card input UI)
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        logger.error("Payment error:", paymentError);

        // Handle different error types
        if (paymentError.code === "Canceled") {
          onPaymentCancel?.();
          Alert.alert("Payment Canceled", "Payment was canceled by user.");
        } else {
          const errorMsg =
            paymentError.message ||
            "Payment could not be processed. Please try again.";
          onPaymentFailure?.(errorMsg);
          Alert.alert("Payment Failed", errorMsg);
        }
        return;
      }

      // Step 4: Payment successful - confirm booking with backend

      try {
        const confirmResponse = await confirmBooking(paymentIntentId);

        if (confirmResponse.success) {
          onPaymentSuccess?.(bookingId, paymentAmount, currency);

          Alert.alert(
            "Payment Successful! 🎉",
            `Your booking has been confirmed!\n\nBooking ID: ${bookingId}\nAmount Paid: ${paymentAmount} ${currency}`,
            [
              {
                text: "Great!",
                onPress: () => {
                },
              },
            ]
          );
        } else {
          // Payment went through but confirmation failed
          const errorMsg =
            "Payment was successful, but there was an issue confirming your booking. Please contact support.";
          logger.error(
            "Booking confirmation failed:",
            confirmResponse.message
          );
          onPaymentFailure?.(errorMsg);

          Alert.alert(
            "Payment Processed - Confirmation Pending",
            `${errorMsg}\n\nBooking ID: ${bookingId}\nPayment Intent ID: ${paymentIntentId}\nReference these IDs when contacting support.`,
            [
              {
                text: "Contact Support",
                onPress: () => {
                },
              },
            ]
          );
        }
      } catch (confirmError: any) {
        // Payment went through but confirmation failed
        const errorMsg =
          "Payment was successful, but we couldn't confirm your booking automatically. Please contact support.";
        logger.error("Booking confirmation error:", confirmError);
        onPaymentFailure?.(errorMsg);

        Alert.alert(
          "Payment Processed - Confirmation Error",
          `${errorMsg}\n\nBooking ID: ${bookingId}\nPayment Intent ID: ${paymentIntentId}\nError: ${confirmError.message}`,
          [
            {
              text: "Contact Support",
              onPress: () => {
              },
            },
          ]
        );
      }
    } catch (error: any) {
      // Booking creation failed
      const errorMsg =
        error.message || "Failed to create booking. Please try again.";
      logger.error("Booking creation error:", error);
      onPaymentFailure?.(errorMsg);
      Alert.alert("Booking Error", errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
  };
};

// Export default hook for easier imports
export default usePaymentGateway;
