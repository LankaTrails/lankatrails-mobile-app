import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams } from 'expo-router';
import FAB from '../../../../components/FAB';
import EditPopup from '../../../../components/EditPopup';
import { theme } from '../../../theme';
import SelectPopup from '../../../../components/SelectPopup';
import BackButton from '../../../../components/BackButton';
import FilterButton from '../../../../components/FilterButton';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BudgetService } from '@/services/budgetService';
import { ExpenseService } from '@/services/expenseService';
import { BudgetCategorys, BudgetCategoryDisplayNames, BudgetCategoryIcons, BudgetCategoryColors, CreateExpenseRequest, TripBudgetCategoryDto } from '@/types/budgetTypes';
import { TripParticipant as ExpenseParticipant, ExpenseShare } from '@/types/expenseTypes';
import { getToken } from '@/utils/tokenStorage';
import { getTripParticipants } from '@/services/tripService';
import AddExpenseModal from '../../../../components/AddExpenseModal';
import ExpenseDetailsModal from '../../../../components/ExpenseDetailsModal';
import CategoryDetailsModal from '../../../../components/CategoryDetailsModal';



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
  budgetCategory?: BudgetCategorys;
}

interface Expense {
  id: string;
  categoryId: string;
  name: string;
  amount: number;
  date: string;
  time: string;
  createdByParticipant?: ExpenseParticipant;
  shares?: ExpenseShare[];
}

interface CircularProgressProps {
  percentage: number;
  color: string;
  size?: number;
}

