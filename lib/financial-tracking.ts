import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Expense {
  id: string;
  category: 'medical' | 'food' | 'supplies' | 'utilities' | 'maintenance' | 'staff' | 'transport' | 'marketing' | 'other';
  subcategory?: string;
  description: string;
  amount: number;
  date: string;
  vendor?: string;
  paymentMethod: 'cash' | 'card' | 'check' | 'bank-transfer' | 'other';
  receiptUrl?: string;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  budgetCategory?: string;
  approvedBy?: string;
  petId?: string; // If expense is for specific pet
  tags: string[];
  notes?: string;
  isReimbursable: boolean;
  reimbursementStatus?: 'pending' | 'approved' | 'denied' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  source: 'donations' | 'adoption-fees' | 'grants' | 'fundraising' | 'sponsorship' | 'services' | 'other';
  description: string;
  amount: number;
  date: string;
  donorName?: string;
  donorContact?: string;
  isAnonymous: boolean;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'yearly';
  restrictedUse?: string; // Specific purpose for funds
  taxDeductible: boolean;
  receiptSent: boolean;
  campaignId?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  categories: Array<{
    category: Expense['category'];
    budgetedAmount: number;
    spentAmount: number;
    remainingAmount: number;
  }>;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  status: 'draft' | 'active' | 'completed' | 'overbudget';
  createdBy: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialReport {
  id: string;
  reportType: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  expensesByCategory: Record<string, number>;
  incomeBySource: Record<string, number>;
  budgetVariance?: Record<string, number>;
  generatedBy: string;
  generatedAt: string;
}

const EXPENSES_KEY = 'petpal_expenses';
const INCOME_KEY = 'petpal_income';
const BUDGETS_KEY = 'petpal_budgets';
const FINANCIAL_REPORTS_KEY = 'petpal_financial_reports';

// Mock expenses data
const mockExpenses: Expense[] = [
  {
    id: 'exp-1',
    category: 'medical',
    subcategory: 'veterinary-services',
    description: 'Emergency surgery for rescued dog - Max',
    amount: 1250.00,
    date: '2024-01-25T00:00:00Z',
    vendor: 'City Animal Hospital',
    paymentMethod: 'card',
    isRecurring: false,
    budgetCategory: 'Emergency Medical',
    approvedBy: 'Dr. Sarah Wilson',
    petId: 'pet-1',
    tags: ['emergency', 'surgery', 'rescue'],
    notes: 'Urgent surgery for intestinal blockage',
    isReimbursable: false,
    createdAt: '2024-01-25T14:30:00Z',
    updatedAt: '2024-01-25T14:30:00Z',
  },
  {
    id: 'exp-2',
    category: 'food',
    subcategory: 'dry-food',
    description: 'Monthly food supply - Premium dog food',
    amount: 450.00,
    date: '2024-01-20T00:00:00Z',
    vendor: 'Pet Nutrition Wholesale',
    paymentMethod: 'bank-transfer',
    isRecurring: true,
    recurringFrequency: 'monthly',
    budgetCategory: 'Food & Supplies',
    tags: ['monthly', 'bulk-order', 'dogs'],
    isReimbursable: false,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'exp-3',
    category: 'utilities',
    subcategory: 'electricity',
    description: 'Monthly electricity bill',
    amount: 320.00,
    date: '2024-01-15T00:00:00Z',
    vendor: 'City Electric Company',
    paymentMethod: 'bank-transfer',
    isRecurring: true,
    recurringFrequency: 'monthly',
    budgetCategory: 'Utilities',
    tags: ['monthly', 'utilities'],
    isReimbursable: false,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'exp-4',
    category: 'staff',
    subcategory: 'salaries',
    description: 'January staff salaries',
    amount: 8500.00,
    date: '2024-01-31T00:00:00Z',
    paymentMethod: 'bank-transfer',
    isRecurring: true,
    recurringFrequency: 'monthly',
    budgetCategory: 'Staff Costs',
    tags: ['salaries', 'monthly'],
    isReimbursable: false,
    createdAt: '2024-01-31T12:00:00Z',
    updatedAt: '2024-01-31T12:00:00Z',
  },
  {
    id: 'exp-5',
    category: 'supplies',
    subcategory: 'cleaning',
    description: 'Cleaning supplies and disinfectants',
    amount: 180.00,
    date: '2024-01-22T00:00:00Z',
    vendor: 'Hygiene Supplies Co.',
    paymentMethod: 'card',
    isRecurring: false,
    budgetCategory: 'Cleaning & Maintenance',
    tags: ['cleaning', 'hygiene', 'supplies'],
    isReimbursable: false,
    createdAt: '2024-01-22T11:30:00Z',
    updatedAt: '2024-01-22T11:30:00Z',
  },
];

// Mock income data
const mockIncome: Income[] = [
  {
    id: 'inc-1',
    source: 'donations',
    description: 'Monthly donation from John Smith',
    amount: 500.00,
    date: '2024-01-15T00:00:00Z',
    donorName: 'John Smith',
    donorContact: 'john.smith@email.com',
    isAnonymous: false,
    isRecurring: true,
    recurringFrequency: 'monthly',
    taxDeductible: true,
    receiptSent: true,
    tags: ['monthly-donor', 'individual'],
    notes: 'Long-time supporter, donates since 2022',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'inc-2',
    source: 'adoption-fees',
    description: 'Adoption fee for Luna (Cat)',
    amount: 150.00,
    date: '2024-01-18T00:00:00Z',
    isAnonymous: false,
    isRecurring: false,
    taxDeductible: false,
    receiptSent: true,
    tags: ['adoption', 'cat'],
    notes: 'Includes spay/neuter and initial vaccinations',
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-18T14:00:00Z',
  },
  {
    id: 'inc-3',
    source: 'grants',
    description: 'City Animal Welfare Grant Q1',
    amount: 5000.00,
    date: '2024-01-10T00:00:00Z',
    isAnonymous: false,
    isRecurring: true,
    recurringFrequency: 'quarterly',
    restrictedUse: 'Medical care and emergency treatments',
    taxDeductible: false,
    receiptSent: false,
    tags: ['grant', 'government', 'medical'],
    notes: 'Quarterly grant for medical expenses',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z',
  },
  {
    id: 'inc-4',
    source: 'fundraising',
    description: 'Valentine\'s Day Photo Fundraiser',
    amount: 2800.00,
    date: '2024-01-28T00:00:00Z',
    isAnonymous: false,
    isRecurring: false,
    taxDeductible: true,
    receiptSent: true,
    campaignId: 'valentine-2024',
    tags: ['fundraiser', 'event', 'valentine'],
    notes: 'Very successful photo fundraiser event',
    createdAt: '2024-01-28T18:00:00Z',
    updatedAt: '2024-01-28T18:00:00Z',
  },
];

/**
 * Initialize financial tracking data
 */
export async function initializeFinancialData(): Promise<void> {
  try {
    const existingExpenses = await AsyncStorage.getItem(EXPENSES_KEY);
    const existingIncome = await AsyncStorage.getItem(INCOME_KEY);
    
    if (!existingExpenses) {
      await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(mockExpenses));
    }
    
    if (!existingIncome) {
      await AsyncStorage.setItem(INCOME_KEY, JSON.stringify(mockIncome));
    }
    
    console.log('Financial tracking data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize financial data:', error);
  }
}

