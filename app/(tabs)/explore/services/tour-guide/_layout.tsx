import { Stack } from "expo-router";

export default function TourGuideLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="[serviceId]"
        options={{
          headerShown: false,
          title: "Tour Guide Details",
        }}
      />
    </Stack>
  );
}
