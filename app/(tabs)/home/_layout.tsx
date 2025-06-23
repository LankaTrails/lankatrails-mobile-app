import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide the header for the home screen
      }}
    />
  );
}