/**
 * Get all expenses
 */
export async function getExpenses(): Promise<Expense[]> {
  try {
    const stored = await AsyncStorage.getItem(EXPENSES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading expenses:', error);
  }
  return mockExpenses;
}

/**
 * Add new expense
 */
export async function addExpense(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
  const newExpense: Expense = {
    id: `exp-${Date.now()}`,
    ...expenseData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const expenses = await getExpenses();
    const updatedExpenses = [newExpense, ...expenses];
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(updatedExpenses));
  } catch (error) {
    console.error('Error adding expense:', error);
  }

  return newExpense;
}

/**
 * Get all income
 */
export async function getIncome(): Promise<Income[]> {
  try {
    const stored = await AsyncStorage.getItem(INCOME_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading income:', error);
  }
  return mockIncome;
}

/**
 * Add new income
 */
export async function addIncome(incomeData: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>): Promise<Income> {
  const newIncome: Income = {
    id: `inc-${Date.now()}`,
    ...incomeData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const income = await getIncome();
    const updatedIncome = [newIncome, ...income];
    await AsyncStorage.setItem(INCOME_KEY, JSON.stringify(updatedIncome));
  } catch (error) {
    console.error('Error adding income:', error);
  }

  return newIncome;
}

/**
 * Get expenses by category
 */
export async function getExpensesByCategory(category: Expense['category']): Promise<Expense[]> {
  try {
    const expenses = await getExpenses();
    return expenses.filter(expense => expense.category === category);
  } catch (error) {
    console.error('Error loading expenses by category:', error);
    return [];
  }
}

/**
 * Get expenses for date range
 */
export async function getExpensesInDateRange(startDate: string, endDate: string): Promise<Expense[]> {
  try {
    const expenses = await getExpenses();
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
    });
  } catch (error) {
    console.error('Error loading expenses in date range:', error);
    return [];
  }
}

