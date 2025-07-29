import AsyncStorage from '@react-native-async-storage/async-storage';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'food' | 'medical' | 'toys' | 'bedding' | 'cleaning' | 'office' | 'equipment' | 'other';
  description?: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unit: string; // e.g., 'bags', 'bottles', 'pieces', 'pounds'
  cost: number;
  supplier?: string;
  supplierContact?: string;
  lastRestocked: string;
  expiryDate?: string;
  batchNumber?: string;
  location: string; // Storage location
  isLowStock: boolean;
  isExpiringSoon: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment' | 'expired' | 'damaged';
  quantity: number;
  reason: string;
  performedBy: string;
  cost?: number;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
  timestamp: string;
}

export interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  alertType: 'low_stock' | 'expiring_soon' | 'expired' | 'overstock';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

const INVENTORY_KEY = 'petpal_inventory';
const STOCK_TRANSACTIONS_KEY = 'petpal_stock_transactions';
const STOCK_ALERTS_KEY = 'petpal_stock_alerts';

// Mock inventory data
const mockInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Premium Dog Food (Large Breed)',
    category: 'food',
    description: 'High-quality dry dog food for large breeds, 30lb bags',
    currentStock: 15,
    minimumStock: 5,
    maximumStock: 50,
    unit: 'bags',
    cost: 45.99,
    supplier: 'Pet Nutrition Wholesale',
    supplierContact: 'orders@petnutrition.com',
    lastRestocked: '2024-01-20T10:00:00Z',
    expiryDate: '2024-08-15T00:00:00Z',
    batchNumber: 'PN-2024-001',
    location: 'Storage Room A, Shelf 1',
    isLowStock: false,
    isExpiringSoon: false,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'inv-2',
    name: 'Cat Litter (Clumping)',
    category: 'cleaning',
    description: 'Premium clumping cat litter, 40lb bags',
    currentStock: 3,
    minimumStock: 8,
    maximumStock: 30,
    unit: 'bags',
    cost: 12.99,
    supplier: 'Clean Paws Supply Co.',
    supplierContact: '+1-555-LITTER-1',
    lastRestocked: '2024-01-18T14:00:00Z',
    location: 'Storage Room B, Shelf 3',
    isLowStock: true,
    isExpiringSoon: false,
    notes: 'Need to reorder soon - popular item',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-25T09:15:00Z',
  },
  {
    id: 'inv-3',
    name: 'Antibiotics (Amoxicillin)',
    category: 'medical',
    description: 'Broad-spectrum antibiotic for bacterial infections',
    currentStock: 24,
    minimumStock: 10,
    maximumStock: 50,
    unit: 'bottles',
    cost: 28.50,
    supplier: 'VetMed Pharmaceuticals',
    supplierContact: 'orders@vetmed.com',
    lastRestocked: '2024-01-22T11:30:00Z',
    expiryDate: '2024-03-01T00:00:00Z',
    batchNumber: 'VM-AB-2024-007',
    location: 'Medical Cabinet, Shelf 2',
    isLowStock: false,
    isExpiringSoon: true,
    notes: 'Keep refrigerated',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-25T16:20:00Z',
  },
  {
    id: 'inv-4',
    name: 'Dog Toys (Rope Toys)',
    category: 'toys',
    description: 'Durable rope toys for medium to large dogs',
    currentStock: 45,
    minimumStock: 20,
    maximumStock: 100,
    unit: 'pieces',
    cost: 3.99,
    supplier: 'Pet Play Products',
    lastRestocked: '2024-01-19T13:00:00Z',
    location: 'Toy Storage, Bin C',
    isLowStock: false,
    isExpiringSoon: false,
    createdAt: '2024-01-08T15:30:00Z',
    updatedAt: '2024-01-19T13:15:00Z',
  },
  {
    id: 'inv-5',
    name: 'Blankets (Medium)',
    category: 'bedding',
    description: 'Washable fleece blankets for medium-sized animals',
    currentStock: 12,
    minimumStock: 15,
    maximumStock: 40,
    unit: 'pieces',
    cost: 8.99,
    supplier: 'Cozy Pet Bedding',
    supplierContact: 'info@cozypetbedding.com',
    lastRestocked: '2024-01-16T09:00:00Z',
    location: 'Laundry Room, Cabinet A',
    isLowStock: true,
    isExpiringSoon: false,
    notes: 'High usage item - kennels use daily',
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-24T14:45:00Z',
  },
];

