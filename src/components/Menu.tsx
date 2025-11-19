import React from 'react';
import { Search } from 'lucide-react';
import { MenuItem, CartItem } from '../types';
import MenuItemCard from './MenuItemCard';

interface MenuProps {
  menuItems: MenuItem[];
  addToCart: (item: MenuItem, quantity?: number, variation?: any, addOns?: any[]) => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  selectedCategory: string;
}

const Menu: React.FC<MenuProps> = ({ menuItems, addToCart, cartItems, updateQuantity, selectedCategory }) => {
  const [searchQuery, setSearchQuery] = React.useState('');


  // Filter items by search query
  const filterItemsBySearch = (items: MenuItem[]) => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
    
    // Remove duplicates by item name (keep first occurrence)
    const seen = new Set<string>();
    return filtered.filter(item => {
      const nameKey = item.name.toLowerCase();
      if (seen.has(nameKey)) {
        return false;
      }
      seen.add(nameKey);
      return true;
    });
  };

  const displayItems = filterItemsBySearch(menuItems);

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-botika-border rounded-lg focus:ring-2 focus:ring-botika-accent focus:border-botika-accent transition-all duration-200 bg-white text-botika-dark placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-botika-dark transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            )}
          </div>
        </div>
        
        {displayItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600">No products found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayItems.map((item) => {
            // Find cart items that match this menu item (by extracting menu item id from cart item id)
            // For simple items without variations/add-ons, sum all matching cart items
            const matchingCartItems = cartItems.filter(cartItem => {
              // Extract original menu item id (format: "menuItemId:::CART:::timestamp-random" or old format)
              const parts = cartItem.id.split(':::CART:::');
              const originalMenuItemId = parts.length > 1 ? parts[0] : cartItem.id.split('-')[0];
              return originalMenuItemId === item.id && 
                     !cartItem.selectedVariation && 
                     (!cartItem.selectedAddOns || cartItem.selectedAddOns.length === 0);
            });
            
            // Sum quantities of all matching simple items (for items without variations/add-ons)
            const quantity = matchingCartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
            
            // Get the first matching cart item for updateQuantity (if any)
            const primaryCartItem = matchingCartItems[0];
            
            return (
              <MenuItemCard
                key={item.id}
                item={item}
                onAddToCart={addToCart}
                quantity={quantity}
                onUpdateQuantity={(id, qty) => {
                  // If we have a cart item, update it by its cart id
                  if (primaryCartItem) {
                    updateQuantity(primaryCartItem.id, qty);
                  } else {
                    // Otherwise, treat as adding a new item
                    if (qty > 0) {
                      addToCart(item, qty);
                    }
                  }
                }}
              />
            );
          })}
          </div>
        )}
      </main>
    </>
  );
};

export default Menu;