import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ToastAndroid,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import HeaderSection from "@/components/explorer-components/HeaderSection";
import { Star, MapPin, Clock, AlertCircle, Users } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import DestinationModal from "@/components/DestinationModal";
import TripNameModal from "@/components/TripNameModal";
import TripDetailsModal, { TripDetails } from "@/components/TripDetailsModal";

const { width } = Dimensions.get("window");

const ActivityDetailView = () => {
  const [isFavourite, setIsFavourite] = useState(false);
  const [tripAdded, setTripAdded] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const tripModalAnim = useRef(new Animated.Value(0)).current;
  const [tripType, setTripType] = useState("existing");
  const [selectedTrip, setSelectedTrip] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Modal flow states
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [showTripNameModal, setShowTripNameModal] = useState(false);
  const [showTripDetailsModal, setShowTripDetailsModal] = useState(false);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [tripName, setTripName] = useState("");
  const [suggestedTripName, setSuggestedTripName] = useState("");
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);

  // Activity data
  const activityImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    "https://images.unsplash.com/photo-1582034986517-30d163aa1da9",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
  ];

  const existingTrips = [
    { id: "trip1", name: "Beach Adventure", days: ["2025-07-20"] },
    { id: "trip2", name: "Wildlife Expedition", days: ["2025-07-22"] },
  ];

  const activityDetails = {
    title: "Whale Watching Tour",
    location: "Mirissa Harbor",
    description: "Experience the majestic blue whales in their natural habitat with our expert-guided whale watching tours. Our eco-friendly boats provide comfortable viewing platforms with knowledgeable marine naturalists who will help you spot these magnificent creatures and other marine life.",
    price: "LKR 12,000",
    duration: "4 hours",
    difficulty: "Easy",
    groupSize: "Max 15 people",
    includes: [
      "Boat ride with viewing platform",
      "Life jackets and safety equipment",
      "Marine naturalist guide",
      "Refreshments and snacks",
      "Insurance coverage"
    ],
    requirements: [
      "Comfortable clothing",
      "Sunscreen and hat",
      "Motion sickness medication if needed",
      "Camera or binoculars (optional)"
    ],
    provider: {
      name: "Oceanic Adventures",
      rating: 4.8,
      contact: "+94 76 123 4567"
    }
  };

  useEffect(() => {
    if (showTripModal) {
      Animated.timing(tripModalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(tripModalAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showTripModal]);

  const handleFavourite = () => {
    setIsFavourite(!isFavourite);
    ToastAndroid.show(
      isFavourite ? "Removed from favourites" : "Added to favourites",
      ToastAndroid.SHORT
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderSection
        title={activityDetails.title}
        isFavourite={isFavourite}
        handleFavourite={handleFavourite}
        handleShare={() => Linking.openURL("https://maps.google.com")}
        onBack={() => router.back()}
      />

      <ScrollView className="bg-gray-50">
        {/* Image Gallery */}
        <ScrollView horizontal className="ml-6 mt-4">
          {activityImages.map((img, i) => (
            <Image
              key={i}
              source={{ uri: img }}
              className="w-96 h-72 rounded-lg mr-4"
            />
          ))}
        </ScrollView>

        {/* Activity Header */}
        <View className="px-4 mt-4">
          <Text className="text-3xl font-bold text-gray-700">{activityDetails.title}</Text>
          
          <View className="flex-row items-center mt-1">
            <MapPin size={16} color="#6b7280" />
            <Text className="text-gray-500 ml-1">{activityDetails.location}</Text>
          </View>
          
          <View className="flex-row items-center justify-between mt-4">
            <Text className="text-xl text-primary font-bold">{activityDetails.price}</Text>
            <View className="flex-row items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={18} 
                  color="#FBB03B" 
                  fill={i < Math.floor(activityDetails.provider.rating) ? "#FBB03B" : "none"} 
                />
              ))}
              <Text className="ml-2 text-gray-500">({activityDetails.provider.rating})</Text>
            </View>
          </View>
        </View>

        {/* Activity Tags */}
        <View className="flex-row space-x-2 px-4 mt-4 gap-2">
          <View className="flex-row items-center bg-blue-100 px-3 py-1 rounded-full">
            <Clock size={14} color="#3b82f6" />
            <Text className="text-blue-800 ml-1 text-xs">{activityDetails.duration}</Text>
          </View>
          <View className="flex-row items-center bg-green-100 px-3 py-1 rounded-full">
            <Users size={14} color="#10b981" />
            <Text className="text-green-800 ml-1 text-xs">{activityDetails.groupSize}</Text>
          </View>
          <View className="flex-row items-center bg-purple-100 px-3 py-1 rounded-full">
            <AlertCircle size={14} color="#8b5cf6" />
            <Text className="text-purple-800 ml-1 text-xs">{activityDetails.difficulty}</Text>
          </View>
        </View>

        {/* Activity Description */}
        <View className="px-4 mt-4">
          <Text className="text-xl font-semibold text-gray-700 mb-2">Description</Text>
          <Text 
            className="text-gray-600"
            numberOfLines={showFullDescription ? undefined : 3}
          >
            {activityDetails.description}
          </Text>
          <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
            <Text className="text-teal-600 mt-1">
              {showFullDescription ? "Show less" : "Show more"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* What's Included */}
        <View className="px-4 mt-6">
          <Text className="text-xl font-semibold text-gray-700 mb-2">What's Included</Text>
          {activityDetails.includes.map((item, index) => (
            <View key={index} className="flex-row items-start mb-2">
              <Text className="text-primary mr-2">•</Text>
              <Text className="text-gray-600 flex-1">{item}</Text>
            </View>
          ))}
        </View>

        {/* Requirements */}
        <View className="px-4 mt-6">
          <Text className="text-xl font-semibold text-gray-700 mb-2">Requirements</Text>
          {activityDetails.requirements.map((item, index) => (
            <View key={index} className="flex-row items-start mb-2">
              <Text className="text-primary mr-2">•</Text>
              <Text className="text-gray-600 flex-1">{item}</Text>
            </View>
          ))}
        </View>

        {/* Provider Info */}
        <View className="px-4 mt-6 mb-6">
          <Text className="text-xl font-semibold text-gray-700 mb-2">Provider</Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-medium text-gray-800">{activityDetails.provider.name}</Text>
            <View className="flex-row items-center mt-1">
              <Star size={16} color="#FBB03B" fill="#FBB03B" />
              <Text className="text-gray-600 ml-1">{activityDetails.provider.rating} (256 reviews)</Text>
            </View>
            <TouchableOpacity 
              className="mt-3 flex-row items-center"
              onPress={() => Linking.openURL(`tel:${activityDetails.provider.contact}`)}
            >
              <Text className="text-primary font-medium">Contact Provider</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add to Trip Button */}
        <TouchableOpacity
          onPress={() => setShowTripModal(true)}
          className={`mx-6 py-3 mt-4 mb-48 rounded-full items-center ${tripAdded ? "bg-green-500" : "bg-primary"}`}
          disabled={tripAdded}
        >
          <Text className="text-white font-semibold text-lg">
            {tripAdded ? "Added to Trip" : "Add to Trip"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for Add to Trip */}
      <Modal visible={showTripModal} transparent animationType="none">
        <TouchableWithoutFeedback onPress={() => setShowTripModal(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            backgroundColor: "#fff",
            padding: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
            transform: [
              {
                translateY: tripModalAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [400, 0],
                }),
              },
            ],
            zIndex: 1001,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: "#374151",
              marginBottom: 18,
            }}
          >
            Add to Trip
          </Text>

          <>
            <Text
              style={{ marginBottom: 6, fontWeight: "600", color: "#374151" }}
            >
              Select Trip
            </Text>
            {existingTrips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                onPress={() => {
                  setSelectedTrip(trip.id);
                  setSelectedDay("");
                }}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  marginVertical: 4,
                  backgroundColor:
                    selectedTrip === trip.id ? "#008080" : "#f3f4f6",
                }}
              >
                <Text
                  style={{
                    color: selectedTrip === trip.id ? "#fff" : "#374151",
                    fontWeight: "500",
                  }}
                >
                  {trip.name}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={{ marginVertical: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  setTripType("new");
                  setShowTripModal(false);
                  setShowDestinationModal(true);
                }}
                style={{
                  padding: 12,
                  borderRadius: 36,
                  marginVertical: 4,
                  backgroundColor: "#ffffff",
                  borderColor: "#008080",
                  borderWidth: 3,
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#008080",
                      fontWeight: "600",
                      alignItems: "center",
                      textAlign: "center",
                      fontSize: 24,
                    }}
                  >
                    +
                  </Text>
                  <Text
                    style={{
                      color: "#008080",
                      fontWeight: "600",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    New Trip
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {selectedTrip && (
              <>
                <Text
                  style={{
                    marginTop: 16,
                    marginBottom: 6,
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Select Day
                </Text>
                {existingTrips
                  .find((trip) => trip.id === selectedTrip)
                  ?.days.map((day, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedDay(day)}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        marginVertical: 4,
                        backgroundColor:
                          selectedDay === day ? "#008080" : "#f3f4f6",
                      }}
                    >
                      <Text
                        style={{
                          color: selectedDay === day ? "#fff" : "#374151",
                          fontWeight: "500",
                        }}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </>
            )}
          </>

          {selectedTrip && selectedDay && (
            <View style={{ marginTop: 16 }}>
              <Text
                style={{ fontWeight: "600", color: "#374151", marginBottom: 8 }}
              >
                Select Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={{
                  backgroundColor: "#f3f4f6",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#374151", fontWeight: "500" }}>
                  {selectedTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, date) => {
                    if (date) setSelectedTime(date);
                    setShowTimePicker(false);
                  }}
                />
              )}
            </View>
          )}

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 24 }}>
            <TouchableOpacity
              onPress={() => setShowTripModal(false)}
              style={{ backgroundColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}
            >
              <Text style={{ color: '#374151', fontWeight: '500' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowTripModal(false);
                if (tripType === 'new') {
                  setShowDestinationModal(true);
                } else {
                  setTripAdded(true);
                  ToastAndroid.show("Added to trip!", ToastAndroid.SHORT);
                }
              }}
              style={{ backgroundColor: '#008080', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, opacity: tripAdded ? 0.6 : 1 }}
              disabled={tripAdded || (!selectedTrip && tripType !== 'new')}
            >
              <Text style={{ color: '#fff', fontWeight: '500' }}>{tripAdded ? 'Added' : 'Confirm'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>

      {/* Sequential Modal Flow */}
      {(showDestinationModal || showTripNameModal || showTripDetailsModal) && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
          pointerEvents="none"
        />
      )}

      <DestinationModal
        visible={showDestinationModal}
        onClose={() => setShowDestinationModal(false)}
        onDestinationSelect={(destinations: string[], vibes?: string[]) => {
          setSelectedDestinations(destinations);
          setSelectedVibes(vibes || []);
          setShowDestinationModal(false);
          setSuggestedTripName(
            destinations[0] ? `${destinations[0]} Explorer` : ""
          );
          setShowTripNameModal(true);
        }}
        animateToTripNameHeight={!!selectedDestinations.length}
      />

      <TripNameModal
        visible={showTripNameModal}
        destination={selectedDestinations.join(", ")}
        suggestedName={suggestedTripName}
        onClose={() => setShowTripNameModal(false)}
        onCreateTrip={(name: string) => {
          setTripName(name);
          setShowTripNameModal(false);
          setShowTripDetailsModal(true);
        }}
        startFromIntermediate={!!selectedDestinations.length}
        animateToTripDetailsHeight={!!tripName}
      />

      <TripDetailsModal
        visible={showTripDetailsModal}
        onClose={() => setShowTripDetailsModal(false)}
        onConfirm={(details: TripDetails) => {
          setTripDetails(details);
          setShowTripDetailsModal(false);
          setTripAdded(true);
          ToastAndroid.show("Trip created successfully!", ToastAndroid.SHORT);
        }}
        tripTitle={tripName}
        startFromIntermediate={!!tripName}
      />
    </SafeAreaView>
  );
};

export default ActivityDetailView;