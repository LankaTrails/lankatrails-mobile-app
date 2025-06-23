import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide the header for the profile screen
      }}
    />
  );
}