// Mock transactions
const mockTransactions: StockTransaction[] = [
  {
    id: 'trans-1',
    itemId: 'inv-1',
    type: 'in',
    quantity: 10,
    reason: 'Weekly restocking order',
    performedBy: 'Sarah Johnson',
    cost: 459.90,
    batchNumber: 'PN-2024-001',
    expiryDate: '2024-08-15T00:00:00Z',
    timestamp: '2024-01-20T10:00:00Z',
  },
  {
    id: 'trans-2',
    itemId: 'inv-2',
    type: 'out',
    quantity: 5,
    reason: 'Used for kennel cleaning',
    performedBy: 'Mike Wilson',
    timestamp: '2024-01-23T08:30:00Z',
  },
  {
    id: 'trans-3',
    itemId: 'inv-3',
    type: 'out',
    quantity: 1,
    reason: 'Treatment for respiratory infection - Dog ID: 12345',
    performedBy: 'Dr. Emily Chen',
    timestamp: '2024-01-24T14:15:00Z',
  },
];

/**
 * Initialize inventory data
 */
export async function initializeInventoryData(): Promise<void> {
  try {
    const existingInventory = await AsyncStorage.getItem(INVENTORY_KEY);
    const existingTransactions = await AsyncStorage.getItem(STOCK_TRANSACTIONS_KEY);
    
    if (!existingInventory) {
      await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(mockInventory));
    }
    
    if (!existingTransactions) {
      await AsyncStorage.setItem(STOCK_TRANSACTIONS_KEY, JSON.stringify(mockTransactions));
    }
    
    console.log('Inventory data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize inventory data:', error);
  }
}

/**
 * Get all inventory items
 */
export async function getInventoryItems(): Promise<InventoryItem[]> {
  try {
    const stored = await AsyncStorage.getItem(INVENTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading inventory:', error);
  }
  return mockInventory;
}

/**
 * Get inventory item by ID
 */
export async function getInventoryItemById(id: string): Promise<InventoryItem | undefined> {
  try {
    const items = await getInventoryItems();
    return items.find(item => item.id === id);
  } catch (error) {
    console.error('Error finding inventory item:', error);
    return undefined;
  }
}

/**
 * Add new inventory item
 */
export async function addInventoryItem(itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'isLowStock' | 'isExpiringSoon'>): Promise<InventoryItem> {
  const newItem: InventoryItem = {
    id: `inv-${Date.now()}`,
    ...itemData,
    isLowStock: itemData.currentStock <= itemData.minimumStock,
    isExpiringSoon: itemData.expiryDate ? 
      new Date(itemData.expiryDate).getTime() - new Date().getTime() <= 30 * 24 * 60 * 60 * 1000 : false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const items = await getInventoryItems();
    const updatedItems = [newItem, ...items];
    await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error adding inventory item:', error);
  }

  return newItem;
}

/**
 * Update inventory item
 */
export async function updateInventoryItem(
  id: string,
  updates: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>
): Promise<InventoryItem | null> {
  try {
    const items = await getInventoryItems();
    const itemIndex = items.findIndex(item => item.id === id);

    if (itemIndex === -1) return null;

    const updatedItem = {
      ...items[itemIndex],
      ...updates,
      isLowStock: (updates.currentStock ?? items[itemIndex].currentStock) <= 
                  (updates.minimumStock ?? items[itemIndex].minimumStock),
      isExpiringSoon: updates.expiryDate || items[itemIndex].expiryDate ? 
        new Date(updates.expiryDate ?? items[itemIndex].expiryDate!).getTime() - new Date().getTime() <= 30 * 24 * 60 * 60 * 1000 : false,
      updatedAt: new Date().toISOString(),
    };

    const updatedItems = items.map((item, index) =>
      index === itemIndex ? updatedItem : item
    );

    await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedItems));
    return updatedItem;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return null;
  }
}

/**
 * Record stock transaction
 */
