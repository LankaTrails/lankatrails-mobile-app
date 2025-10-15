import { Stack } from "expo-router";

export default function ServicesLayout() {
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
          title: "Service Details",
        }}
      />
      <Stack.Screen
        name="provider"
        options={{
          headerShown: false,
          title: "Service Provider",
        }}
      />
      <Stack.Screen
        name="accommodation"
        options={{
          headerShown: false,
          title: "Accommodation",
        }}
      />
      <Stack.Screen
        name="activity"
        options={{
          headerShown: false,
          title: "Activity",
        }}
      />
      <Stack.Screen
        name="food-beverage"
        options={{
          headerShown: false,
          title: "Food & Beverage",
        }}
      />
      <Stack.Screen
        name="tour-guide"
        options={{
          headerShown: false,
          title: "Tour Guide",
        }}
      />
      <Stack.Screen
        name="transport"
        options={{
          headerShown: false,
          title: "Transport",
        }}
      />
    </Stack>
  );
}
