import { Stack } from "expo-router";

export default function SupportLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="complaints"
        options={{
          headerShown: false,
          title: "Complaints",
        }}
      />
    </Stack>
  );
}
