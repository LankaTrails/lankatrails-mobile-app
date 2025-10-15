import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

import { useAuth } from "@/hooks/useAuth";
import { acceptTripInvitation } from "@/services/tripService";

export default function InviteScreen() {
  const { token } = useLocalSearchParams(); // invite token from URL
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link");
      return;
    }

    if (isLoading) return; // wait for auth state

    if (!user) {
      // not logged in → redirect to login, pass invite token
      router.replace({
        pathname: "/(auth)/signIn" as any,
        params: {
          redirect: `/invite/${Array.isArray(token) ? token[0] : token}`,
        },
      });
      return;
    }

    // logged in → call backend to join trip
    const handleJoin = async () => {
      setIsProcessing(true);
      setError(null);

      try {
        const tokenString = Array.isArray(token) ? token[0] : token;
        const response = await acceptTripInvitation(tokenString);

        if (response.success) {
          Alert.alert(
            "Success!",
            response.message || "You have successfully joined the trip!",
            [
              {
                text: "OK",
                onPress: () => router.replace("/(tabs)/trips" as any),
              },
            ]
          );
        } else {
          throw new Error(response.message || "Failed to join trip");
        }
      } catch (err: any) {
        console.error("Failed to join trip:", err);
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Invitation expired or invalid";
        setError(errorMessage);

        Alert.alert("Error", errorMessage, [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/home" as any),
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    };

    handleJoin();
  }, [user, isLoading, token, router]);

  // Show loading or error state
  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <Text className="text-red-500 text-center text-lg mb-4">{error}</Text>
        <Text className="text-gray-600 text-center">
          Please check your invitation link and try again.
        </Text>
      </View>
    );
  }

  if (isProcessing || isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600 text-center">
          {isLoading ? "Loading..." : "Joining trip..."}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="mt-4 text-gray-600 text-center">
        Processing invitation...
      </Text>
    </View>
  );
}
