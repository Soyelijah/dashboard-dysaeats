'use client';

import React from 'react';
import { useDictionary } from '@/hooks/useDictionary';
import DraggableMenuManager from '@/components/menu/DraggableMenuManager';

const MenuPage = () => {
  const dict = useDictionary();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">
        {dict.menu.menuManager}
      </h1>
      <p className="text-gray-500">
        {dict.menu.addCategoryDescription}
      </p>
      
      <DraggableMenuManager />
    </div>
  );
};

export default MenuPage;