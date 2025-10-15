import HeaderSection from "@/components/explorer-components/HeaderSection";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ServiceDetailRouter = () => {
  const { serviceId, category } = useLocalSearchParams<{
    serviceId: string;
    category:
      | "ACCOMMODATION"
      | "ACTIVITY"
      | "FOOD_BEVERAGE"
      | "TOUR_GUIDE"
      | "TRANSPORT";
  }>();

  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    if (!serviceId || !category) {
      router.back();
      return;
    }

    // Redirect to appropriate category-specific page
    const redirectToCategory = () => {
      switch (category) {
        case "ACCOMMODATION":
          router.replace(`/explore/services/accommodation/${serviceId}` as any);
          break;
        case "ACTIVITY":
          router.replace(`/explore/services/activity/${serviceId}` as any);
          break;
        case "FOOD_BEVERAGE":
          router.replace(`/explore/services/food-beverage/${serviceId}` as any);
          break;
        case "TOUR_GUIDE":
          router.replace(`/explore/services/tour-guide/${serviceId}` as any);
          break;
        case "TRANSPORT":
          router.replace(`/explore/services/transport/${serviceId}` as any);
          break;
        default:
          router.back();
      }
    };

    // Small delay to ensure proper navigation
    const timer = setTimeout(redirectToCategory, 100);

    return () => clearTimeout(timer);
  }, [serviceId, category]);

  // Loading state while redirecting
  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderSection title="Loading Service..." onBack={() => router.back()} />
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#008080" />
        <Text className="mt-4 text-gray-600">
          Redirecting to service details...
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ServiceDetailRouter;
