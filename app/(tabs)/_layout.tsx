import { Tabs } from "expo-router";
import { Animated, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          paddingVertical: 8,
          marginBottom:30,
          height: 70,
          borderRadius: 50, // reduced border radius
          marginLeft: 10, // reduced margin
          marginRight: 10, // reduced margin
        },
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "index") iconName = "home";
          else if (route.name === "explore") iconName = "search";
          else if (route.name === "trips") iconName = "restaurant";
          else if (route.name === "profile") iconName = "person";
          else if (route.name === "testing") iconName = "filter";
        
          // Wrap active tab icon with teal background
          if (focused) {
            return (
              <View
                style={{
                  height:50,
                  width:50,
                  backgroundColor: "#008080", 
                  padding: 4, // reduced padding
                  borderRadius: 50, // reduced border radius
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 0.5, // reduced shadow height
                  },
                  shadowOpacity: 0.18, // reduced opacity
                  shadowRadius: 0.5, // reduced shadow radius
                }}
              >
<Ionicons
    name={iconName}
    size={focused ? 18 : 24}
    color={focused ? "#fff" : color}
    style={focused ? {
      backgroundColor: "#008080",
      borderRadius: 16,
      padding: 11,
      justifyContent: "center",
      alignItems: "center",
    } : {}}
  />    </View>
            );
          }

          return <Ionicons name={iconName} size={24} color={color} 
                  style={{
                    justifyContent: "center",
      alignItems: "center",
      marginTop: 10, // reduced margin top
                  }}

                  

          />;
        },
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="trips" options={{ title: "Trips" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
            <Tabs.Screen name="testing" options={{ title: "Testing" }} />

    </Tabs>
  );
}