/**
 * Get income for date range
 */
export async function getIncomeInDateRange(startDate: string, endDate: string): Promise<Income[]> {
  try {
    const income = await getIncome();
    return income.filter(item => {
      const incomeDate = new Date(item.date);
      return incomeDate >= new Date(startDate) && incomeDate <= new Date(endDate);
    });
  } catch (error) {
    console.error('Error loading income in date range:', error);
    return [];
  }
}

/**
 * Generate financial summary
 */
export async function generateFinancialSummary(startDate: string, endDate: string): Promise<{
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  expensesByCategory: Record<string, number>;
  incomeBySource: Record<string, number>;
  recurringIncome: number;
  recurringExpenses: number;
}> {
  try {
    const expenses = await getExpensesInDateRange(startDate, endDate);
    const income = await getIncomeInDateRange(startDate, endDate);

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    const expensesByCategory = expenses.reduce((acc: Record<string, number>, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const incomeBySource = income.reduce((acc: Record<string, number>, item) => {
      acc[item.source] = (acc[item.source] || 0) + item.amount;
      return acc;
    }, {});

    const recurringIncome = income
      .filter(item => item.isRecurring)
      .reduce((sum, item) => sum + item.amount, 0);

    const recurringExpenses = expenses
      .filter(expense => expense.isRecurring)
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netIncome: Math.round(netIncome * 100) / 100,
      expensesByCategory,
      incomeBySource,
      recurringIncome: Math.round(recurringIncome * 100) / 100,
      recurringExpenses: Math.round(recurringExpenses * 100) / 100,
    };
  } catch (error) {
    console.error('Error generating financial summary:', error);
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      expensesByCategory: {},
      incomeBySource: {},
      recurringIncome: 0,
      recurringExpenses: 0,
    };
  }
}

/**
 * Get monthly financial overview
 */
export async function getMonthlyFinancialOverview(year: number, month: number): Promise<{
  currentMonth: any;
  previousMonth: any;
  monthOverMonthGrowth: {
    income: number;
    expenses: number;
    net: number;
  };
}> {
  try {
    const currentMonthStart = new Date(year, month - 1, 1).toISOString();
    const currentMonthEnd = new Date(year, month, 0, 23, 59, 59).toISOString();
    
    const previousMonthStart = new Date(year, month - 2, 1).toISOString();
    const previousMonthEnd = new Date(year, month - 1, 0, 23, 59, 59).toISOString();

    const currentMonth = await generateFinancialSummary(currentMonthStart, currentMonthEnd);
    const previousMonth = await generateFinancialSummary(previousMonthStart, previousMonthEnd);

    const monthOverMonthGrowth = {
      income: previousMonth.totalIncome > 0 ? 
        Math.round(((currentMonth.totalIncome - previousMonth.totalIncome) / previousMonth.totalIncome) * 100) : 0,
      expenses: previousMonth.totalExpenses > 0 ? 
        Math.round(((currentMonth.totalExpenses - previousMonth.totalExpenses) / previousMonth.totalExpenses) * 100) : 0,
      net: previousMonth.netIncome !== 0 ? 
        Math.round(((currentMonth.netIncome - previousMonth.netIncome) / Math.abs(previousMonth.netIncome)) * 100) : 0,
    };

    return {
      currentMonth,
      previousMonth,
      monthOverMonthGrowth,
    };
  } catch (error) {
    console.error('Error generating monthly financial overview:', error);
    return {
      currentMonth: {
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0,
        expensesByCategory: {},
        incomeBySource: {},
        recurringIncome: 0,
        recurringExpenses: 0,
      },
      previousMonth: {
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0,
        expensesByCategory: {},
        incomeBySource: {},
        recurringIncome: 0,
        recurringExpenses: 0,
      },
      monthOverMonthGrowth: {
        income: 0,
        expenses: 0,
        net: 0,
      },
    };
  }
}

