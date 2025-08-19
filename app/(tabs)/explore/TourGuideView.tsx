import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  ToastAndroid,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import DestinationModal from "@/components/DestinationModal";
import TripNameModal from "@/components/TripNameModal";
import TripDetailsModal, { TripDetails } from "@/components/TripDetailsModal";
import { TextInput } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import HeaderSection from "@/components/explorer-components/HeaderSection";
import { Star, MapPin, Calendar, Users, Award } from "lucide-react-native";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const TourGuideView = () => {
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [showTripModal, setShowTripModal] = useState(false);
  const tripModalAnim = useRef(new Animated.Value(0)).current;
  const [tripType, setTripType] = useState("existing");
  const [selectedTrip, setSelectedTrip] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [tripAdded, setTripAdded] = useState(false);

  // Modal flow states
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [showTripNameModal, setShowTripNameModal] = useState(false);
  const [showTripDetailsModal, setShowTripDetailsModal] = useState(false);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [tripName, setTripName] = useState("");
  const [suggestedTripName, setSuggestedTripName] = useState("");
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const { name } = useLocalSearchParams();

  const progressAnimations = {
    excellent: useRef(new Animated.Value(0)).current,
    veryGood: useRef(new Animated.Value(0)).current,
    average: useRef(new Animated.Value(0)).current,
    poor: useRef(new Animated.Value(0)).current,
    terrible: useRef(new Animated.Value(0)).current,
  };

  const reviewData = {
    excellent: 92,
    veryGood: 75,
    average: 35,
    poor: 15,
    terrible: 5,
  };

  const guideImages = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1551836022-8b2858c9c69b?w=800&h=600&fit=crop",
  ];

  const existingTrips = [
    { id: "trip1", name: "Beach Tour", days: ["2025-07-20", "2025-07-21"] },
    { id: "trip2", name: "Cultural Route", days: ["2025-07-22", "2025-07-23"] },
  ];

  useEffect(() => {
    (Object.keys(progressAnimations) as Array<keyof typeof progressAnimations>).forEach((key) => {
      Animated.timing(progressAnimations[key], {
        toValue: reviewData[key] / 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    });
  }, []);

  // Animate Add to Trip modal in/out
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
  }, [showTripModal, tripModalAnim]);

  const handleSubmitReview = () => {
    if (userRating === 0 || userReview.trim() === "") {
      Alert.alert("Please add a rating and write a review.");
      return;
    }
    Alert.alert("Thank you!", "Your feedback has been submitted.");
    setUserRating(0);
    setUserReview("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderSection
        title="Nimal Fernando"
        isFavourite={isFavourite}
        handleFavourite={() => setIsFavourite(!isFavourite)}
        handleShare={() => Alert.alert("Share", "Sharing Nimal Fernando - Tour Guide")}
        onBack={() => router.back()}
      />

      <ScrollView className="bg-gray-50">
        <ScrollView horizontal className="ml-6 mt-4">
          {guideImages.map((img, i) => (
            <Image
              key={i}
              source={{ uri: img }}
              className="w-80 h-80 rounded-lg mr-4 object-cover"
            />
          ))}
        </ScrollView>

        <View className="px-4 mt-4">
          <Text className="text-3xl font-bold text-gray-500">
            Nimal Fernando
          </Text>
          <Text className="text-lg text-gray-500 mt-1">
            Professional Tour Guide | 15+ Years Experience
          </Text>
          <View className="flex-row items-center mt-2">
            <MapPin size={16} color="#6B7280" />
            <Text className="text-gray-500 ml-1">Colombo, Western Province</Text>
          </View>
          <Text className="text-xl text-primary mt-2 font-bold">LKR 8,500/day</Text>
          <View className="flex-row items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} color="#FBB03B" fill="#FBB03B" />
            ))}
            <Text className="ml-2 text-gray-500">(4.9 • 127 reviews)</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap px-4 gap-2 mt-4">
          <Text className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full">
            Cultural Tours
          </Text>
          <Text className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            Wildlife Safari
          </Text>
          <Text className="text-xs px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
            Adventure Tours
          </Text>
          <Text className="text-xs px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
            Photography Tours
          </Text>
        </View>

        <View className="px-4 mt-6">
          <Text className="text-xl font-semibold text-gray-700 mb-3">
            About Nimal
          </Text>
          <Text className="text-gray-600 leading-6">
            With over 15 years of experience guiding tourists through Sri Lanka's most beautiful destinations, 
            Nimal brings deep local knowledge and infectious enthusiasm to every tour. Fluent in English, 
            Sinhala, and Tamil, he specializes in cultural heritage sites, wildlife photography, 
            and off-the-beaten-path adventures.
          </Text>
        </View>

        <View className="px-4 mt-6">
          <Text className="text-xl font-semibold text-gray-700 mb-3">
            Specializations
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Award size={20} color="#008080" />
              <Text className="text-gray-600 ml-3 flex-1">UNESCO World Heritage Sites Expert</Text>
            </View>
            <View className="flex-row items-center">
              <Users size={20} color="#008080" />
              <Text className="text-gray-600 ml-3 flex-1">Small Group & Family Tours</Text>
            </View>
            <View className="flex-row items-center">
              <Calendar size={20} color="#008080" />
              <Text className="text-gray-600 ml-3 flex-1">Multi-day Cultural Expeditions</Text>
            </View>
          </View>
        </View>

        <View className="px-4 mt-6">
          <Text className="text-xl font-semibold text-gray-700 mb-3">
            Languages Spoken
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Text className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              🇱🇰 Sinhala (Native)
            </Text>
            <Text className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              🇬🇧 English (Fluent)
            </Text>
            <Text className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              🇱🇰 Tamil (Fluent)
            </Text>
            <Text className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              🇩🇪 German (Basic)
            </Text>
          </View>
        </View>

        <View className="px-4 mt-6">
          <Text className="text-lg italic text-gray-700">
            "I don't just show you places - I share the stories, legends, and local secrets that make 
            each destination truly come alive. Every tour is a journey through Sri Lanka's heart and soul."
          </Text>
          <Text className="text-right text-gray-500 mt-2">- Nimal Fernando</Text>
        </View>

        <View className="px-4 mt-6">
          <Text className="text-xl font-semibold text-gray-700 mb-3">
            Tour Packages & Pricing
          </Text>
          <View className="bg-white rounded-xl shadow-sm p-4 mb-3">
            <Text className="font-semibold text-gray-700">Half Day Tours</Text>
            <Text className="text-gray-600 text-sm mt-1">4-5 hours • Up to 6 people</Text>
            <Text className="text-primary font-bold mt-2">LKR 4,500</Text>
          </View>
          <View className="bg-white rounded-xl shadow-sm p-4 mb-3">
            <Text className="font-semibold text-gray-700">Full Day Tours</Text>
            <Text className="text-gray-600 text-sm mt-1">8-10 hours • Up to 6 people</Text>
            <Text className="text-primary font-bold mt-2">LKR 8,500</Text>
          </View>
          <View className="bg-white rounded-xl shadow-sm p-4">
            <Text className="font-semibold text-gray-700">Multi-Day Adventures</Text>
            <Text className="text-gray-600 text-sm mt-1">2-7 days • Customizable</Text>
            <Text className="text-primary font-bold mt-2">From LKR 7,500/day</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowTripModal(true)}
          className={`mx-6 py-3 mt-6 rounded-full items-center ${
            tripAdded ? "bg-green-500" : "bg-primary"
          }`}
          disabled={tripAdded}
        >
          <Text className="text-white font-semibold text-lg">
            {tripAdded ? "Added to Trip" : "Book Nimal"}
          </Text>
        </TouchableOpacity>

        <View className="px-4 mt-10">
          <Text className="text-3xl font-semibold text-gray-500 mb-4">
            Customer Reviews
          </Text>
          {Object.entries(progressAnimations).map(([label, anim], i) => (
            <View key={i} className="flex-row items-center mb-2 mx-4">
              <Text className="w-20 text-gray-500 font-semibold capitalize">{label}</Text>
              <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <Animated.View
                  style={{
                    height: 8,
                    backgroundColor: "#008080",
                    width: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  }}
                />
              </View>
              <Text className="w-12 text-right text-gray-500 text-sm ml-2">
                {reviewData[label as keyof typeof reviewData]}%
              </Text>
            </View>
          ))}
        </View>

        <View className="px-4 mt-6">
          <Text className="text-xl font-semibold text-gray-700 mb-4">
            Recent Reviews
          </Text>
          <View className="bg-white rounded-xl shadow-sm p-4 mb-3">
            <View className="flex-row items-center mb-2">
              <Text className="font-semibold text-gray-700">Sarah M.</Text>
              <View className="flex-row ml-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} color="#FBB03B" fill="#FBB03B" />
                ))}
              </View>
            </View>
            <Text className="text-gray-600 text-sm">
              "Nimal made our Sri Lanka trip unforgettable! His knowledge of local culture and hidden gems was amazing."
            </Text>
          </View>
          <View className="bg-white rounded-xl shadow-sm p-4 mb-3">
            <View className="flex-row items-center mb-2">
              <Text className="font-semibold text-gray-700">Michael K.</Text>
              <View className="flex-row ml-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} color="#FBB03B" fill="#FBB03B" />
                ))}
              </View>
            </View>
            <Text className="text-gray-600 text-sm">
              "Professional, punctual, and passionate about his work. Highly recommended for anyone visiting Sri Lanka!"
            </Text>
          </View>
        </View>

        <View className="px-4 mt-6 mb-20">
          <Text className="text-3xl font-semibold text-gray-500 mb-2">
            Leave a Review
          </Text>
          <View className="bg-white rounded-xl shadow-sm p-4">
            <Text className="text-gray-500 font-medium text-lg mb-2">
              Your Rating
            </Text>
            <View className="flex-row mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setUserRating(star)}
                >
                  <Star
                    size={24}
                    color={userRating >= star ? "#FBB03B" : "#E5E7EB"}
                    fill={userRating >= star ? "#FBB03B" : "none"}
                    className="mr-1"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              multiline
              placeholder="Share your experience with Nimal..."
              value={userReview}
              onChangeText={setUserReview}
              className="bg-gray-100 px-3 py-2 rounded-lg text-gray-800"
              style={{ minHeight: 80 }}
            />
            <TouchableOpacity
              onPress={handleSubmitReview}
              className="bg-primary py-3 rounded-lg mt-4 items-center"
            >
              <Text className="text-white text-lg font-medium">
                Submit Review
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
            Book Tour Guide
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
              {selectedTrip === "" && (
                <TouchableOpacity
                  onPress={() => {
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
              )}
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

          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 24 }}>
            <TouchableOpacity
              onPress={() => {
                setShowTripModal(false);
                if (tripType === 'new') {
                  setShowDestinationModal(true);
                } else {
                  setTripAdded(true);
                  ToastAndroid.show("Tour guide booked successfully!", ToastAndroid.SHORT);
                }
              }}
              style={{ 
                backgroundColor: '#008080', 
                paddingHorizontal: 24, 
                paddingVertical: 12, 
                borderRadius: 999, 
                opacity: tripAdded ? 0.6 : 1 
              }}
              disabled={tripAdded}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
                {tripAdded ? 'Booked' : 'Confirm Booking'}
              </Text>
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
          ToastAndroid.show("Trip with tour guide created successfully!", ToastAndroid.SHORT);
        }}
        tripTitle={tripName}
        startFromIntermediate={!!tripName}
      />
    </SafeAreaView>
  );
};

export default TourGuideView;