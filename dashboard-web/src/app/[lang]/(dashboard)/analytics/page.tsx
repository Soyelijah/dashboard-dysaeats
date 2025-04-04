'use client';

import React, { useState } from 'react';
import { useDictionary } from '@/hooks/useDictionary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/tabs';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import RestaurantStats from '@/components/analytics/RestaurantStats';
import ExportAnalytics from '@/components/analytics/ExportAnalytics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/select';

const AnalyticsPage = () => {
  const dict = useDictionary();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState([
    { id: 'r1', name: 'Restaurante Ejemplo 1' },
    { id: 'r2', name: 'Restaurante Ejemplo 2' },
    { id: 'r3', name: 'Restaurante Ejemplo 3' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">
          {dict.analytics.title}
        </h1>
        <div className="w-full md:w-[250px]">
          <Select
            value={selectedRestaurant || ''}
            onValueChange={(value) => setSelectedRestaurant(value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={dict.analytics.selectRestaurant} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{dict.analytics.allRestaurants}</SelectItem>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">{dict.analytics.dashboardTab}</TabsTrigger>
          {selectedRestaurant && (
            <TabsTrigger value="restaurant">{dict.analytics.restaurantTab}</TabsTrigger>
          )}
          <TabsTrigger value="export">{dict.analytics.exportTab}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <AnalyticsDashboard restaurantId={selectedRestaurant || undefined} />
        </TabsContent>
        
        {selectedRestaurant && (
          <TabsContent value="restaurant">
            <RestaurantStats restaurantId={selectedRestaurant} />
          </TabsContent>
        )}
        
        <TabsContent value="export">
          <ExportAnalytics restaurantId={selectedRestaurant || undefined} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;