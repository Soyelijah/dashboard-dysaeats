import React from 'react';
import { RestaurantStats } from './RestaurantStats';
import { PerformanceMetrics } from './PerformanceMetrics';
import { OrderUpdates } from '@/components/realtime/OrderUpdates';
import { NotificationBell } from '@/components/realtime/NotificationBell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/services/supabase/client';
import { restaurantService } from '@/services/supabase/restaurantService';

interface DashboardOverviewProps {
  userId: string;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ userId }) => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = React.useState<Tables['restaurants'][]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRestaurants = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userRestaurants = await restaurantService.getRestaurantsByAdmin(user.id);
        setRestaurants(userRestaurants);
        
        if (userRestaurants.length > 0) {
          setSelectedRestaurantId(userRestaurants[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  if (restaurants.length === 0) {
    return (
      <div className="rounded-xl p-8 border border-muted text-center">
        <h3 className="text-xl font-semibold mb-2">No Restaurants Found</h3>
        <p className="text-muted-foreground mb-6">
          You don't have any restaurants associated with your account yet.
        </p>
        <a href="/dashboard/restaurants/new" className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90">
          Create Your First Restaurant
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {restaurants.length > 1 && (
        <Tabs
          value={selectedRestaurantId || undefined}
          onValueChange={(value) => setSelectedRestaurantId(value)}
          className="mb-6"
        >
          <TabsList>
            {restaurants.map((restaurant) => (
              <TabsTrigger key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {selectedRestaurantId && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">
              {restaurants.find(r => r.id === selectedRestaurantId)?.name} Dashboard
            </h2>
            <NotificationBell userId={userId} />
          </div>

          <RestaurantStats restaurantId={selectedRestaurantId} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PerformanceMetrics 
              restaurantId={selectedRestaurantId} 
              className="lg:col-span-2"
            />
            <Card>
              <CardContent className="p-0">
                <OrderUpdates 
                  restaurantId={selectedRestaurantId} 
                  onOrderSelect={(orderId) => {
                    window.location.href = `/dashboard/orders/${orderId}`;
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardOverview;