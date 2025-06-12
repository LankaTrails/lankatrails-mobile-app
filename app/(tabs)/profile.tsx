import { StyleSheet, Text, View } from "react-native";
import React from "react";
import ServiceCard from "@/components/ServiceCard";

const profile = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-6xl font-bold">
        <Text className="text-primary">Profile</Text>
      </Text>
      <ServiceCard/>
    </View>
  );
};

export default profile;

const styles = StyleSheet.create({});
