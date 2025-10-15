import { Stack } from "expo-router";

export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="results"
        options={{
          headerShown: false,
          title: "Search Results",
        }}
      />
    </Stack>
  );
}
