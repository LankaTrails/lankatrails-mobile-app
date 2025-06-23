import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide the header for the explore screen
      }}
    />
  );
}
