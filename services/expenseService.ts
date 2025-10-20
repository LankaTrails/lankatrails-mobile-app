import axiosInstance from '../api/axiosInstance';
import { BudgetCategorys } from '../types/budgetTypes';
import {
  ApiResponse,
  CreateExpenseRequest,
  ExpenseResponseDTO,
  UpdateExpenseRequest,
  ExpenseFilters,
  ExpenseSortBy,
  ExpenseValidationResult,
  EXPENSE_VALIDATION
} from '../types/expenseTypes';

// Base API endpoints
const EXPENSE_ENDPOINTS = {
  CREATE: '/trips/expense/create',
  UPDATE: (expenseId: number) => `/trips/expense/${expenseId}`,
  DELETE: (expenseId: number) => `/trips/expense/${expenseId}`,
  GET_BY_TRIP: (tripId: number) => `/trips/expenses/${tripId}`,
} as const;

/**
 * Service class for handling expense-related API calls
 */
export class ExpenseService {
  
  /**
   * Creates a new expense for a trip
   * @param expenseData The expense data to create
   * @returns Promise with the API response
   */
  static async createExpense(expenseData: CreateExpenseRequest): Promise<ApiResponse<string>> {
    try {
      const response = await axiosInstance.post<ApiResponse<string>>(
        EXPENSE_ENDPOINTS.CREATE,
        expenseData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  /**
   * Updates an existing expense
   * @param expenseId The ID of the expense to update
   * @param expenseData The updated expense data
   * @returns Promise with the API response
   */
  static async updateExpense(
    expenseId: number, 
    expenseData: Omit<UpdateExpenseRequest, 'expenseId'>
  ): Promise<ApiResponse<string>> {
    try {
      const response = await axiosInstance.put<ApiResponse<string>>(
        EXPENSE_ENDPOINTS.UPDATE(expenseId),
        expenseData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  /**
   * Deletes an expense
   * @param expenseId The ID of the expense to delete
   * @returns Promise with the API response
   */
  static async deleteExpense(expenseId: number): Promise<ApiResponse<string>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<string>>(
        EXPENSE_ENDPOINTS.DELETE(expenseId)
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  /**
   * Gets all expenses for a specific trip
   * @param tripId The ID of the trip
   * @returns Promise with the list of expenses
   */
  static async getExpensesByTripId(tripId: number): Promise<ApiResponse<ExpenseResponseDTO[]>> {
    try {
      console.log('[ExpenseService] Fetching expenses for trip:', tripId);
      console.log('[ExpenseService] Trip ID type:', typeof tripId);
      console.log('[ExpenseService] Trip ID value:', tripId);
      console.log('[ExpenseService] Making request to:', EXPENSE_ENDPOINTS.GET_BY_TRIP(tripId));
      
      const response = await axiosInstance.get<ApiResponse<ExpenseResponseDTO[]>>(
        EXPENSE_ENDPOINTS.GET_BY_TRIP(tripId)
      );
      
      console.log('[ExpenseService] Response received:', response.data);
      console.log('[ExpenseService] Response status:', response.status);
      console.log('[ExpenseService] Response success:', response.data.success);
      console.log('[ExpenseService] Response message:', response.data.message);
      console.log('[ExpenseService] Response data length:', response.data.data?.length || 0);
      
      if (response.data.success && response.data.data && response.data.data.length === 0) {
        console.warn('[ExpenseService] ⚠️  API returned empty array - this might indicate:');
        console.warn('[ExpenseService] 1. No expenses exist for this trip');
        console.warn('[ExpenseService] 2. Backend service implementation issue');
        console.warn('[ExpenseService] 3. Database query not returning results');
        console.warn('[ExpenseService] Check backend logs and TripExpenseServiceImpl.getExpensesByTripId()');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('[ExpenseService] Error fetching expenses:', error);
      console.error('[ExpenseService] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Gets expenses for a trip with filters and sorting
   * @param tripId The ID of the trip
   * @param filters Optional filters to apply
   * @param sortBy Optional sorting criteria
   * @returns Promise with the filtered and sorted list of expenses
   */
  static async getFilteredExpenses(
    tripId: number,
    filters?: ExpenseFilters,
    sortBy?: ExpenseSortBy
  ): Promise<ApiResponse<ExpenseResponseDTO[]>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.categories && filters.categories.length > 0) {
        params.append('categories', filters.categories.join(','));
      }
      
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.startDate);
        params.append('endDate', filters.dateRange.endDate);
      }
      
      if (filters?.amountRange) {
        params.append('minAmount', filters.amountRange.min.toString());
        params.append('maxAmount', filters.amountRange.max.toString());
      }
      
      if (filters?.createdBy && filters.createdBy.length > 0) {
        params.append('createdBy', filters.createdBy.join(','));
      }
      
      if (sortBy) {
        params.append('sortBy', sortBy);
      }

      const queryString = params.toString();
      const url = `${EXPENSE_ENDPOINTS.GET_BY_TRIP(tripId)}${queryString ? `?${queryString}` : ''}`;
      
      const response = await axiosInstance.get<ApiResponse<ExpenseResponseDTO[]>>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered expenses:', error);
      throw error;
    }
  }

  /**
   * Calculates expense splits for equal sharing
   * @param totalAmount The total amount to split
   * @param participantCount Number of participants
   * @returns Array of equal shares
   */
  static calculateEqualSplit(totalAmount: number, participantCount: number): number[] {
    if (participantCount === 0) return [];
    
    const equalAmount = totalAmount / participantCount;
    const shares = new Array(participantCount).fill(equalAmount);
    
    // Handle rounding by adding remainder to first participant
    const remainder = totalAmount - (equalAmount * participantCount);
    if (remainder !== 0) {
      shares[0] += remainder;
    }
    
    return shares;
  }

  /**
   * Calculates expense splits based on percentages
   * @param totalAmount The total amount to split
   * @param percentages Array of percentages for each participant
   * @returns Array of calculated shares
   */
  static calculatePercentageSplit(totalAmount: number, percentages: number[]): number[] {
    if (percentages.length === 0) return [];
    
    const totalPercentage = percentages.reduce((sum, percentage) => sum + percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error('Percentages must add up to 100%');
    }
    
    return percentages.map(percentage => (totalAmount * percentage) / 100);
  }

  /**
   * Validates expense data before submission
   * @param expenseData The expense data to validate
   * @returns Object with validation result and error messages
   */
  static validateExpenseData(expenseData: CreateExpenseRequest): ExpenseValidationResult {
    const errors: string[] = [];

    // Validate expense name
    if (!expenseData.expenseName || expenseData.expenseName.trim().length === 0) {
      errors.push('Expense name is required');
    }
    if (expenseData.expenseName.length > EXPENSE_VALIDATION.NAME_MAX_LENGTH) {
      errors.push(`Expense name must be less than ${EXPENSE_VALIDATION.NAME_MAX_LENGTH} characters`);
    }

    // Validate trip ID
    if (!expenseData.tripId || expenseData.tripId <= 0) {
      errors.push('Valid trip ID is required');
    }

    // Validate budget category
    if (!expenseData.budgetCategory || !Object.values(BudgetCategorys).map(cat => cat.toString()).includes(expenseData.budgetCategory)) {
      errors.push('Valid budget category is required');
    }

    // Validate total amount
    if (!expenseData.totalExpenseAmount || expenseData.totalExpenseAmount <= EXPENSE_VALIDATION.MIN_AMOUNT) {
      errors.push('Total expense amount must be greater than 0');
    }

    // Validate shares if provided
    if (expenseData.shares && expenseData.shares.length > 0) {
      // Validate individual shares
      const sharesTotal = expenseData.shares.reduce((total, share) => total + share.amount, 0);
      const tolerance = 0.01; // Allow small rounding differences
      
      if (Math.abs(sharesTotal - expenseData.totalExpenseAmount) > tolerance) {
        errors.push('Sum of shares must equal total expense amount');
      }

      // Validate each share
      expenseData.shares.forEach((share, index) => {
        if (!share.participant || !share.participant.participantId) {
          errors.push(`Share ${index + 1}: Valid participant is required`);
        }
        if (!share.amount || share.amount <= 0) {
          errors.push(`Share ${index + 1}: Amount must be greater than 0`);
        }
      });
    }
    // If no shares provided, that's okay - backend will create default share

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formats currency amount for display
   * @param amount The amount to format
   * @param currency The currency code (default: LKR)
   * @returns Formatted currency string
   */
  static formatCurrency(amount: number, currency: string = 'LKR'): string {
    if (currency === 'LKR') {
      return `Rs. ${amount.toLocaleString('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Formats date for display
   * @param dateString ISO date string
   * @returns Formatted date string
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Formats time for display
   * @param dateString ISO date string
   * @returns Formatted time string
   */
  static formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Groups expenses by category
   * @param expenses Array of expenses
   * @returns Object with expenses grouped by category
   */
  static groupExpensesByCategory(expenses: ExpenseResponseDTO[]): Record<string, ExpenseResponseDTO[]> {
    return expenses.reduce((groups, expense) => {
      const category = expense.budgetCategory;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(expense);
      return groups;
    }, {} as Record<string, ExpenseResponseDTO[]>);
  }

  /**
   * Calculates total amount for a list of expenses
   * @param expenses Array of expenses
   * @returns Total amount
   */
  static calculateTotal(expenses: ExpenseResponseDTO[]): number {
    return expenses.reduce((total, expense) => total + expense.totalExpenseAmount, 0);
  }

  /**
   * Calculates total amount by category
   * @param expenses Array of expenses
   * @returns Object with totals by category
   */
  static calculateTotalByCategory(expenses: ExpenseResponseDTO[]): Record<string, number> {
    const groupedExpenses = this.groupExpensesByCategory(expenses);
    const totals: Record<string, number> = {};
    
    Object.keys(groupedExpenses).forEach(category => {
      totals[category] = this.calculateTotal(groupedExpenses[category]);
    });
    
    return totals;
  }
}

export default ExpenseService;
