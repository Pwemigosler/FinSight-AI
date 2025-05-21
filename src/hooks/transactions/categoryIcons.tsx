
import React from 'react';
import { ShoppingCart, CreditCard, Home, Coffee, Film, Dumbbell } from 'lucide-react';

export type CategoryIconType = {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

export const getCategoryIcon = (category: string): CategoryIconType => {
  switch (category.toLowerCase()) {
    case 'housing':
      return { 
        icon: <Home className="h-4 w-4" />,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600'
      };
    case 'dining':
    case 'food':
      return { 
        icon: <Coffee className="h-4 w-4" />,
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600'
      };
    case 'entertainment':
      return { 
        icon: <Film className="h-4 w-4" />,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600'
      };
    case 'fitness':
      return { 
        icon: <Dumbbell className="h-4 w-4" />,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600'
      };
    case 'income':
      return { 
        icon: <CreditCard className="h-4 w-4" />,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600'
      };
    default:
      return { 
        icon: <ShoppingCart className="h-4 w-4" />,
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600'
      };
  }
};
