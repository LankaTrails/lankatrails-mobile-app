import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

interface Category {
  id: string;
  name: string;
  icon: string;
  allocated: number;
}

interface SelectPopupProps {
  visible: boolean;
  modalType: 'expense' | 'budget';
  budgetCategories: Category[];
  onSelect: (categoryId: string) => void;
  onClose: () => void;
}

export default function SelectPopup({
  visible,
  modalType,
  budgetCategories,
  onSelect,
  onClose,
}: SelectPopupProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.screenOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.categoryModal}>
          <Text style={styles.modalTitle}>
            {modalType === 'expense'
              ? 'Select Category for Expense'
              : 'Select Category to Update Budget'}
          </Text>

          <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
            {budgetCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryOption}
                onPress={() => onSelect(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View style={styles.categoryOptionInfo}>
                  <Text style={styles.categoryOptionText}>{category.name}</Text>
                  {modalType === 'budget' && (
                    <Text style={styles.currentBudgetText}>
                      Current: LKR {category.allocated.toLocaleString()}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Modal styles for category selector
  screenOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
  },
  categoryModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827',
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  categoryOptionInfo: {
    flex: 1,
    marginLeft: 4,
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  currentBudgetText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});