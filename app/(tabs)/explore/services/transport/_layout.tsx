import { Stack } from "expo-router";

export default function TransportLayout() {
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
          title: "Transport Details",
        }}
      />
    </Stack>
  );
}
