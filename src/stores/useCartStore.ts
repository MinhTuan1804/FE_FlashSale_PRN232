import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  imageUrl: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const validPrice = Number(newItem.unitPrice) || 0;
        const sanitizedItem = { ...newItem, unitPrice: validPrice };

        set((state) => {
          // Filter out broken legacy items
          const validItems = state.items.filter(
            (i) => i.unitPrice !== undefined && !isNaN(i.unitPrice) && i.unitPrice > 0
          );

          const existingItemIndex = validItems.findIndex(
            (item) => item.productId === sanitizedItem.productId
          );
          
          if (existingItemIndex >= 0) {
            const updatedItems = [...validItems];
            updatedItems[existingItemIndex].quantity += sanitizedItem.quantity;
            return { items: updatedItems };
          }
          
          return { items: [...validItems, sanitizedItem] };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => {
        const items = get().items.filter(
          (i) => i.unitPrice !== undefined && !isNaN(i.unitPrice) && i.unitPrice > 0
        );
        return items.reduce((total, item) => total + (item.quantity || 1), 0);
      },
      totalPrice: () => {
        const items = get().items.filter(
          (i) => i.unitPrice !== undefined && !isNaN(i.unitPrice) && i.unitPrice > 0
        );
        return items.reduce(
          (total, item) => total + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
          0
        );
      },
    }),
    {
      name: 'flashshop-cart-storage',
    }
  )
);
