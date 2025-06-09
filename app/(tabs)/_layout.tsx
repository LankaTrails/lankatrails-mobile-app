import { Tabs } from "expo-router";
import { ImageBackground, Image, Text, View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
            headerShown: false,
        }}
      />

      <Tabs.Screen
        name="trips"
        options={{
          title: "Trips",
            headerShown: false,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