export async function recordStockTransaction(transactionData: Omit<StockTransaction, 'id' | 'timestamp'>): Promise<StockTransaction> {
  const newTransaction: StockTransaction = {
    id: `trans-${Date.now()}`,
    ...transactionData,
    timestamp: new Date().toISOString(),
  };

  try {
    // Save transaction
    const transactions = await getStockTransactions();
    const updatedTransactions = [newTransaction, ...transactions];
    await AsyncStorage.setItem(STOCK_TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));

    // Update inventory stock levels
    const item = await getInventoryItemById(transactionData.itemId);
    if (item) {
      let newStock = item.currentStock;
      
      switch (transactionData.type) {
        case 'in':
          newStock += transactionData.quantity;
          break;
        case 'out':
        case 'expired':
        case 'damaged':
          newStock -= transactionData.quantity;
          break;
        case 'adjustment':
          newStock = transactionData.quantity; // Set to exact quantity for adjustments
          break;
      }

      await updateInventoryItem(transactionData.itemId, {
        currentStock: Math.max(0, newStock),
        lastRestocked: transactionData.type === 'in' ? new Date().toISOString() : item.lastRestocked,
      });
    }
  } catch (error) {
    console.error('Error recording stock transaction:', error);
  }

  return newTransaction;
}

/**
 * Get stock transactions
 */
export async function getStockTransactions(): Promise<StockTransaction[]> {
  try {
    const stored = await AsyncStorage.getItem(STOCK_TRANSACTIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading stock transactions:', error);
  }
  return mockTransactions;
}

/**
 * Get transactions for specific item
 */
export async function getTransactionsForItem(itemId: string): Promise<StockTransaction[]> {
  try {
    const transactions = await getStockTransactions();
    return transactions.filter(trans => trans.itemId === itemId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error loading item transactions:', error);
    return [];
  }
}

/**
 * Get low stock items
 */
export async function getLowStockItems(): Promise<InventoryItem[]> {
  try {
    const items = await getInventoryItems();
    return items.filter(item => item.isLowStock);
  } catch (error) {
    console.error('Error loading low stock items:', error);
    return [];
  }
}

/**
 * Get expiring items
 */
export async function getExpiringItems(): Promise<InventoryItem[]> {
  try {
    const items = await getInventoryItems();
    return items.filter(item => item.isExpiringSoon);
  } catch (error) {
    console.error('Error loading expiring items:', error);
    return [];
  }
}

/**
 * Get inventory by category
 */
export async function getInventoryByCategory(category: InventoryItem['category']): Promise<InventoryItem[]> {
  try {
    const items = await getInventoryItems();
    return items.filter(item => item.category === category);
  } catch (error) {
    console.error('Error loading inventory by category:', error);
    return [];
  }
}

/**
 * Search inventory
 */
export async function searchInventory(query: string): Promise<InventoryItem[]> {
  try {
    const items = await getInventoryItems();
    const searchTerm = query.toLowerCase();
    
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm) ||
      item.supplier?.toLowerCase().includes(searchTerm) ||
      item.location.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error('Error searching inventory:', error);
    return [];
  }
}

/**
 * Get inventory statistics
 */
export async function getInventoryStats() {
  try {
    const items = await getInventoryItems();
    const transactions = await getStockTransactions();
    
    const total = items.length;
    const lowStock = items.filter(item => item.isLowStock).length;
    const expiring = items.filter(item => item.isExpiringSoon).length;
    
    const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);
    
    const byCategory = items.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const recentTransactions = transactions.filter(trans => 
      new Date(trans.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      total,
      lowStock,
      expiring,
      totalValue: Math.round(totalValue * 100) / 100,
      byCategory,
      recentTransactions,
      alertCount: lowStock + expiring,
    };
  } catch (error) {
    console.error('Error calculating inventory statistics:', error);
    return {
      total: 0,
      lowStock: 0,
      expiring: 0,
      totalValue: 0,
      byCategory: {},
      recentTransactions: 0,
      alertCount: 0,
    };
  }
}

/**
 * Generate purchase order for low stock items
 */
export async function generatePurchaseOrder(): Promise<{
  items: Array<{
    item: InventoryItem;
    recommendedQuantity: number;
    estimatedCost: number;
  }>;
  totalCost: number;
}> {
  try {
    const lowStockItems = await getLowStockItems();
    
    const orderItems = lowStockItems.map(item => {
      const recommendedQuantity = Math.max(
        item.minimumStock - item.currentStock,
        Math.round((item.maximumStock - item.currentStock) * 0.7)
      );
      
      return {
        item,
        recommendedQuantity,
        estimatedCost: recommendedQuantity * item.cost,
      };
    });

    const totalCost = orderItems.reduce((sum, orderItem) => sum + orderItem.estimatedCost, 0);

    return {
      items: orderItems,
      totalCost: Math.round(totalCost * 100) / 100,
    };
  } catch (error) {
    console.error('Error generating purchase order:', error);
    return {
      items: [],
      totalCost: 0,
    };
  }
}
