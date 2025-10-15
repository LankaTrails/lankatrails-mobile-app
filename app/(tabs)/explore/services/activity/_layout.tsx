import { Stack } from "expo-router";

export default function ActivityLayout() {
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
          title: "Activity Details",
        }}
      />
    </Stack>
  );
}
