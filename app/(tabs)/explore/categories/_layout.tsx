import { Stack } from "expo-router";

export default function CategoriesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[category]"
        options={{
          headerShown: false,
          title: "Category Listing",
        }}
      />
    </Stack>
  );
}