/**
 * Get top expenses
 */
export async function getTopExpenses(limit: number = 10, startDate?: string, endDate?: string): Promise<Expense[]> {
  try {
    let expenses = await getExpenses();
    
    if (startDate && endDate) {
      expenses = await getExpensesInDateRange(startDate, endDate);
    }
    
    return expenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  } catch (error) {
    console.error('Error loading top expenses:', error);
    return [];
  }
}

/**
 * Get top income sources
 */
export async function getTopIncomeSources(limit: number = 10, startDate?: string, endDate?: string): Promise<Income[]> {
  try {
    let income = await getIncome();
    
    if (startDate && endDate) {
      income = await getIncomeInDateRange(startDate, endDate);
    }
    
    return income
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  } catch (error) {
    console.error('Error loading top income sources:', error);
    return [];
  }
}

/**
 * Search financial transactions
 */
export async function searchFinancialTransactions(query: string): Promise<{
  expenses: Expense[];
  income: Income[];
}> {
  try {
    const expenses = await getExpenses();
    const income = await getIncome();
    const searchTerm = query.toLowerCase();

    const filteredExpenses = expenses.filter(expense =>
      expense.description.toLowerCase().includes(searchTerm) ||
      expense.category.toLowerCase().includes(searchTerm) ||
      expense.vendor?.toLowerCase().includes(searchTerm) ||
      expense.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    const filteredIncome = income.filter(item =>
      item.description.toLowerCase().includes(searchTerm) ||
      item.source.toLowerCase().includes(searchTerm) ||
      item.donorName?.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    return {
      expenses: filteredExpenses,
      income: filteredIncome,
    };
  } catch (error) {
    console.error('Error searching financial transactions:', error);
    return {
      expenses: [],
      income: [],
    };
  }
}

/**
 * Get financial statistics
 */
export async function getFinancialStats() {
  try {
    const expenses = await getExpenses();
    const income = await getIncome();
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    
    const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const averageIncome = income.length > 0 ? totalIncome / income.length : 0;
    
    const recurringExpenses = expenses.filter(expense => expense.isRecurring).length;
    const recurringIncome = income.filter(item => item.isRecurring).length;
    
    const largestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;
    const largestIncome = income.length > 0 ? Math.max(...income.map(i => i.amount)) : 0;

    return {
      totalTransactions: expenses.length + income.length,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalIncome: Math.round(totalIncome * 100) / 100,
      netIncome: Math.round((totalIncome - totalExpenses) * 100) / 100,
      averageExpense: Math.round(averageExpense * 100) / 100,
      averageIncome: Math.round(averageIncome * 100) / 100,
      recurringExpenses,
      recurringIncome,
      largestExpense,
      largestIncome,
    };
  } catch (error) {
    console.error('Error calculating financial statistics:', error);
    return {
      totalTransactions: 0,
      totalExpenses: 0,
      totalIncome: 0,
      netIncome: 0,
      averageExpense: 0,
      averageIncome: 0,
      recurringExpenses: 0,
      recurringIncome: 0,
      largestExpense: 0,
      largestIncome: 0,
    };
  }
}
