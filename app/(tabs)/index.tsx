import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-6xl font-bold">
        <Text className="text-primary">Lanka</Text>
        <Text className="text-secondary">Trails</Text>
      </Text>
    </View>
  );
}
