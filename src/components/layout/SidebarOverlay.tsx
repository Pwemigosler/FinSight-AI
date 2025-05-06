
import React from 'react';

interface SidebarOverlayProps {
  isVisible: boolean;
  onClick: () => void;
}

const SidebarOverlay = ({ isVisible, onClick }: SidebarOverlayProps) => {
  if (!isVisible) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
      onClick={onClick}
    />
  );
};

export default SidebarOverlay;
