import { Stack } from "expo-router";

export default function PlacesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[placeId]"
        options={{
          headerShown: false,
          title: "Place Details",
        }}
      />
    </Stack>
  );
}
