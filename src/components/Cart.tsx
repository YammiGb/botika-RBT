import React from 'react';
import { Trash2, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getTotalPrice,
  onContinueShopping,
  onCheckout
}) => {
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💊</div>
          <h2 className="text-2xl font-inter font-medium text-botika-dark mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <button
            onClick={onContinueShopping}
            className="bg-botika-accent text-white px-6 py-3 rounded-full hover:bg-botika-hover transition-all duration-200"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onContinueShopping}
          aria-label="Back"
          className="flex items-center text-gray-600 hover:text-botika-accent transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-inter font-semibold text-botika-dark whitespace-nowrap">Your Inquiries</h1>
        <button
          onClick={clearCart}
          className="text-botika-accent hover:text-botika-hover transition-colors duration-200 whitespace-nowrap"
        >
          Clear All
        </button>
      </div>

      <div className="bg-botika-light rounded-xl shadow-sm overflow-hidden mb-8 border border-botika-border">
        {cartItems.map((item, index) => (
          <div key={item.id} className={`p-6 ${index !== cartItems.length - 1 ? 'border-b border-botika-border' : ''}`}>
            <div className="flex">
              <div className="flex-1">
                <h3 className="text-lg font-inter font-medium text-botika-dark mb-1">{item.name}</h3>
                {item.selectedVariation && (
                  <p className="text-sm text-gray-500 mb-1">Size: {item.selectedVariation.name}</p>
                )}
                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                  <p className="text-sm text-gray-500 mb-1">
                    Add-ons: {item.selectedAddOns.map(addOn => 
                      addOn.quantity && addOn.quantity > 1 
                        ? `${addOn.name} x${addOn.quantity}`
                        : addOn.name
                    ).join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-botika-accent hover:text-botika-hover hover:bg-botika-beige rounded-full transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-botika-light rounded-xl shadow-sm p-6 border border-botika-border">
        <button
          onClick={onCheckout}
          className="w-full bg-botika-accent text-white py-4 rounded-xl hover:bg-botika-hover transition-all duration-200 transform hover:scale-[1.02] font-medium text-lg"
        >
          Inquire
        </button>
      </div>
    </div>
  );
};

export default Cart;