import { Stack } from "expo-router";

export default function FoodBeverageLayout() {
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
          title: "Food & Beverage Details",
        }}
      />
    </Stack>
  );
}