const BudgetView = () => {
  const { id: tripId } = useLocalSearchParams();
  
  // Better trip ID validation
  console.log('[BudgetView] Raw tripId from params:', tripId);
  const numericTripId = parseInt(Array.isArray(tripId) ? tripId[0] : tripId as string);
  console.log('[BudgetView] Parsed numericTripId:', numericTripId);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showBudgetModal, setBudgetModal] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showExpenseDetailsModal, setShowExpenseDetailsModal] = useState(false);
  const [showCategoryDetailsModal, setShowCategoryDetailsModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCategoryData, setSelectedCategoryData] = useState<BudgetCategory | null>(null);
  const [modalType, setModalType] = useState<'expense' | 'budget'>('expense');
  
  // Navigation state
  const [activeTab, setActiveTab] = useState<'categories' | 'expenses'>('categories');
  
  // Form values for EditPopup
  const [budgetValues, setBudgetValues] = useState({
    amount: '',
  });

  // Animated blur overlay
  const blurOpacity = useRef(new Animated.Value(0)).current;

  // Data states
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [tripParticipants, setTripParticipants] = useState<TripParticipant[]>([]);
  const currencyType = 'LKR';

  const loadExpensesWithCategories = useCallback(async (categories: BudgetCategory[]) => {
    try {
      console.log('[BudgetView] Loading expenses for trip:', numericTripId);
      const expensesResponse = await ExpenseService.getExpensesByTripId(numericTripId);
      console.log('[BudgetView] Expenses response:', expensesResponse);
      
      if (expensesResponse.success && expensesResponse.data) {
        console.log('[BudgetView] Raw expenses data:', expensesResponse.data);
        
        // Convert API expenses to local format
        const convertedExpenses: Expense[] = expensesResponse.data.map((apiExpense) => {
          console.log('[BudgetView] Processing expense:', apiExpense);
          
          // Find the matching budget category to get the correct ID
          const matchingCategory = categories.find(cat => 
            cat.budgetCategory === apiExpense.budgetCategory
          );
          
          // Handle date formatting - use expenseDateTime if available
          let formattedDate = 'Recent';
          let formattedTime = '';
          
          if (apiExpense.expenseDateTime) {
            const expenseDate = new Date(apiExpense.expenseDateTime);
            formattedDate = expenseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            formattedTime = expenseDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
          }
          
          const convertedExpense = {
            id: apiExpense.expenseId.toString(),
            categoryId: matchingCategory?.id || apiExpense.budgetCategory,
            name: apiExpense.expenseName,
            amount: apiExpense.totalExpenseAmount, // Use totalExpenseAmount for the total expense
            date: formattedDate,
            time: formattedTime,
            createdByParticipant: apiExpense.createdByParticipant,
            shares: apiExpense.shares
          };
          
          console.log('[BudgetView] Converted expense:', convertedExpense);
          return convertedExpense;
        });
        
        console.log('[BudgetView] All converted expenses:', convertedExpenses);
        setExpenses(convertedExpenses);
      } else {
        console.warn('[BudgetView] No expenses data or unsuccessful response:', expensesResponse);
        setExpenses([]);
      }
    } catch (error) {
      console.error('[BudgetView] Failed to load expenses:', error);
      setError('Failed to load expenses');
      setExpenses([]);
    }
  }, [numericTripId]);

  const loadTripParticipants = useCallback(async () => {
    try {
      console.log('[BudgetView] Loading trip participants for trip:', numericTripId);
      const participantsResponse = await getTripParticipants(numericTripId);
      console.log('[BudgetView] Participants response:', participantsResponse);
      
      if (participantsResponse.success && participantsResponse.data) {
        setTripParticipants(participantsResponse.data);
      } else {
        console.warn('[BudgetView] Failed to load participants:', participantsResponse);
        // Don't set error as this is not critical - just means no collaborators available
        setTripParticipants([]);
      }
    } catch (error) {
      console.error('[BudgetView] Failed to load trip participants:', error);
      // Don't set error as this is not critical
      setTripParticipants([]);
    }
  }, [numericTripId]);

  const loadBudgetData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      // Validate trip ID before making API call
      if (isNaN(numericTripId) || numericTripId <= 0) {
        console.error('[BudgetView] Invalid trip ID for API call:', numericTripId);
        setError(`Invalid trip ID: ${tripId}`);
        return;
      }
      
      // Check if user is authenticated
      const accessToken = await getToken('ACCESS_TOKEN');
      console.log('[BudgetView] Access token available:', !!accessToken);
      
      console.log('[BudgetView] 🕐 Loading budget data for trip:', numericTripId, 'at', new Date().toISOString());
      const budgetResponse = await BudgetService.getTripBudgetDetails(numericTripId);
      console.log('[BudgetView] 📥 Budget response received at:', new Date().toISOString(), budgetResponse);
      
      if (budgetResponse.success && budgetResponse.data) {
        console.log('[BudgetView] 📊 RAW API RESPONSE DETAILED ANALYSIS:');
        console.log('[BudgetView] - Response success:', budgetResponse.success);
        console.log('[BudgetView] - Total budget limit:', budgetResponse.data.totalBudgetLimit);
        console.log('[BudgetView] - Trip budget categories count:', budgetResponse.data.tripBudgetCategories?.length || 0);
        
        budgetResponse.data.tripBudgetCategories?.forEach((apiCategory, index) => {
          console.log(`[BudgetView] - Category ${index + 1}:`, {
            category: apiCategory.budgetCategory,
            limitId: apiCategory.limitId,
            limitAmount: apiCategory.limitAmount,
            spentAmount: apiCategory.spentAmount,
            rawData: apiCategory
          });
        });
        
        console.log('[BudgetView] Setting total budget to:', budgetResponse.data.totalBudgetLimit || 0);
        setTotalBudget(budgetResponse.data.totalBudgetLimit || 0);
        
        // Convert API data to local format
        const convertedCategories: BudgetCategory[] = budgetResponse.data.tripBudgetCategories.map((apiCategory) => ({
          id: apiCategory.limitId?.toString() || Math.random().toString(),
          name: BudgetCategoryDisplayNames[apiCategory.budgetCategory as keyof typeof BudgetCategoryDisplayNames] || apiCategory.budgetCategory,
          allocated: apiCategory.limitAmount || 0,
          spent: apiCategory.spentAmount || 0,
          color: BudgetCategoryColors[apiCategory.budgetCategory as keyof typeof BudgetCategoryColors] || '#6B7280',
          icon: BudgetCategoryIcons[apiCategory.budgetCategory as keyof typeof BudgetCategoryIcons] || '💼',
          budgetCategory: apiCategory.budgetCategory as BudgetCategorys
        }));
        
        console.log('[BudgetView] Raw API data:', budgetResponse.data.tripBudgetCategories.map(cat => ({ 
          category: cat.budgetCategory, 
          limitAmount: cat.limitAmount, 
          spentAmount: cat.spentAmount 
        })));
        console.log('[BudgetView] Converting to local format...');
        console.log('[BudgetView] Setting budget categories to:', convertedCategories.map(cat => ({ name: cat.name, spent: cat.spent, allocated: cat.allocated })));
        
        // Use functional update to ensure React detects the change
        setBudgetCategories(prevCategories => {
          console.log('[BudgetView] 🔄 STATE UPDATE - setBudgetCategories called at:', new Date().toISOString());
          console.log('[BudgetView] - Previous categories:', prevCategories.map(cat => ({ 
            name: cat.name, 
            spent: cat.spent, 
            allocated: cat.allocated,
            id: cat.id 
          })));
          console.log('[BudgetView] - New categories:', convertedCategories.map(cat => ({ 
            name: cat.name, 
            spent: cat.spent, 
            allocated: cat.allocated,
            id: cat.id 
          })));
          console.log('[BudgetView] - Are they different?', JSON.stringify(prevCategories) !== JSON.stringify(convertedCategories));
          return convertedCategories;
        });
        console.log('[BudgetView] ✅ Budget categories state update completed');
        
        // Load expenses after budget categories are set
        await loadExpensesWithCategories(convertedCategories);
        
        // Load trip participants for expense sharing
        await loadTripParticipants();
      } else {
        console.warn('[BudgetView] Budget response unsuccessful:', budgetResponse);
        setError(budgetResponse.message || 'Failed to load budget data');
      }
    } catch (error: any) {
      console.error('[BudgetView] Failed to load budget data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load budget data';
      setError(`Error loading budget: ${errorMessage}`);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [numericTripId, loadExpensesWithCategories, loadTripParticipants, tripId]);

  const loadExpenses = useCallback(async () => {
    await loadExpensesWithCategories(budgetCategories);
  }, [loadExpensesWithCategories, budgetCategories]);

  // Load data on component mount
  useEffect(() => {
    loadBudgetData();
  }, [loadBudgetData]);

  // Load expenses when switching to expenses tab
  useEffect(() => {
    if (activeTab === 'expenses' && budgetCategories.length > 0) {
      console.log('[BudgetView] Loading expenses for expenses tab, categories available:', budgetCategories.length);
      loadExpenses();
    }
  }, [activeTab, loadExpenses, budgetCategories.length]);

  // Effect to handle blur animation
  useEffect(() => {
    const isAnyModalVisible = showAddExpenseModal || showBudgetModal || showCategorySelector || showExpenseDetailsModal || showCategoryDetailsModal;
    if (isAnyModalVisible) {
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      blurOpacity.setValue(0);
    }
  }, [showAddExpenseModal, showBudgetModal, showCategorySelector, showExpenseDetailsModal, showCategoryDetailsModal, blurOpacity]);



  // Calculate expense totals by category from actual expenses
  const calculateCategoryExpenses = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      if (categoryTotals[expense.categoryId]) {
        categoryTotals[expense.categoryId] += expense.amount;
      } else {
        categoryTotals[expense.categoryId] = expense.amount;
      }
    });
    
    console.log('[BudgetView] 🧮 CALCULATED EXPENSE TOTALS BY CATEGORY:', categoryTotals);
    return categoryTotals;
  }, [expenses]);

  // Update budget categories with calculated expense totals
  const budgetCategoriesWithCalculatedSpent = useMemo(() => {
    const updatedCategories = budgetCategories.map(category => ({
      ...category,
      spent: calculateCategoryExpenses[category.id] || 0
    }));
    
    console.log('[BudgetView] � UPDATED CATEGORIES WITH CALCULATED SPENT:');
    updatedCategories.forEach(cat => {
      console.log(`[BudgetView] - ${cat.name}: spent ${cat.spent} (was ${budgetCategories.find(bc => bc.id === cat.id)?.spent || 0})`);
    });
    
    return updatedCategories;
  }, [budgetCategories, calculateCategoryExpenses]);

  // Filter categories with budget > 0 - with memoization using calculated spent values
  const categoriesWithBudget = useMemo(() => {
    return budgetCategoriesWithCalculatedSpent.filter(cat => cat.allocated > 0);
  }, [budgetCategoriesWithCalculatedSpent]);
  
  const hasAnyBudgetCategories = categoriesWithBudget.length > 0;

  // Calculate total spent from actual expenses (not from API spent values)
  const totalSpent = useMemo(() => {
    const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    console.log('[BudgetView] 🔢 RECALCULATING TOTAL SPENT FROM EXPENSES:');
    console.log('[BudgetView] - Total calculated from expenses:', spent);
    console.log('[BudgetView] - Number of expenses:', expenses.length);
    console.log('[BudgetView] - Expense amounts:', expenses.map(e => ({ name: e.name, amount: e.amount, category: e.categoryId })));
    return spent;
  }, [expenses]);
  
  const remainingBudget = useMemo(() => {
    return totalBudget - totalSpent;
  }, [totalBudget, totalSpent]);

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
  const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, color, size = 70 }) => {
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

  const handleBudgetValueChange = (key: string, value: string) => {
    setBudgetValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const openAddExpenseModal = () => {
    setShowAddExpenseModal(true);
  };



  const handleCategorySelect = (categoryId: string) => {
    console.log('[BudgetView] Category selected:', categoryId, 'for modalType:', modalType);
    setSelectedCategory(categoryId);
    setShowCategorySelector(false);
    
    if (modalType === 'expense') {
      setShowAddExpenseModal(true);
    } else {
      setBudgetModal(true);
    }
  };

  const handleAddExpense = async (expenseData: {
    name: string;
    amount: number;
    categoryId: string;
    payerId?: number;
    collaboratorShares: { participantId: number; amount: string }[];
  }) => {
    try {
      // Check authentication first
      const accessToken = await getToken('ACCESS_TOKEN');
      if (!accessToken) {
        Alert.alert('Error', 'Please log in to add expenses');
        return;
      }

      // Validate trip ID
      console.log('[BudgetView] Validating trip ID for expense creation:', numericTripId);
      if (isNaN(numericTripId) || numericTripId <= 0) {
        console.error('[BudgetView] Invalid trip ID for expense creation:', numericTripId);
        Alert.alert('Error', `Invalid trip ID: ${tripId}`);
        return;
      }

      // Get the selected category - check both existing categories and all available categories
      let selectedCategoryData = budgetCategoriesWithCalculatedSpent.find(cat => cat.id === expenseData.categoryId);
      
      // If not found in existing categories, check all available categories (includes categories without limits)
      if (!selectedCategoryData) {
        const allAvailableCategories = getAllAvailableCategories();
        selectedCategoryData = allAvailableCategories.find(cat => cat.id === expenseData.categoryId);
      }
      
      // If "OTHER" was selected, use MISCELLANEOUS budget category
      if (expenseData.categoryId === 'OTHER') {
        selectedCategoryData = {
          id: 'OTHER',
          name: 'Other',
          allocated: 0,
          spent: 0,
          color: '#6B7280',
          icon: '💼',
          budgetCategory: BudgetCategorys.MISCELLANEOUS
        };
      }

      if (!selectedCategoryData || !selectedCategoryData.budgetCategory) {
        console.log('[BudgetView] Invalid category for expense:', expenseData.categoryId);
        Alert.alert('Error', 'Invalid category selected');
        return;
      }

      console.log('[BudgetView] Creating expense with category:', selectedCategoryData);
      console.log('[BudgetView] Expense data received:', expenseData);

      // Prepare shares array from collaborator shares
      const shares: any[] = expenseData.collaboratorShares.map(share => {
        if (share.participantId === -1) {
          // Current user - we'll need to get current user info from somewhere
          // For now, let's create a temporary participant object
          return {
            amount: parseFloat(share.amount),
            participant: {
              participantId: -1, // Backend should handle this as current user
              firstName: "You",
              lastName: "",
              profileImageUrl: undefined
            }
          };
        } else {
          // Find the participant from tripParticipants
          const participant = tripParticipants.find(p => p.participantId === share.participantId);
          if (participant) {
            return {
              amount: parseFloat(share.amount),
              participant: {
                participantId: participant.participantId,
                firstName: participant.firstName,
                lastName: participant.lastName,
                profileImageUrl: participant.profileImageUrl
              }
            };
          }
        }
        return null;
      }).filter(share => share !== null);

      console.log('[BudgetView] Prepared shares:', shares);

      // Create expense through API
      const createExpenseRequest: CreateExpenseRequest = {
        expenseName: expenseData.name,
        tripId: numericTripId,
        budgetCategory: selectedCategoryData.budgetCategory!,
        shares: shares,
        totalExpenseAmount: expenseData.amount || expenseData.collaboratorShares.reduce((sum, share) => sum + parseFloat(share.amount || '0'), 0)
      };

      console.log('[BudgetView] Expense data being sent:', JSON.stringify(createExpenseRequest, null, 2));

      const response = await ExpenseService.createExpense(createExpenseRequest);
      
      console.log('[BudgetView] Expense creation response:', response);
      
      if (response.success) {
        console.log('[BudgetView] Expense created successfully, reloading data');
        
        // Reload budget data which will also reload expenses
        await loadBudgetData(false);
        
        // Close modal
        setShowAddExpenseModal(false);
        
        Alert.alert('Success', 'Expense added successfully');
      } else {
        console.error('[BudgetView] Expense creation failed:', response);
        Alert.alert('Error', response.message || 'Failed to add expense');
      }
    } catch (error: any) {
      console.error('[BudgetView] Failed to add expense:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add expense';
      Alert.alert('Error', `Failed to add expense: ${errorMessage}`);
    }
  };

  const handleUpdateBudget = async () => {
    if (!budgetValues.amount.trim() || !selectedCategory) {
      Alert.alert('Error', 'Please enter a budget amount');
      return;
    }

    const amount = parseFloat(budgetValues.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      // For budget setting, check both existing categories and generated categories
      let selectedCategoryData = budgetCategoriesWithCalculatedSpent.find(cat => cat.id === selectedCategory);
      
      // If not found in existing categories, check if it's a category type from generated list
      if (!selectedCategoryData) {
        const allCategories = getAllAvailableCategories();
        selectedCategoryData = allCategories.find(cat => cat.id === selectedCategory);
      }
      
      if (!selectedCategoryData || !selectedCategoryData.budgetCategory) {
        console.log('[BudgetView] Selected category not found:', selectedCategory);
        console.log('[BudgetView] Available categories:', budgetCategoriesWithCalculatedSpent.map(cat => ({ id: cat.id, budgetCategory: cat.budgetCategory })));
        Alert.alert('Error', 'Invalid category selected');
        return;
      }

      console.log('[BudgetView] Using category for budget update:', selectedCategoryData);

      // Update budget through API
      const budgetData: TripBudgetCategoryDto = {
        tripId: numericTripId,
        budgetCategory: selectedCategoryData.budgetCategory!,
        limitAmount: amount,
        spentAmount: selectedCategoryData.spent
      };

      const response = await BudgetService.addOrUpdateBudgetCategory(budgetData);
      
      if (response.success) {
        // Reload data to reflect changes
        await loadBudgetData(false);
        
        setBudgetValues({ amount: '' });
        setSelectedCategory('');
        setBudgetModal(false);
        
        Alert.alert('Success', 'Budget updated successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to update budget');
      }
    } catch (error) {
      console.error('Failed to update budget:', error);
      Alert.alert('Error', 'Failed to update budget');
    }
  };

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowExpenseDetailsModal(true);
  };

  const handleCategoryCardClick = (category: BudgetCategory) => {
    console.log('[BudgetView] Category card clicked:', category.name);
    setSelectedCategoryData(category);
    setSelectedCategory(category.id);
    setShowCategoryDetailsModal(true);
  };

  const handleExpenseUpdated = async () => {
    console.log('[BudgetView] ⭐ EXPENSE UPDATED - Starting reload process...');
    
    // Add a small delay to ensure backend has processed the update
    console.log('[BudgetView] Waiting 500ms for backend to process update...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reload budget data which will also reload expenses (without showing loading spinner)
    console.log('[BudgetView] Calling loadBudgetData to refresh data...');
    await loadBudgetData(false);
    
    console.log('[BudgetView] ✅ Data reload completed after expense update');
  };

  const handleExpenseDeleted = async () => {
    console.log('[BudgetView] ⭐ EXPENSE DELETED - Starting reload process...');
    
    // Add a small delay to ensure backend has processed the deletion
    console.log('[BudgetView] Waiting 500ms for backend to process deletion...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reload budget data which will also reload expenses (without showing loading spinner)
    console.log('[BudgetView] Calling loadBudgetData to refresh data...');
    await loadBudgetData(false);
    
    console.log('[BudgetView] ✅ Data reload completed after expense deletion');
  };

  const handleCloseModal = () => {
    if (showAddExpenseModal) {
      setShowAddExpenseModal(false);
    } else if (showBudgetModal) {
      setBudgetModal(false);
    } else if (showCategorySelector) {
      setShowCategorySelector(false);
    } else if (showExpenseDetailsModal) {
      setShowExpenseDetailsModal(false);
      setSelectedExpense(null);
    } else if (showCategoryDetailsModal) {
      setShowCategoryDetailsModal(false);
      setSelectedCategoryData(null);
    }
    
    // Reset budget form data
    setBudgetValues({ amount: '' });
    setSelectedCategory('');
  };

  const getCategoryName = (categoryId: string) => {
    // First check existing budget categories with calculated spent
    let category = budgetCategoriesWithCalculatedSpent.find(cat => cat.id === categoryId);
    
    // If not found, check all available categories (includes categories without limits)
    if (!category) {
      const allAvailableCategories = getAllAvailableCategories();
      category = allAvailableCategories.find(cat => cat.id === categoryId);
    }
    
    return category?.name || 'Unknown';
  };

  const getSelectedCategoryName = () => {
    // First check existing budget categories with calculated spent
    let category = budgetCategoriesWithCalculatedSpent.find(cat => cat.id === selectedCategory);
    
    // If not found, check generated categories (for budget setting)
    if (!category) {
      const allCategories = getAllAvailableCategories();
      category = allCategories.find(cat => cat.id === selectedCategory);
    }
    
    return category?.name || '';
  };

  // Generate all available budget categories for SelectPopup
  const getAllAvailableCategories = (): BudgetCategory[] => {
    const allCategories: BudgetCategory[] = [];
    
    console.log('[BudgetView] Generating all available categories, existing categories:', budgetCategories.length);
    
    // Create entries for all budget category types
    Object.values(BudgetCategorys).forEach((categoryType) => {
      const existingCategory = budgetCategoriesWithCalculatedSpent.find(cat => cat.budgetCategory === categoryType);
      
      if (existingCategory) {
        // Use existing category data with calculated spent
        allCategories.push(existingCategory);
      } else {
        // Create a new category with calculated spent amount
        const calculatedSpent = calculateCategoryExpenses[categoryType] || 0;
        allCategories.push({
          id: categoryType,
          name: BudgetCategoryDisplayNames[categoryType],
          allocated: 0,
          spent: calculatedSpent,
          color: BudgetCategoryColors[categoryType],
          icon: BudgetCategoryIcons[categoryType],
          budgetCategory: categoryType
        });
      }
    });
    
    console.log('[BudgetView] Generated categories for SelectPopup:', allCategories.length);
    return allCategories;
  };

  // Get all categories for display (both with and without budget limits) - use calculated spent values
  const allDisplayCategories = getAllAvailableCategories();

  const recentExpenses = expenses.slice().reverse(); // Show all expenses, most recent first



  // Check for invalid trip ID
  if (isNaN(numericTripId)) {
    console.error('[BudgetView] Invalid trip ID:', tripId);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Invalid trip ID: {tripId}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      {/* Animated Blur Overlay */}
      {(showAddExpenseModal || showBudgetModal || showCategorySelector || showExpenseDetailsModal || showCategoryDetailsModal) && (
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
          <View style={styles.headerRightSpace}></View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 150 }}>
          {/* Loading State */}
          {loading && (
            <View style={styles.centerContainer}>
              <Text style={styles.loadingText}>Loading budget data...</Text>
            </View>
          )}
          
          {/* Error State */}
          {error && !loading && (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => { loadBudgetData(); loadExpenses(); }} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
              {error.includes('Authentication') && (
                <TouchableOpacity 
                  onPress={() => {
                    // Navigate to login screen - you can implement this based on your auth flow
                    console.log('Navigate to login');
                  }} 
                  style={[styles.retryButton, { backgroundColor: '#3B82F6', marginTop: 10 }]}
                >
                  <Text style={styles.retryButtonText}>Go to Login</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {!loading && !error && (
            <>
          {/* Enhanced Budget Overview Card - Always show */}
          <View key={`overview-${totalSpent}-${totalBudget}-${expenses.length}`} style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
            </View>
            
            <View style={styles.overviewRow}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}> {totalBudget.toLocaleString()}</Text>
                <Text style={styles.overviewLabel}>Total Budget</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: '#EF4444' }]}>
                  {(() => {
                    console.log('[BudgetView] 🎯 RENDERING SPENT VALUE:', totalSpent);
                    return totalSpent.toLocaleString();
                  })()}
                </Text>
                <Text style={styles.overviewLabel}>Spent</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: remainingBudget >= 0 ? '#008080' : '#EF4444' }]}>
                  {(() => {
                    console.log('[BudgetView] 🎯 RENDERING REMAINING VALUE:', remainingBudget);
                    return hasAnyBudgetCategories ? Math.abs(remainingBudget).toLocaleString() : totalSpent.toLocaleString();
                  })()}
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
              {/* Enhanced Categories Grid - Show All Categories */}
              <View key={`categories-${expenses.length}-${totalSpent}`} style={styles.categoriesGrid}>
                {allDisplayCategories.map((category) => (
                  <TouchableOpacity 
                    key={`${category.id}-${category.spent}-${category.allocated}`} 
                    style={styles.categoryGridCard}
                    onPress={() => handleCategoryCardClick(category)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryCardHeader}>
                      <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '15' }]}>
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                      </View>
                      {category.allocated > 0 ? (
                        // Show progress circle for categories with budget limits
                        <CircularProgress 
                          percentage={getProgressPercentage(category.spent, category.allocated)}
                          color={getProgressColor(category.spent, category.allocated)}
                          size={60}
                        />
                      ) : (
                        // Show spent amount only for categories without budget limits
                        <View style={styles.simpleAmountContainer}>
                          <Text style={styles.simpleSpentAmount}>
                            {currencyType} {category.spent.toLocaleString()}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.categoryGridName}>{category.name}</Text>
                    
                    {category.allocated > 0 ? (
                      // Show budget details for categories with limits
                      <>
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
                      </>
                    ) : (
                      // Show simple spent amount for categories without limits
                      <View style={styles.noBudgetCategoryContainer}>
                        <Text style={styles.noBudgetCategoryText}>No budget limit</Text>
                        {category.spent > 0 && (
                          <Text style={styles.noBudgetSpentText}>
                            Total spent: {currencyType} {category.spent.toLocaleString()}
                          </Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Expenses</Text>
                <View style={styles.expenseHeaderActions}>
                </View>
              </View>
              
              {/* Enhanced Expenses List */}
              <View style={styles.expensesContainer}>
                {recentExpenses.length > 0 ? (
                  recentExpenses.map((expense) => (
                    <TouchableOpacity 
                      key={expense.id} 
                      style={styles.expenseCard}
                      onPress={() => handleExpenseClick(expense)}
                    >
                      <View style={styles.expenseLeft}>
                        <View style={styles.expenseIconContainer}>
                          <Text style={styles.expenseIcon}>
                            {getAllAvailableCategories().find(cat => cat.id === expense.categoryId)?.icon || '💳'}
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
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noExpensesContainer}>
                    <View style={styles.noExpensesCard}>
                      <Text style={styles.noExpensesIcon}>💸</Text>
                      <Text style={styles.noExpensesTitle}>No Expenses Yet</Text>
                      <Text style={styles.noExpensesDescription}>
                        Start tracking your trip expenses by adding your first expense.
                      </Text>
                      <TouchableOpacity 
                        style={styles.addExpenseButton}
                        onPress={openAddExpenseModal}
                      >
                        <Text style={styles.addExpenseButtonText}>Add First Expense</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
          </>
          )}
        </ScrollView>

        <FAB onPress={openAddExpenseModal} />

        {/* New Combined Add Expense Modal */}
        <AddExpenseModal
          visible={showAddExpenseModal}
          budgetCategories={getAllAvailableCategories()}
          tripParticipants={tripParticipants}
          currencyType={currencyType}
          onClose={() => setShowAddExpenseModal(false)}
          onSubmit={handleAddExpense}
        />

        <SelectPopup
          visible={showCategorySelector}
          modalType={modalType}
          budgetCategories={modalType === 'budget' ? getAllAvailableCategories() : budgetCategories.filter(cat => cat.allocated > 0)}
          onSelect={handleCategorySelect}
          onClose={handleCloseModal}
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

        {/* Expense Details Modal */}
        <ExpenseDetailsModal
          visible={showExpenseDetailsModal}
          expense={selectedExpense}
          budgetCategories={getAllAvailableCategories()}
          tripParticipants={tripParticipants}
          currencyType={currencyType}
          tripId={numericTripId}
          onClose={() => setShowExpenseDetailsModal(false)}
          onExpenseUpdated={handleExpenseUpdated}
          onExpenseDeleted={handleExpenseDeleted}
        />

        {/* Category Details Modal */}
        <CategoryDetailsModal
          visible={showCategoryDetailsModal}
          category={selectedCategoryData}
          expenses={expenses}
          currencyType={currencyType}
          onClose={handleCloseModal}
          onEditBudget={() => {
            if (selectedCategoryData) {
              setModalType('budget');
              setBudgetValues({ amount: selectedCategoryData.allocated.toString() || '' });
              setShowCategoryDetailsModal(false);
              setBudgetModal(true);
            }
          }}
          onExpensePress={(expense) => {
            setSelectedExpense(expense);
            setShowCategoryDetailsModal(false);
            setShowExpenseDetailsModal(true);
          }}
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
  headerRightSpace: {
    width: 25, // Same width as the icon that was removed
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  expenseCount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  noExpensesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noExpensesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    maxWidth: 320,
  },
  noExpensesIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noExpensesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  noExpensesDescription: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addExpenseButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 2,
  },
  addExpenseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  expenseHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 4,
  },
  // New styles for categories without budget limits
  simpleAmountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  simpleSpentAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  noBudgetCategoryContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noBudgetCategoryText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  noBudgetSpentText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },

});

export default BudgetView;