import { Stack } from "expo-router";

export default function ServicesLayout() {
  return (
    <Stack>
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
    </Stack>
  );
}
