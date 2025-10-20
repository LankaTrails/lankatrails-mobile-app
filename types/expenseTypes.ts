import { BudgetCategorys } from './budgetTypes';

export interface TripParticipant {
  participantId: number;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

export interface ExpenseShare {
  expenseId?: number;
  amount: number;
  participant: TripParticipant;
}

export interface ExpenseDTO {
  expenseId?: number;
  expenseName: string;
  tripId: number;
  budgetCategory: string;
  shares?: ExpenseShare[];
  expenseDateTime?: string;
  createdByParticipant?: TripParticipant;
  isThroughApp: boolean;
  totalExpenseAmount: number;
}

export interface CreateExpenseRequest {
  expenseName: string;
  tripId: number;
  budgetCategory: string;
  shares?: ExpenseShare[];
  totalExpenseAmount: number;
  expenseDateTime?: string;
}

export interface UpdateExpenseRequest extends CreateExpenseRequest {
  expenseId: number;
}

export interface ExpenseResponseDTO {
  expenseId: number;
  expenseName: string;
  budgetCategory: string;
  tripId: number;
  totalExpenseAmount: number;
  expenseDateTime?: string;
  createdByParticipant?: TripParticipant;
  shares?: ExpenseShare[];
  isThroughApp: boolean;
}

// Utility types for UI components
export interface ExpenseFormData {
  name: string;
  amount: string;
  category: BudgetCategorys | null;
  shares?: {
    participantId: number;
    amount: string;
  }[];
}

export interface ExpenseListItem {
  id: number;
  name: string;
  totalExpenseAmount: number;
  category: string;
  date: string;
  time: string;
  createdBy: string;
}

// Split types for different sharing methods
export enum SplitType {
  EQUAL = 'equal',
  PERCENTAGE = 'percentage',
  CUSTOM = 'custom'
}

export interface SplitCalculation {
  type: SplitType;
  participants: TripParticipant[];
  totalAmount: number;
  shares: {
    participantId: number;
    amount: number;
    percentage?: number;
  }[];
}

// Filter and sorting options
export interface ExpenseFilters {
  categories?: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  createdBy?: number[];
}

export enum ExpenseSortBy {
  DATE_DESC = 'expenseDateTime_desc',
  DATE_ASC = 'expenseDateTime_asc',
  AMOUNT_DESC = 'totalExpenseAmount_desc',
  AMOUNT_ASC = 'totalExpenseAmount_asc',
  NAME_ASC = 'expenseName_asc',
  NAME_DESC = 'expenseName_desc'
}

// Helper types for expense validation
export interface ExpenseValidationResult {
  isValid: boolean;
  errors: string[];
}

// API Response type for expense endpoints
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Constants for expense validation
export const EXPENSE_VALIDATION = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  MIN_AMOUNT: 0,
  AMOUNT_DECIMAL_PLACES: 2
} as const;

// Helper type for expense errors
export type ExpenseError = {
  field: string;
  message: string;
};

// Type for expense calculation results
export interface ExpenseCalculation {
  subTotal: number;
  totalShares: number;
  remainingAmount: number;
  isBalanced: boolean;
}
