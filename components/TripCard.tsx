import React from "react";
import { View, Text, StyleSheet, Dimensions, ImageBackground,TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface TripCardProps {
  title: string;
  details: string;
  budget: string;
  duration: string;
  onPress?: () => void;
}

const TripCard: React.FC<TripCardProps> = ({
  title,
  details,
  budget,
  duration,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <ImageBackground
        source={{ uri: "https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/9732566d-6b33-4a1a-ba0c-1b73ed8848a4/The+Common+Wanderer-9888.jpg" }}
        style={styles.image}
        imageStyle={{ borderRadius: 16 }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={styles.tripTitle}>{title}</Text>
          <Text style={styles.tripDetail}>{details}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Budget: <Text style={styles.info}>{budget}</Text>
            </Text>
            <Text style={styles.label}>
              Duration: <Text style={styles.info}>{duration}</Text>
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    borderRadius: 16,
  },
  gradient: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    borderRadius: 16,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  tripDetail: {
    fontSize: 14,
    paddingBottom: 20,
    color: "#e0e0e0",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontWeight: "600",
    fontSize: 14,
    color: "#fff",
  },
  info: {
    fontWeight: "400",
    color: "#fff",
  },
  card: {
  width: width - 48,
  height: 140,        
  marginBottom: 16,
  borderRadius: 16,
  overflow: "hidden",
  backgroundColor: "#f9fafb",
  alignSelf: "center",
  elevation: 4,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
},
image: {
  flex: 1,
  width: "100%",
  height: "100%",
},
  
});

export default TripCard;