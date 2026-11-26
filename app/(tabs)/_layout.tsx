import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";

export default function TabsLayout() {
  const { isAuthenticated, initialized } = useAuth();

  // Every tab needs a signed-in tourist; this also catches a session that expires while in use
  if (!initialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }
  if (!isAuthenticated) {
    return <Redirect href="/signIn" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        // tabBarActiveBackgroundColor: "#008080", // Uncomment and set a color if needed
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#9CA3AF",

        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0, // Removed top border
          height: 70,
          borderRadius: 35, // Half of height for pill shape
          marginHorizontal: 16, // Consistent horizontal margin
          marginBottom: 16,
          position: "absolute", // Helps with proper positioning
          bottom: 10, // Distance from bottom
          left: 16,
          right: 16,
          elevation: 1, // For Android shadow
          shadowColor: "#000", // For iOS shadow
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const name = route.name.split("/")[0]; // Extract main tab name

          let iconName: keyof typeof Ionicons.glyphMap = "home";
          if (name === "home") iconName = "home";
          else if (name === "explore") iconName = "search";
          else if (name === "trips") iconName = "footsteps";
          else if (name === "profile") iconName = "person";

          return (
            <View
              style={
                focused
                  ? styles.activeIconContainer
                  : styles.inactiveIconContainer
              }
            >
              <Ionicons
                name={iconName}
                size={focused ? 24 : 22}
                color={focused ? "#fff" : color}
              />
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="trips" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIconContainer: {
    marginTop: 32,
    backgroundColor: "#008080",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  inactiveIconContainer: {
    marginTop: 32,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: 50,
  },
});
