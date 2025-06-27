import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Or customize as needed
        animation: 'fade',  // You can use 'slide_from_right', 'none', etc.
      }}
    />
  );
}
