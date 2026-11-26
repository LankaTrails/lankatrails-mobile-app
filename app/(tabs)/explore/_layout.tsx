import { Stack } from "expo-router";

export default function ExploreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Explore",
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          title: "Search",
        }}
      />
      <Stack.Screen
        name="services"
        options={{
          headerShown: false,
          title: "Services",
        }}
      />
      <Stack.Screen
        name="places"
        options={{
          title: "Places",
        }}
      />
      <Stack.Screen
        name="support"
        options={{
          title: "Support",
        }}
      />
    </Stack>
  );
}
