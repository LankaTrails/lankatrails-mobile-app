import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { BlurView } from "expo-blur";
import { theme } from "../app/theme";

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
  icon: string;
  budgetCategory?: any;
}

interface Expense {
  id: string;
  categoryId: string;
  name: string;
  amount: number;
  date: string;
  time: string;
  createdByParticipant?: any;
  shares?: any[];
  isThroughApp: boolean;
}

interface CategoryDetailsModalProps {
  visible: boolean;
  category: BudgetCategory | null;
  expenses: Expense[];
  currencyType: string;
  onClose: () => void;
  onEditBudget: () => void;
  onExpensePress: (expense: Expense) => void;
}

const CategoryDetailsModal: React.FC<CategoryDetailsModalProps> = ({
  visible,
  category,
  expenses,
  currencyType,
  onClose,
  onEditBudget,
  onExpensePress,
}) => {
  if (!visible || !category) {
    return null;
  }

  const categoryExpenses = expenses.filter(
    (expense) => expense.categoryId === category.id
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop}>
            <BlurView
              intensity={50}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{category.name} Details</Text>
            </View>

            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Category Summary */}
              <View style={styles.summarySection}>
                <View style={styles.categoryRow}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: category.color + "20" },
                    ]}
                  >
                    <Text style={styles.categoryIconText}>{category.icon}</Text>
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categorySpent}>
                      Spent: {currencyType} {category.spent.toLocaleString()}
                    </Text>
                    {category.allocated > 0 && (
                      <Text style={styles.categoryLimit}>
                        Limit: {currencyType}{" "}
                        {category.allocated.toLocaleString()}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Budget Progress */}
                {category.allocated > 0 && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(
                              (category.spent / category.allocated) * 100,
                              100
                            )}%`,
                            backgroundColor:
                              category.spent / category.allocated >= 0.9
                                ? "#EF4444"
                                : category.spent / category.allocated >= 0.75
                                ? "#F59E0B"
                                : category.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round((category.spent / category.allocated) * 100)}%
                      used
                    </Text>
                  </View>
                )}

                {/* Edit Budget Button */}
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={onEditBudget}
                >
                  <Text style={styles.editButtonText}>
                    {category.allocated > 0
                      ? "Edit Budget Limit"
                      : "Set Budget Limit"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Expenses Section */}
              <View style={styles.expensesSection}>
                <Text style={styles.expensesTitle}>
                  Expenses ({categoryExpenses.length})
                </Text>

                {categoryExpenses.length > 0 ? (
                  <View style={styles.expensesList}>
                    {categoryExpenses.map((expense) => (
                      <TouchableOpacity
                        key={expense.id}
                        style={styles.expenseItem}
                        onPress={() => onExpensePress(expense)}
                      >
                        <View style={styles.expenseLeft}>
                          <View style={styles.expenseInfo}>
                            <Text style={styles.expenseName}>
                              {expense.name}
                            </Text>
                            <Text style={styles.expenseDate}>
                              {expense.date} • {expense.time}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.expenseAmount}>
                          -{currencyType} {expense.amount.toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noExpenses}>
                    <Text style={styles.noExpensesIcon}>💸</Text>
                    <Text style={styles.noExpensesText}>
                      No expenses in this category yet
                    </Text>
                    <Text style={styles.noExpensesSubtext}>
                      Add your first expense to start tracking spending in{" "}
                      {category.name}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  scrollContainer: {
    maxHeight: "85%",
  },
  summarySection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIconText: {
    fontSize: 28,
  },
  categoryInfo: {
    marginLeft: 16,
    flex: 1,
  },
  categoryName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 6,
  },
  categorySpent: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "600",
    marginBottom: 4,
  },
  categoryLimit: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: "500",
    textAlign: "center",
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  expensesSection: {
    padding: 20,
  },
  expensesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 16,
  },
  expensesList: {
    gap: 12,
  },
  expenseItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  expenseLeft: {
    flex: 1,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
  },
  noExpenses: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noExpensesIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noExpensesText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 8,
  },
  noExpensesSubtext: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default CategoryDetailsModal;
