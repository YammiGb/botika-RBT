import React from 'react';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
  onGeneralInquiriesClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onMenuClick, onGeneralInquiriesClick }) => {
  const { siteSettings, loading } = useSiteSettings();

  return (
    <header className="sticky top-0 z-50 bg-botika-light/95 backdrop-blur-md border-b border-botika-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={onMenuClick}
            className="flex items-center space-x-2 text-botika-dark hover:text-botika-accent transition-colors duration-200"
          >
            <img 
              src="/logo.png" 
              alt="Botika RBT"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="text-2xl font-inter font-semibold text-botika-dark">
              Botika RBT
            </h1>
          </button>

          <div className="flex items-center space-x-2">
            <button 
              onClick={onGeneralInquiriesClick}
              className="p-2 text-gray-700 hover:text-botika-accent hover:bg-botika-beige rounded-full transition-all duration-200"
              title="General Inquiries"
            >
              <MessageCircle className="h-6 w-6" />
            </button>
            <button 
              onClick={onCartClick}
              className="relative p-2 text-gray-700 hover:text-botika-accent hover:bg-botika-beige rounded-full transition-all duration-200"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-botika-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-gentle">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;