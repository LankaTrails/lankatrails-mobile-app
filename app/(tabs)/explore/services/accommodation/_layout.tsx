import { Stack } from "expo-router";

export default function AccommodationLayout() {
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
          title: "Accommodation Details",
        }}
      />
    </Stack>
  );
}
