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

export interface ExpenseResponseDTO {
  expenseId: number;
  expenseName: string;
  budgetCategory: string;
  tripId: number;
  totalExpenseAmount: number;  // Changed from amount to match backend
  expenseDateTime?: string;
  createdByParticipant?: TripParticipant;
  shares?: ExpenseShare[];
}

// Trip Budget Category DTO (matching backend structure)
export interface TripBudgetCategoryDto {
  limitId?: number;
  budgetCategory: BudgetCategorys;
  limitAmount: number;
  spentAmount: number;
  tripId: number;
}

// Budget related types
export interface BudgetCategory {
  budgetCategoryId?: number;
  tripId: number;
  budgetCategory: string;
  limitAmount: number;
  spentAmount: number;
}

export interface TripBudget {
  tripId: number;
  totalBudgetLimit: number;
  totalSpentAmount: number;
  tripBudgetCategories: TripBudgetCategoryDto[];
}


export enum BudgetCategorys {
  TRANSPORT = 'TRANSPORT',
  ACCOMMODATION = 'ACCOMMODATION',
  FOOD = 'FOOD',
  ACTIVITY = 'ACTIVITY',
  SHOPPING = 'SHOPPING',
  EMERGENCY = 'EMERGENCY',
  COMMUNICATION = 'COMMUNICATION',
  ENTRANCE_FEES = 'ENTRANCE_FEES',
  ENTERTAINMENT = 'ENTERTAINMENT',
  MISCELLANEOUS = 'MISCELLANEOUS'
}

export const BudgetCategoryDisplayNames: Record<BudgetCategorys, string> = {
  [BudgetCategorys.TRANSPORT]: 'Transport',
  [BudgetCategorys.ACCOMMODATION]: 'Accommodation',
  [BudgetCategorys.FOOD]: 'Food & Drinks',
  [BudgetCategorys.ACTIVITY]: 'Activities & Tours',
  [BudgetCategorys.SHOPPING]: 'Shopping',
  [BudgetCategorys.EMERGENCY]: 'Emergency',
  [BudgetCategorys.COMMUNICATION]: 'Communication',
  [BudgetCategorys.ENTRANCE_FEES]: 'Entrance Fees',
  [BudgetCategorys.ENTERTAINMENT]: 'Entertainment',
  [BudgetCategorys.MISCELLANEOUS]: 'Miscellaneous'
};

export const BudgetCategoryIcons: Record<BudgetCategorys, string> = {
  [BudgetCategorys.TRANSPORT]: '🚗',
  [BudgetCategorys.ACCOMMODATION]: '🏨',
  [BudgetCategorys.FOOD]: '🍽️',
  [BudgetCategorys.ACTIVITY]: '🎯',
  [BudgetCategorys.SHOPPING]: '🛍️',
  [BudgetCategorys.EMERGENCY]: '🚨',
  [BudgetCategorys.COMMUNICATION]: '📱',
  [BudgetCategorys.ENTRANCE_FEES]: '🎫',
  [BudgetCategorys.ENTERTAINMENT]: '🎭',
  [BudgetCategorys.MISCELLANEOUS]: '💼'
};

export const BudgetCategoryColors: Record<BudgetCategorys, string> = {
  [BudgetCategorys.TRANSPORT]: '#10B981',
  [BudgetCategorys.ACCOMMODATION]: '#3B82F6',
  [BudgetCategorys.FOOD]: '#F59E0B',
  [BudgetCategorys.ACTIVITY]: '#EF4444',
  [BudgetCategorys.SHOPPING]: '#8B5CF6',
  [BudgetCategorys.EMERGENCY]: '#DC2626',
  [BudgetCategorys.COMMUNICATION]: '#059669',
  [BudgetCategorys.ENTRANCE_FEES]: '#7C3AED',
  [BudgetCategorys.ENTERTAINMENT]: '#06B6D4',
  [BudgetCategorys.MISCELLANEOUS]: '#6B7280'
};

export interface CreateExpenseRequest {
  expenseName: string;
  tripId: number;
  budgetCategory: string;  // Changed to string to match backend
  shares?: ExpenseShare[];
  totalExpenseAmount: number;
  expenseDateTime?: string;
}

export interface UpdateExpenseRequest extends CreateExpenseRequest {
  expenseId: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}


