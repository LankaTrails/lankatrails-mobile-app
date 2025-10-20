import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../app/theme";
import { ExpenseService } from "@/services/expenseService";
import {
  TripParticipant as ExpenseParticipant,
  ExpenseShare,
} from "@/types/expenseTypes";
import AddExpenseModal from "./AddExpenseModal";

interface TripParticipant {
  participantId: number;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: string;
}

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
  icon: string;
  budgetCategory?: any;
}

interface ExpenseDetails {
  id: string;
  categoryId: string;
  name: string;
  amount: number;
  date: string;
  time: string;
  createdByParticipant?: ExpenseParticipant;
  shares?: ExpenseShare[];
  isThroughApp: boolean;
}

interface ExpenseDetailsModalProps {
  visible: boolean;
  expense: ExpenseDetails | null;
  budgetCategories: BudgetCategory[];
  tripParticipants: TripParticipant[];
  currencyType: string;
  tripId: number;
  onClose: () => void;
  onExpenseUpdated: () => void;
  onExpenseDeleted: () => void;
}

export default function ExpenseDetailsModal({
  visible,
  expense,
  budgetCategories,
  tripParticipants,
  currencyType,
  tripId,
  onClose,
  onExpenseUpdated,
  onExpenseDeleted,
}: ExpenseDetailsModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setShowEditModal(false);
      setIsDeleting(false);
    }
  }, [visible]);

  // Debug logging
  useEffect(() => {
    if (expense && visible) {
      console.log("[ExpenseDetailsModal] Expense object:", expense);
      console.log(
        "[ExpenseDetailsModal] isThroughApp value:",
        expense.isThroughApp
      );
      console.log(
        "[ExpenseDetailsModal] isThroughApp type:",
        typeof expense.isThroughApp
      );
    }
  }, [expense, visible]);

  if (!expense) return null;

  if (!expense) return null;

  const getCategoryName = (categoryId: string) => {
    return (
      budgetCategories.find((cat) => cat.id === categoryId)?.name || "Unknown"
    );
  };

  const getCategoryIcon = (categoryId: string) => {
    return budgetCategories.find((cat) => cat.id === categoryId)?.icon || "💳";
  };

  const getCategoryColor = (categoryId: string) => {
    return (
      budgetCategories.find((cat) => cat.id === categoryId)?.color || "#6B7280"
    );
  };

  const handleEdit = () => {
    console.log("[ExpenseDetailsModal] Edit button pressed");
    console.log(
      "[ExpenseDetailsModal] expense.isThroughApp:",
      expense?.isThroughApp
    );
    console.log("[ExpenseDetailsModal] isDeleting:", isDeleting);
    console.log(
      "[ExpenseDetailsModal] Should be disabled:",
      expense?.isThroughApp || isDeleting
    );
    setShowEditModal(true);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Expense",
      `Are you sure you want to delete "${expense.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      console.log(
        "[ExpenseDetailsModal] Deleting expense with ID:",
        expense.id
      );

      const response = await ExpenseService.deleteExpense(parseInt(expense.id));

      console.log("[ExpenseDetailsModal] Delete response:", response);

      if (response.success) {
        Alert.alert("Success", "Expense deleted successfully");
        onExpenseDeleted();
        onClose();
      } else {
        Alert.alert("Error", response.message || "Failed to delete expense");
      }
    } catch (error: any) {
      console.error("[ExpenseDetailsModal] Failed to delete expense:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete expense";
      Alert.alert("Error", `Failed to delete expense: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateExpense = async (expenseData: {
    name: string;
    amount: number;
    categoryId: string;
    payerId?: number;
    collaboratorShares: { participantId: number; amount: string }[];
  }) => {
    try {
      console.log(
        "[ExpenseDetailsModal] Updating expense with ID:",
        expense.id
      );
      console.log("[ExpenseDetailsModal] Update data:", expenseData);

      // Get the selected category
      let selectedCategoryData = budgetCategories.find(
        (cat) => cat.id === expenseData.categoryId
      );

      // If "OTHER" was selected, use MISCELLANEOUS budget category
      if (expenseData.categoryId === "OTHER") {
        selectedCategoryData = {
          id: "OTHER",
          name: "Other",
          allocated: 0,
          spent: 0,
          color: "#6B7280",
          icon: "💼",
          budgetCategory: "MISCELLANEOUS",
        };
      }

      if (!selectedCategoryData || !selectedCategoryData.budgetCategory) {
        console.log(
          "[ExpenseDetailsModal] Invalid category for expense:",
          expenseData.categoryId
        );
        Alert.alert("Error", "Invalid category selected");
        return;
      }

      // Prepare shares array from collaborator shares
      const shares: any[] = expenseData.collaboratorShares
        .map((share) => {
          // Handle current user (participantId = -1)
          if (share.participantId === -1) {
            return {
              amount: parseFloat(share.amount),
              participant: {
                participantId: -1, // Backend should handle this as current user
                firstName: "You",
                lastName: "",
                profileImageUrl: undefined,
              },
            };
          } else {
            // Find the participant from tripParticipants
            const participant = tripParticipants.find(
              (p) => p.participantId === share.participantId
            );
            if (participant) {
              return {
                amount: parseFloat(share.amount),
                participant: {
                  participantId: participant.participantId,
                  firstName: participant.firstName,
                  lastName: participant.lastName,
                  profileImageUrl: participant.profileImageUrl,
                },
              };
            }
          }
          return null;
        })
        .filter((share) => share !== null);

      console.log("[ExpenseDetailsModal] Prepared shares for update:", shares);

      console.log(
        "[ExpenseDetailsModal] Selected category data:",
        selectedCategoryData
      );
      console.log(
        "[ExpenseDetailsModal] Budget category value:",
        selectedCategoryData.budgetCategory
      );

      // Create update request
      const updateRequest = {
        expenseName: expenseData.name,
        tripId: tripId,
        budgetCategory: selectedCategoryData.budgetCategory,
        shares: shares,
        totalExpenseAmount:
          expenseData.amount ||
          expenseData.collaboratorShares.reduce(
            (sum, share) => sum + parseFloat(share.amount || "0"),
            0
          ),
      };

      console.log(
        "[ExpenseDetailsModal] Update request:",
        JSON.stringify(updateRequest, null, 2)
      );

      const response = await ExpenseService.updateExpense(
        parseInt(expense.id),
        updateRequest
      );

      console.log(
        "[ExpenseDetailsModal] Update response status:",
        response.success
      );
      console.log("[ExpenseDetailsModal] Update response:", response);

      if (response.success) {
        Alert.alert("Success", "Expense updated successfully");
        setShowEditModal(false);
        onExpenseUpdated();
        onClose();
      } else {
        console.error(
          "[ExpenseDetailsModal] Update failed with message:",
          response.message
        );
        Alert.alert("Error", response.message || "Failed to update expense");
      }
    } catch (error: any) {
      console.error("[ExpenseDetailsModal] Failed to update expense:", error);
      console.error(
        "[ExpenseDetailsModal] Error details:",
        error.response?.data
      );
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update expense";
      Alert.alert("Error", `Failed to update expense: ${errorMessage}`);
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Expense Details</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Expense Icon and Category */}
              <View style={styles.expenseHeader}>
                <View
                  style={[
                    styles.categoryIconContainer,
                    {
                      backgroundColor:
                        getCategoryColor(expense.categoryId) + "15",
                    },
                  ]}
                >
                  <Text style={styles.categoryIconLarge}>
                    {getCategoryIcon(expense.categoryId)}
                  </Text>
                </View>
                <View style={styles.expenseHeaderInfo}>
                  <Text style={styles.expenseTitle}>{expense.name}</Text>
                  <Text style={styles.categoryName}>
                    {getCategoryName(expense.categoryId)}
                  </Text>
                </View>
              </View>

              {/* Amount */}
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Total Amount</Text>
                <Text style={styles.amountValue}>
                  {currencyType} {expense.amount.toLocaleString()}
                </Text>
              </View>

              {/* Date and Time */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#6B7280"
                    />
                    <Text style={styles.detailLabel}>Date</Text>
                  </View>
                  <Text style={styles.detailValue}>{expense.date}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={20} color="#6B7280" />
                    <Text style={styles.detailLabel}>Time</Text>
                  </View>
                  <Text style={styles.detailValue}>{expense.time}</Text>
                </View>
              </View>

              {/* Created By */}
              {expense.createdByParticipant && (
                <View style={styles.detailsContainer}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="person-outline" size={20} color="#6B7280" />
                    <Text style={styles.sectionTitle}>Created By</Text>
                  </View>
                  <View style={styles.participantItem}>
                    <View style={styles.participantAvatar}>
                      <Text style={styles.participantInitials}>
                        {expense.createdByParticipant.firstName.charAt(0)}
                        {expense.createdByParticipant.lastName.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>
                        {expense.createdByParticipant.firstName}{" "}
                        {expense.createdByParticipant.lastName}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Contributors/Shares */}
              {expense.shares && expense.shares.length > 0 && (
                <View style={styles.detailsContainer}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="people-outline" size={20} color="#6B7280" />
                    <Text style={styles.sectionTitle}>
                      Contributors ({expense.shares.length})
                    </Text>
                  </View>
                  {expense.shares.map((share, index) => (
                    <View key={index} style={styles.participantItem}>
                      <View style={styles.participantAvatar}>
                        <Text style={styles.participantInitials}>
                          {share.participant.firstName.charAt(0)}
                          {share.participant.lastName.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.participantInfo}>
                        <Text style={styles.participantName}>
                          {share.participant.firstName}{" "}
                          {share.participant.lastName}
                        </Text>
                        <Text style={styles.participantAmount}>
                          {currencyType} {share.amount.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {/* Debug info */}
              <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                Debug: isThroughApp = {expense.isThroughApp ? "true" : "false"}{" "}
                | isDeleting = {isDeleting ? "true" : "false"}
              </Text>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.editButton,
                  (expense.isThroughApp || isDeleting) && styles.disabledButton,
                ]}
                onPress={handleEdit}
                disabled={expense.isThroughApp || isDeleting}
              >
                <Ionicons
                  name="pencil"
                  size={20}
                  color={
                    expense.isThroughApp || isDeleting ? "#9CA3AF" : "#FFFFFF"
                  }
                />
                <Text
                  style={[
                    styles.editButtonText,
                    (expense.isThroughApp || isDeleting) &&
                      styles.disabledButtonText,
                  ]}
                >
                  {expense.isThroughApp ? "App Expense" : "Edit"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.deleteButton,
                  (expense.isThroughApp || isDeleting) && styles.disabledButton,
                ]}
                onPress={handleDelete}
                disabled={expense.isThroughApp || isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name="trash"
                    size={20}
                    color={
                      expense.isThroughApp || isDeleting ? "#9CA3AF" : "#FFFFFF"
                    }
                  />
                )}
                <Text
                  style={[
                    styles.deleteButtonText,
                    (expense.isThroughApp || isDeleting) &&
                      styles.disabledButtonText,
                  ]}
                >
                  {isDeleting
                    ? "Deleting..."
                    : expense.isThroughApp
                    ? "Cannot Delete"
                    : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <AddExpenseModal
        visible={showEditModal}
        budgetCategories={budgetCategories}
        tripParticipants={tripParticipants}
        currencyType={currencyType}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateExpense}
        initialData={{
          name: expense.name,
          amount: expense.amount,
          categoryId: expense.categoryId,
          collaboratorShares: expense.shares
            ? expense.shares.map((share) => ({
                participantId: share.participant.participantId,
                amount: share.amount.toString(),
              }))
            : [],
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
    minHeight: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  expenseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryIconLarge: {
    fontSize: 28,
  },
  expenseHeaderInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    color: "#6B7280",
  },
  amountContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  amountLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EF4444",
  },
  detailsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  participantInitials: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  participantAmount: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  disabledButton: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
});
