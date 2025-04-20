'use client';

import { useState, useEffect } from 'react';
import MenuManager from './menu/MenuManager';

const MenuManagement = () => {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h2 className="text-xl font-semibold mb-4">Gestión de Menús</h2>
        <p className="text-gray-600 mb-6">
          Administra las categorías y elementos de menú de los restaurantes. Puedes añadir, editar o eliminar categorías y elementos, así como cambiar su disponibilidad.
        </p>
        
        <MenuManager />
      </div>
    </div>
  );
};

export default MenuManagement;