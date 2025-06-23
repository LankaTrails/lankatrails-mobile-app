import { Stack } from 'expo-router';

export default function TripsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide the header for the trips screen
      }}
    />
  );
}
