import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import FAB from '../../../../components/FAB';
import EditPopup from '../../../../components/EditPopup';
import { theme } from '../../../theme';
import SelectPopup from '../../../../components/SelectPopup';
import BackButton from '../../../../components/BackButton';
import FilterButton from '../../../../components/FilterButton';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";



interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
  icon: string;
}

interface Expense {
  id: string;
  categoryId: string;
  name: string;
  amount: number;
  date: string;
  time: string;
}

const BudgetView = () => {
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showBudgetModal, setBudgetModal] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [modalType, setModalType] = useState<'expense' | 'budget'>('expense');
  
  // Navigation state
  const [activeTab, setActiveTab] = useState<'categories' | 'expenses'>('categories');
  
  // Form values for EditPopup
  const [expenseValues, setExpenseValues] = useState({
    name: '',
    amount: '',
  });
  
  const [budgetValues, setBudgetValues] = useState({
    amount: '',
  });

  // Animated blur overlay
  const blurOpacity = useRef(new Animated.Value(0)).current;

  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    {
      id: '1',
      name: 'Accommodation',
      allocated: 0,
      spent: 12000,
      color: '#3B82F6',
      icon: '🏨'
    },
    {
      id: '2',
      name: 'Transportation',
      allocated: 0,
      spent: 6500,
      color: '#10B981',
      icon: '🚗'
    },
    {
      id: '3',
      name: 'Food & Dining',
      allocated: 0,
      spent: 8750,
      color: '#F59E0B',
      icon: '🍽️'
    },
    {
      id: '4',
      name: 'Activities',
      allocated: 0,
      spent: 2450,
      color: '#EF4444',
      icon: '🎯'
    },
    {
      id: '5',
      name: 'Shopping',
      allocated: 0, // No budget allocated
      spent: 1200,
      color: '#8B5CF6',
      icon: '🛍️'
    },
    {
      id: '6',
      name: 'Miscellaneous',
      allocated: 0, // No budget allocated
      spent: 800,
      color: '#6B7280',
      icon: '💼'
    }
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      categoryId: '1',
      name: 'Hotel Booking',
      amount: 12000,
      date: 'Dec 15',
      time: '02:30 PM'
    },
    {
      id: '2',
      categoryId: '2',
      name: 'Taxi to Airport',
      amount: 2500,
      date: 'Dec 15',
      time: '08:00 AM'
    },
    {
      id: '3',
      categoryId: '3',
      name: 'Lunch at Galle Fort',
      amount: 1250,
      date: 'Dec 15',
      time: '01:00 PM'
    },
    {
      id: '4',
      categoryId: '4',
      name: 'City Tour',
      amount: 3500,
      date: 'Dec 14',
      time: '10:00 AM'
    },
    {
      id: '5',
      categoryId: '5',
      name: 'Souvenirs',
      amount: 800,
      date: 'Dec 14',
      time: '06:00 PM'
    }
  ]);

  // Effect to handle blur animation
  useEffect(() => {
    const isAnyModalVisible = showAddExpenseModal || showBudgetModal || showCategorySelector;
    if (isAnyModalVisible) {
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      blurOpacity.setValue(0);
    }
  }, [showAddExpenseModal, showBudgetModal, showCategorySelector]);

  // Filter categories with budget > 0
  const categoriesWithBudget = budgetCategories.filter(cat => cat.allocated > 0);
  const hasAnyBudgetCategories = categoriesWithBudget.length > 0;

  // Calculate totals - include all spending even for categories without budget
  const totalBudget = 50000;
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBudget = totalBudget - totalSpent;

  const getProgressPercentage = (spent: number, allocated: number) => {
    return Math.min((spent / allocated) * 100, 100);
  };

  const getProgressColor = (spent: number, allocated: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage >= 90) return '#EF4444';
    if (percentage >= 75) return '#F59E0B';
    return '#008080';
  };

  // Enhanced Circular Progress Component
  const CircularProgress = ({ percentage, color, size = 70 }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F1F5F9"
            strokeWidth="6"
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
          />
        </Svg>
        <View style={styles.progressTextContainer}>
          <Text style={[styles.progressPercentageText, { color }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
      </View>
    );
  };

  const handleExpenseValueChange = (key: string, value: string) => {
    setExpenseValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBudgetValueChange = (key: string, value: string) => {
    setBudgetValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const openAddExpenseModal = () => {
    setModalType('expense');
    setExpenseValues({ name: '', amount: '' });
    setSelectedCategory('');
    setShowCategorySelector(true);
  };

  const openBudgetModal = () => {
    setModalType('budget');
    setBudgetValues({ amount: '' });
    setSelectedCategory('');
    setShowCategorySelector(true);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategorySelector(false);
    
    if (modalType === 'expense') {
      setShowAddExpenseModal(true);
    } else {
      setBudgetModal(true);
    }
  };

  const handleAddExpense = () => {
    if (!expenseValues.name.trim() || !expenseValues.amount.trim() || !selectedCategory) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amount = parseFloat(expenseValues.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      categoryId: selectedCategory,
      name: expenseValues.name,
      amount: amount,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setExpenses([...expenses, newExpense]);
    
    // Update category spent amount
    setBudgetCategories(prev => 
      prev.map(cat => 
        cat.id === selectedCategory 
          ? { ...cat, spent: cat.spent + amount }
          : cat
      )
    );

    // Reset form
    setExpenseValues({ name: '', amount: '' });
    setSelectedCategory('');
    setShowAddExpenseModal(false);
  };

  const handleUpdateBudget = () => {
    if (!budgetValues.amount.trim() || !selectedCategory) {
      Alert.alert('Error', 'Please enter a budget amount');
      return;
    }

    const amount = parseFloat(budgetValues.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setBudgetCategories(prev => 
      prev.map(cat => 
        cat.id === selectedCategory 
          ? { ...cat, allocated: amount }
          : cat
      )
    );

    setBudgetValues({ amount: '' });
    setSelectedCategory('');
    setBudgetModal(false);
  };

  const handleCloseModal = () => {
    if (showAddExpenseModal) {
      setShowAddExpenseModal(false);
    } else if (showBudgetModal) {
      setBudgetModal(false);
    } else if (showCategorySelector) {
      setShowCategorySelector(false);
    }
    
    // Reset all form data
    setExpenseValues({ name: '', amount: '' });
    setBudgetValues({ amount: '' });
    setSelectedCategory('');
  };

  const getCategoryName = (categoryId: string) => {
    return budgetCategories.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

  const getSelectedCategoryName = () => {
    return budgetCategories.find(cat => cat.id === selectedCategory)?.name || '';
  };

  const recentExpenses = expenses.slice(-10).reverse();
 
  const currencyType = 'LKR';

  return (
    <>
      {/* Animated Blur Overlay */}
      {(showAddExpenseModal || showBudgetModal || showCategorySelector) && (
        <Animated.View style={[styles.overlay, { opacity: blurOpacity }]}>
          <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}

      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton/>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
  Budget{' '}
  <Text style={styles.currencyText}>{currencyType}</Text>
</Text>
          </View>
          <TouchableOpacity 
            onPress={openBudgetModal}
          >
            <Ionicons name="options-outline" size={25} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 150 }}>
          {/* Enhanced Budget Overview Card - Always show */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
            </View>
            
            <View style={styles.overviewRow}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}> {totalBudget.toLocaleString()}</Text>
                <Text style={styles.overviewLabel}>Total Budget</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: '#EF4444' }]}>
                   {totalSpent.toLocaleString()}
                </Text>
                <Text style={styles.overviewLabel}>Spent</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: remainingBudget >= 0 ? '#008080' : '#EF4444' }]}>
                  {hasAnyBudgetCategories ? Math.abs(remainingBudget).toLocaleString() : totalSpent.toLocaleString()}
                </Text>
                <Text style={styles.overviewLabel}>
                  {hasAnyBudgetCategories 
                    ? (remainingBudget >= 0 ? 'Remaining' : 'Over Budget')
                    : 'Total Expenses'
                  }
                </Text>
              </View>
            </View>
            
            {/* Enhanced Overall Progress Bar - Show differently based on budget existence */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarContainer}>
                {hasAnyBudgetCategories ? (
                  <>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                            backgroundColor: getProgressColor(totalSpent, totalBudget)
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round((totalSpent / totalBudget) * 100)}% of budget used
                    </Text>
                  </>
                ) : (
                  <Text style={styles.progressText}>
                    Set up budget categories to track your spending progress
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.tabContainer}>
            <FilterButton
              filter="Budget Categories"
              isActive={activeTab === 'categories'}
              onPress={() => setActiveTab('categories')}
            />
            <FilterButton
              filter="Recent Expenses"
              isActive={activeTab === 'expenses'}
              onPress={() => setActiveTab('expenses')}
            />
          </View>

          {/* Content based on active tab */}
          {activeTab === 'categories' ? (
            <View style={styles.contentContainer}>
              {hasAnyBudgetCategories ? (
                /* Enhanced Categories Grid */
                <View style={styles.categoriesGrid}>
                  {categoriesWithBudget.map((category) => (
                    <View key={category.id} style={styles.categoryGridCard}>
                      <View style={styles.categoryCardHeader}>
                        <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '15' }]}>
                          <Text style={styles.categoryIcon}>{category.icon}</Text>
                        </View>
                        <CircularProgress 
                          percentage={getProgressPercentage(category.spent, category.allocated)}
                          color={getProgressColor(category.spent, category.allocated)}
                          size={60}
                        />
                      </View>
                      
                      <Text style={styles.categoryGridName}>{category.name}</Text>
                      
                      <View style={styles.categoryAmountContainer}>
                        <Text style={styles.categoryGridAmount}>
                          {currencyType} {category.spent.toLocaleString()}
                        </Text>
                        <Text style={styles.categoryGridBudget}>
                          of {category.allocated.toLocaleString()}
                        </Text>
                      </View>
                      
                      <View style={[
                        styles.categoryRemainingContainer,
                        { backgroundColor: (category.allocated - category.spent) >= 0 ? '#F0FDF4' : '#FEF2F2' }
                      ]}>
                        <Text style={[
                          styles.categoryGridRemaining,
                          { color: (category.allocated - category.spent) >= 0 ? '#16A34A' : '#EF4444' }
                        ]}>
                          {(category.allocated - category.spent) >= 0 ? ' ' : ' '}
                          {currencyType} {Math.abs(category.allocated - category.spent).toLocaleString()} 
                          {(category.allocated - category.spent) >= 0 ? ' left' : ' over'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                /* No Budget Categories Message */
                <View style={styles.noBudgetContainer}>
                  <View style={styles.noBudgetCard}>
                    <Text style={styles.noBudgetDescription}>
                      Set up your budget categories to start tracking your expenses and managing your finances effectively.
                    </Text>
                    <TouchableOpacity 
                      style={styles.addBudgetButton}
                      onPress={openBudgetModal}
                    >
                      <Text style={styles.addBudgetButtonText}>Add Budget Categories</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Expenses</Text>
              </View>
              
              {/* Enhanced Expenses List */}
              <View style={styles.expensesContainer}>
                {recentExpenses.map((expense) => (
                  <View key={expense.id} style={styles.expenseCard}>
                    <View style={styles.expenseLeft}>
                      <View style={styles.expenseIconContainer}>
                        <Text style={styles.expenseIcon}>
                          {budgetCategories.find(cat => cat.id === expense.categoryId)?.icon || '💳'}
                        </Text>
                      </View>
                      <View style={styles.expenseInfo}>
                        <Text style={styles.expenseName}>{expense.name}</Text>
                        <Text style={styles.expenseCategory}>{getCategoryName(expense.categoryId)}</Text>
                      </View>
                    </View>
                    <View style={styles.expenseRight}>
                      <Text style={styles.expenseAmount}>-{currencyType} {expense.amount.toLocaleString()}</Text>
                      <Text style={styles.expenseDate}>{expense.date} • {expense.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <FAB onPress={openAddExpenseModal} />

        <SelectPopup
          visible={showCategorySelector}
          modalType={modalType}
          budgetCategories={budgetCategories}
          onSelect={handleCategorySelect}
          onClose={handleCloseModal}
        />

        {/* Add Expense EditPopup */}
        <EditPopup
          visible={showAddExpenseModal}
          type="info"
          values={{
            [`Expense Name (${getSelectedCategoryName()})`]: expenseValues.name,
            [`Amount (${currencyType})`]: expenseValues.amount,
          }}
          onChange={(key, value) => {
            if (key.startsWith('Expense Name')) {
              handleExpenseValueChange('name', value);
            } else if (key === `Amount (${currencyType})`) {
              handleExpenseValueChange('amount', value);
            }
          }}
          onClose={handleCloseModal}
          onSubmit={handleAddExpense}
        />

        {/* Update Budget EditPopup */}
        <EditPopup
          visible={showBudgetModal}
          type="info"
          values={{
            [`New Budget for ${getSelectedCategoryName()} (${currencyType})`]: budgetValues.amount,
          }}
          onChange={(key, value) => {
            handleBudgetValueChange('amount', value);
          }}
          onClose={handleCloseModal}
          onSubmit={handleUpdateBudget}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 16,
    flexDirection: 'row',
    borderRadius: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerEditButton: {
    backgroundColor: theme.colors.lightPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    elevation: 2,
  },
  headerEditButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  currencyText: {
    fontSize: 14, // smaller font size
    fontWeight: 'normal',
    color: '#666', // lighter color if you want
  },
  // Enhanced Overview Card Styles
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    margin: 16,
    marginBottom: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    height: 170,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewValue: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#1E293B',

  },
  overviewLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarContainer: {
    borderRadius: 12,
    padding: 14,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Tab Container
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  contentContainer: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  editButton: {
    backgroundColor: theme.colors.lightPrimary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    elevation: 2,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // No Budget Categories Styles
  noBudgetContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noBudgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    maxWidth: 320,
  },
  noBudgetIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noBudgetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  noBudgetDescription: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addBudgetButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 2,
  },
  addBudgetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Enhanced Category Cards
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryGridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '47%',
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  categoryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    justifyContent: 'space-between',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentageText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  categoryGridName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryAmountContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryGridAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 2,
  },
  categoryGridBudget: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryRemainingContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  categoryGridRemaining: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  expensesContainer: {
    gap: 12,
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expenseIcon: {
    fontSize: 18,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

export default BudgetView;