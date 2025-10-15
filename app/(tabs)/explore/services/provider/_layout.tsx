import { Stack } from "expo-router";

export default function ProviderLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[providerId]"
        options={{
          headerShown: false,
          title: "Provider Details",
        }}
      />
    </Stack>
  );
}
