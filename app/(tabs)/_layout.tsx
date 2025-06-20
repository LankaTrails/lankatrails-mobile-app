import { Tabs } from "expo-router";
import { View, StyleSheet,TouchableOpacity,Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
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
          position: 'absolute', // Helps with proper positioning
          bottom: 10, // Distance from bottom
          left: 16,
          right: 16,
          elevation: 1, // For Android shadow
          shadowColor: '#000', // For iOS shadow
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,

        },
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "index") iconName = "home";
          else if (route.name === "explore") iconName = "search";
          else if (route.name === "trips") iconName = "restaurant";
          else if (route.name === "profile") iconName = "person";
          else if (route.name === "testing") iconName = "filter";

          return (
            <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
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
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="trips" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="testing" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    marginTop:32,
    backgroundColor: "#008080",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  inactiveIconContainer: {
    marginTop:32,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 50,
  }
});