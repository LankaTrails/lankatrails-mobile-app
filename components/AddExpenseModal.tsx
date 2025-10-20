import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InputField from './InputField';
import { theme } from '../app/theme';
import { BudgetCategorys } from '@/types/budgetTypes';

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
  icon: string;
  budgetCategory?: BudgetCategorys;
}

interface TripParticipant {
  participantId: number;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: string;
}

interface CollaboratorShare {
  participantId: number; // Trip participant ID
  amount: string;
}

interface AddExpenseModalProps {
  visible: boolean;
  budgetCategories: BudgetCategory[];
  tripParticipants: TripParticipant[];
  currencyType: string;
  onClose: () => void;
  onSubmit: (expenseData: {
    name: string;
    amount: number;
    categoryId: string;
    payerId?: number;
    collaboratorShares: CollaboratorShare[];
  }) => void;
  initialData?: {
    name?: string;
    amount?: number;
    categoryId?: string;
    collaboratorShares?: CollaboratorShare[];
  };
}

export default function AddExpenseModal({
  visible,
  budgetCategories,
  tripParticipants,
  currencyType,
  onClose,
  onSubmit,
  initialData,
}: AddExpenseModalProps) {
  const [expenseName, setExpenseName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedPayerId, setSelectedPayerId] = useState<number | undefined>(undefined);
  const [collaboratorShares, setCollaboratorShares] = useState<CollaboratorShare[]>([]);
  const [showPayerDropdown, setShowPayerDropdown] = useState(false);
  const [showCollaboratorDropdown, setShowCollaboratorDropdown] = useState(false);

  // Get all available categories (both with and without budget limits) plus "Other"
  const availableCategories = [
    ...budgetCategories, // Include all categories regardless of budget allocation
    {
      id: 'OTHER',
      name: 'Other',
      allocated: 0,
      spent: 0,
      color: '#6B7280',
      icon: '💼',
      budgetCategory: BudgetCategorys.MISCELLANEOUS
    }
  ];

  // Calculate total amount from all shares
  const calculateTotalAmount = () => {
    return collaboratorShares.reduce((total, share) => {
      const amount = parseFloat(share.amount) || 0;
      return total + amount;
    }, 0);
  };

  // Reset form or populate with initial data when modal opens
  useEffect(() => {
    if (visible) {
      if (initialData) {
        // Populate form with initial data for editing
        setExpenseName(initialData.name || '');
        setSelectedCategoryId(initialData.categoryId || '');
        setCollaboratorShares(initialData.collaboratorShares || []);
      } else {
        // Reset form for new expense
        setExpenseName('');
        setSelectedCategoryId('');
        setSelectedPayerId(undefined);
        setCollaboratorShares([]);
      }
      setShowPayerDropdown(false);
      setShowCollaboratorDropdown(false);
    }
  }, [visible, initialData]);

  const addCollaboratorShare = (participantId: number) => {
    if (!collaboratorShares.some(share => share.participantId === participantId)) {
      setCollaboratorShares([...collaboratorShares, { participantId, amount: '' }]);
    }
    setShowCollaboratorDropdown(false);
  };

  const updateCollaboratorAmount = (participantId: number, amount: string) => {
    setCollaboratorShares(prev =>
      prev.map(share =>
        share.participantId === participantId ? { ...share, amount } : share
      )
    );
  };

  const removeCollaboratorShare = (participantId: number) => {
    setCollaboratorShares(prev =>
      prev.filter(share => share.participantId !== participantId)
    );
  };

  const getCollaboratorName = (participantId: number) => {
    const participant = tripParticipants.find(p => p.participantId === participantId);
    return participant ? `${participant.firstName} ${participant.lastName}` : 'Unknown';
  };

  const validateAndSubmit = () => {
    // Validate required fields
    if (!expenseName.trim()) {
      Alert.alert('Error', 'Please enter an expense name');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    // Calculate total amount from shares
    const totalAmount = calculateTotalAmount();
    
    if (totalAmount <= 0) {
      Alert.alert('Error', 'Please add at least one expense share with a valid amount');
      return;
    }

    // Validate all collaborator shares
    const validShares: CollaboratorShare[] = [];

    for (const share of collaboratorShares) {
      if (share.amount.trim()) {
        const shareAmount = parseFloat(share.amount);
        if (isNaN(shareAmount) || shareAmount <= 0) {
          Alert.alert('Error', `Please enter a valid amount for ${getCollaboratorName(share.participantId)}`);
          return;
        }
        validShares.push({ ...share, amount: shareAmount.toString() });
      }
    }

    if (validShares.length === 0) {
      Alert.alert('Error', 'Please add at least one person with an expense amount');
      return;
    }

    // Submit the expense
    onSubmit({
      name: expenseName,
      amount: totalAmount,
      categoryId: selectedCategoryId,
      payerId: selectedPayerId,
      collaboratorShares: validShares,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            setShowPayerDropdown(false);
            setShowCollaboratorDropdown(false);
          }}
        >
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback onPress={onClose}>
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add Expense</Text>
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
            scrollEnabled={!showPayerDropdown && !showCollaboratorDropdown}
            keyboardShouldPersistTaps="handled"
          >
            {/* Expense Name */}
            <InputField
              label="Expense Name"
              value={expenseName}
              onChange={setExpenseName}
              placeholder="Enter expense name"
              icon="receipt-outline"
            />

            {/* Category Selection */}
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Category</Text>
              <View style={styles.categoriesContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesScrollContainer}
                >
                  {availableCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        selectedCategoryId === category.id && styles.selectedCategoryChip
                      ]}
                      onPress={() => setSelectedCategoryId(category.id)}
                    >
                      <Text style={styles.categoryChipIcon}>{category.icon}</Text>
                      <Text
                        style={[
                          styles.categoryChipText,
                          selectedCategoryId === category.id && styles.selectedCategoryChipText
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Payer Dropdown */}
            <View style={styles.dropdownContainer}>
              {showPayerDropdown && (
                <View style={[styles.dropdownList, { zIndex: 3500 }]}>
                  <ScrollView 
                    style={styles.dropdownScroll} 
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    bounces={false}
                    scrollEventThrottle={16}
                    keyboardShouldPersistTaps="handled"
                  >
                    {tripParticipants.map((participant) => (
                      <TouchableOpacity
                        key={participant.participantId}
                        style={[styles.dropdownItem, selectedPayerId === participant.participantId && styles.selectedDropdownItem]}
                        onPress={() => {
                          setSelectedPayerId(participant.participantId);
                          setShowPayerDropdown(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, selectedPayerId === participant.participantId && styles.selectedDropdownText]}>
                          {participant.firstName} {participant.lastName}
                        </Text>
                        <Text style={styles.roleText}>{participant.role}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Expense Sharing Section */}
            <View style={styles.collaboratorsSection}>
              <View style={styles.collaboratorsHeader}>
                <Text style={styles.dropdownLabel}>Who spent money on this expense?</Text>
                <TouchableOpacity
                  style={styles.addCollaboratorButton}
                  onPress={() => {
                    setShowPayerDropdown(false);
                    setShowCollaboratorDropdown(!showCollaboratorDropdown);
                  }}
                >
                  <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>

              {showCollaboratorDropdown && (
                <View style={[styles.dropdownList, { zIndex: 3000 }]}>
                  <ScrollView 
                    style={styles.dropdownScroll} 
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    bounces={false}
                    scrollEventThrottle={16}
                    keyboardShouldPersistTaps="handled"
                  >
                    {tripParticipants.filter(p => 
                      !collaboratorShares.some(share => share.participantId === p.participantId)
                    ).map((participant) => (
                      <TouchableOpacity
                        key={participant.participantId}
                        style={styles.dropdownItem}
                        onPress={() => addCollaboratorShare(participant.participantId)}
                      >
                        <Text style={styles.dropdownItemText}>
                          {participant.firstName} {participant.lastName}
                        </Text>
                        <Text style={styles.roleText}>{participant.role}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Expense Shares */}
              {collaboratorShares.map((share) => (
                <View key={share.participantId} style={styles.collaboratorShare}>
                  <View style={styles.collaboratorInfo}>
                    <Text style={styles.collaboratorName}>
                      {getCollaboratorName(share.participantId)}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeCollaboratorButton}
                      onPress={() => removeCollaboratorShare(share.participantId)}
                    >
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <InputField
                    label={`Amount (${currencyType})`}
                    value={share.amount}
                    onChange={(value) => updateCollaboratorAmount(share.participantId, value)}
                    placeholder="0.00"
                    keyboardType="numeric"
                    icon="cash-outline"
                  />
                </View>
              ))}

              {/* Total Calculation Display */}
              {collaboratorShares.length > 0 && (
                <View style={styles.totalCalculationContainer}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Expense Amount:</Text>
                    <Text style={styles.totalAmount}>
                      {currencyType} {calculateTotalAmount().toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              {collaboratorShares.length === 0 && (
                <Text style={styles.noCollaboratorsText}>
                  Add people who spent money on this expense and their amounts.
                </Text>
              )}
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={validateAndSubmit}>
              <Text style={styles.saveButtonText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: '90%',
    minHeight: 650,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: "#111827",
  },
  dropdownContainer: {
    marginBottom: 16,
    zIndex: 1000,
    position: 'relative',
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  selectedText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 250, // Increased from 200 to accommodate all categories
    zIndex: 2000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  dropdownScroll: {
    maxHeight: 250, // Increased from 200 to accommodate all categories
    flexGrow: 0,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedDropdownItem: {
    backgroundColor: '#F0F9FF',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  selectedDropdownText: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  budgetText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  roleText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  collaboratorsSection: {
    marginTop: 8,
  },
  collaboratorsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addCollaboratorButton: {
    padding: 4,
  },
  collaboratorShare: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  collaboratorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  collaboratorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  removeCollaboratorButton: {
    padding: 4,
  },
  noCollaboratorsText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  totalCalculationContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0EA5E9',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Category chip styles
  categoriesContainer: {
    maxHeight: 120,
  },
  categoriesScrollContainer: {
    paddingHorizontal: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    minWidth: 80,
  },
  selectedCategoryChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
});