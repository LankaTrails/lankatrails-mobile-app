import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  ToastAndroid,
  Image,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Star, Edit3, Trash2, X } from "lucide-react-native";
import {
  getReviews,
  submitReview,
  updateReview,
  deleteReview,
} from "@/services/review";
import { useAuth } from "@/hooks/useAuth";
import type {
  ReviewResponse,
  ReviewItem,
  reviewRequest,
} from "@/types/reviewTypes";

interface ReviewsSectionProps {
  serviceId: number;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ serviceId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [serviceId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response: ReviewResponse = await getReviews(serviceId);
      setReviews(response.reviews);
      setAverageRating(response.averageRating);
      setTotalReviews(response.totalReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      if (Platform.OS === "android") {
        ToastAndroid.show("Failed to load reviews", ToastAndroid.SHORT);
      } else {
        Alert.alert("Error", "Failed to load reviews");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (userRating === 0 || userReview.trim() === "") {
      Alert.alert(
        "Missing Information",
        "Please add a rating and write a review."
      );
      return;
    }

    try {
      setSubmitting(true);

      const reviewData: reviewRequest = {
        rate: userRating,
        review: userReview.trim(),
        createdDate: new Date().toISOString(),
      };

      if (editingReview) {
        // Update existing review
        await updateReview(editingReview.id, reviewData);
        if (Platform.OS === "android") {
          ToastAndroid.show("Review updated successfully!", ToastAndroid.SHORT);
        } else {
          Alert.alert("Success", "Your review has been updated successfully!");
        }
        setEditingReview(null);
      } else {
        // Submit new review
        await submitReview(serviceId, reviewData);
        if (Platform.OS === "android") {
          ToastAndroid.show(
            "Review submitted successfully!",
            ToastAndroid.SHORT
          );
        } else {
          Alert.alert(
            "Success",
            "Your review has been submitted successfully!"
          );
        }
      }

      // Reset form and close modal
      setUserRating(0);
      setUserReview("");
      setShowReviewModal(false);

      // Refresh reviews
      fetchReviews();
    } catch (error) {
      console.error("Error submitting/updating review:", error);
      if (Platform.OS === "android") {
        ToastAndroid.show(
          editingReview ? "Failed to update review" : "Failed to submit review",
          ToastAndroid.SHORT
        );
      } else {
        Alert.alert(
          "Error",
          editingReview
            ? "Failed to update review. Please try again."
            : "Failed to submit review. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review: ReviewItem) => {
    setEditingReview(review);
    setUserRating(review.rate);
    setUserReview(review.review);
    setShowReviewModal(true);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setUserRating(0);
    setUserReview("");
    setShowReviewModal(false);
  };

  const handleOpenReviewModal = () => {
    setEditingReview(null);
    setUserRating(0);
    setUserReview("");
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingReviewId(reviewId);
              await deleteReview(reviewId);

              if (Platform.OS === "android") {
                ToastAndroid.show(
                  "Review deleted successfully!",
                  ToastAndroid.SHORT
                );
              } else {
                Alert.alert(
                  "Success",
                  "Your review has been deleted successfully!"
                );
              }

              // Refresh reviews
              fetchReviews();
            } catch (error) {
              console.error("Error deleting review:", error);
              if (Platform.OS === "android") {
                ToastAndroid.show(
                  "Failed to delete review",
                  ToastAndroid.SHORT
                );
              } else {
                Alert.alert(
                  "Error",
                  "Failed to delete review. Please try again."
                );
              }
            } finally {
              setDeletingReviewId(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating: number, size = 16, interactive = false) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={interactive ? () => setUserRating(star) : undefined}
            disabled={!interactive}
          >
            <Star
              size={size}
              color={rating >= star ? "#FBB03B" : "#E5E7EB"}
              fill={rating >= star ? "#FBB03B" : "none"}
              className="mr-0.5"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const ReviewCard: React.FC<{ review: ReviewItem }> = ({ review }) => {
    const isCurrentUserReview = user && user.id === review.tourist.id;

    return (
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-row flex-1">
            {/* User Avatar */}
            <View className="mr-3">
              {review.tourist.profilePictureUrl ? (
                <Image
                  source={{ uri: review.tourist.profilePictureUrl }}
                  className="w-10 h-10 rounded-full"
                  defaultSource={require("@/assets/images/profile.png")}
                />
              ) : (
                <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
                  <Ionicons name="person" size={20} color="#6B7280" />
                </View>
              )}
            </View>

            {/* User Info and Rating */}
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="font-semibold text-gray-800 text-base mr-2">
                  {review.tourist.firstName} {review.tourist.lastName}
                </Text>
                {renderStars(review.rate)}
              </View>
              <Text className="text-gray-500 text-sm">
                {formatDate(review.createdDate)}
              </Text>
            </View>
          </View>

          {/* Edit/Delete Actions for Current User */}
          {isCurrentUserReview && (
            <View className="flex-row ml-2">
              <TouchableOpacity
                onPress={() => handleEditReview(review)}
                className="p-2 mr-1"
                disabled={showReviewModal || deletingReviewId !== null}
              >
                <Edit3
                  size={16}
                  color={showReviewModal ? "#9CA3AF" : "#008080"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteReview(review.id)}
                className="p-2"
                disabled={showReviewModal || deletingReviewId === review.id}
              >
                {deletingReviewId === review.id ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Trash2 size={16} color="#EF4444" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text className="text-gray-700 text-sm leading-5 mt-2 ml-12">
          {review.review}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="px-4 mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-4">
          Reviews & Ratings
        </Text>
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <ActivityIndicator size="large" color="#008080" />
          <Text className="text-center text-gray-600 mt-2">
            Loading reviews...
          </Text>
        </View>
      </View>
    );
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const userExistingReview = user
    ? reviews.find((review) => review.tourist.id === user.id)
    : null;

  return (
    <View className="px-4 mb-6">
      <Text className="text-2xl font-bold text-gray-800 mb-4">
        Reviews & Ratings
      </Text>

      {/* Rating Summary */}
      {totalReviews > 0 && (
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between">
            <View>
              <View className="flex-row items-center mb-1">
                <Text className="text-3xl font-bold text-gray-800 mr-2">
                  {averageRating.toFixed(1)}
                </Text>
                {renderStars(averageRating, 20)}
              </View>
              <Text className="text-gray-600 text-sm">
                Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </Text>
            </View>
            <View className="bg-primary/10 rounded-full p-3">
              <Ionicons name="star" size={24} color="#008080" />
            </View>
          </View>
        </View>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-800">
              Recent Reviews
            </Text>
            {/* Small Add Review Button - Only show for authenticated users without existing review */}
            {user && !userExistingReview && (
              <TouchableOpacity
                onPress={handleOpenReviewModal}
                disabled={showReviewModal}
                className={`px-3 py-2 rounded-lg flex-row items-center ${
                  showReviewModal ? "bg-gray-400" : "bg-primary"
                }`}
              >
                <Ionicons name="add" size={16} color="white" />
                <Text className="text-white font-medium text-sm ml-1">
                  Add Review
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {displayedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {reviews.length > 3 && (
            <TouchableOpacity
              onPress={() => setShowAllReviews(!showAllReviews)}
              className="bg-gray-50 rounded-lg py-3 items-center border border-gray-200"
            >
              <Text className="text-primary font-medium">
                {showAllReviews
                  ? "Show Less"
                  : `View All ${reviews.length} Reviews`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View className="mb-4">
          {/* Show heading with add button even when no reviews */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-800">Reviews</Text>
            {/* Small Add Review Button - Only show for authenticated users */}
            {user && (
              <TouchableOpacity
                onPress={handleOpenReviewModal}
                disabled={showReviewModal}
                className={`px-3 py-2 rounded-lg flex-row items-center ${
                  showReviewModal ? "bg-gray-400" : "bg-primary"
                }`}
              >
                <Ionicons name="add" size={16} color="white" />
                <Text className="text-white font-medium text-sm ml-1">
                  Add Review
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="bg-gray-50 rounded-xl p-6 mb-4 items-center">
            <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-600 font-medium mt-2">
              No reviews yet
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-1">
              Be the first to share your experience!
            </Text>
          </View>
        </View>
      )}

      {/* Show existing review info if user already reviewed */}
      {user && userExistingReview && (
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text className="text-blue-800 font-medium ml-2">Your Review</Text>
          </View>
          <Text className="text-blue-700 text-sm">
            You've already reviewed this service. You can edit or delete your
            review using the buttons on your review card above.
          </Text>
        </View>
      )}

      {/* Login prompt for unauthenticated users */}
      {!user && (
        <View className="bg-gray-50 rounded-xl p-6 items-center border border-gray-200">
          <Ionicons name="log-in-outline" size={48} color="#9CA3AF" />
          <Text className="text-gray-600 font-medium mt-2">
            Sign in to leave a review
          </Text>
          <Text className="text-gray-500 text-sm text-center mt-1">
            Share your experience and help other travelers
          </Text>
        </View>
      )}

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelEdit}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 bg-gray-50">
            {/* Modal Header */}
            <View className="bg-white px-4 py-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-800">
                  {editingReview ? "Edit Review" : "Write Review"}
                </Text>
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  className="p-2 -mr-2"
                >
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Modal Content */}
            <ScrollView className="flex-1 px-4 py-6">
              <View className="bg-white rounded-xl p-6 shadow-sm">
                {/* Rating Section */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-800 mb-2">
                    Your Rating
                  </Text>
                  <Text className="text-gray-600 text-sm mb-4">
                    How would you rate this service?
                  </Text>
                  <View className="flex-row items-center justify-center py-4">
                    {renderStars(userRating, 36, true)}
                  </View>
                  {userRating > 0 && (
                    <Text className="text-center text-gray-600 text-lg font-medium">
                      {userRating}/5{" "}
                      {userRating === 5
                        ? "Excellent!"
                        : userRating === 4
                        ? "Very Good"
                        : userRating === 3
                        ? "Good"
                        : userRating === 2
                        ? "Fair"
                        : "Poor"}
                    </Text>
                  )}
                </View>

                {/* Review Text Section */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-800 mb-2">
                    Your Review
                  </Text>
                  <Text className="text-gray-600 text-sm mb-4">
                    Share your experience to help other travelers
                  </Text>
                  <View className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <TextInput
                      multiline
                      placeholder="Tell us about your experience with this service..."
                      value={userReview}
                      onChangeText={setUserReview}
                      className="text-gray-800 text-base"
                      style={{
                        minHeight: 120,
                        textAlignVertical: "top",
                        fontSize: 16,
                      }}
                      placeholderTextColor="#9CA3AF"
                      maxLength={1000}
                    />
                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="text-gray-400 text-xs">
                        {userReview.length}/1000 characters
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="space-y-3">
                  <TouchableOpacity
                    onPress={handleSubmitReview}
                    disabled={
                      submitting || userRating === 0 || userReview.trim() === ""
                    }
                    className={`py-4 rounded-xl items-center flex-row justify-center ${
                      submitting || userRating === 0 || userReview.trim() === ""
                        ? "bg-gray-300"
                        : "bg-primary"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <ActivityIndicator
                          size="small"
                          color="white"
                          className="mr-2"
                        />
                        <Text className="text-white font-semibold text-base">
                          {editingReview ? "Updating..." : "Submitting..."}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons
                          name={
                            editingReview
                              ? "checkmark-circle-outline"
                              : "send-outline"
                          }
                          size={20}
                          color="white"
                        />
                        <Text className="text-white font-semibold text-base ml-2">
                          {editingReview ? "Update Review" : "Submit Review"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    disabled={submitting}
                    className="py-4 rounded-xl items-center border border-gray-300 bg-white"
                  >
                    <Text className="text-gray-700 font-medium text-base">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default ReviewsSection;
