'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/tabs';
import { LineChart, BarChart, AreaChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDictionary } from '@/hooks/useDictionary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/select';

interface PerformanceMetricsProps {
  restaurantId?: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ restaurantId }) => {
  const dict = useDictionary();
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch data from the backend based on the selected time range
        let endpoint = `/api/analytics/reports/${timeRange}`;
        
        // Add restaurant filter if restaurantId is provided
        if (restaurantId) {
          endpoint = `/api/analytics/restaurants/${restaurantId}?timeRange=${timeRange}`;
        }
        
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to load analytics data');
        
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Mock data for development
    const mockData = getMockData(timeRange);
    setData(mockData);
    
    // Uncomment when API is ready
    // fetchAnalyticsData();
  }, [timeRange, restaurantId]);

  if (!data) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>{dict.analytics?.performanceMetrics || 'Performance Metrics'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>{dict.analytics.performanceMetrics}</CardTitle>
          <div className="flex items-center space-x-4">
            <Select
              value={timeRange}
              onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setTimeRange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={dict.analytics.selectTimeRange} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{dict.analytics.timeRanges.daily}</SelectItem>
                <SelectItem value="weekly">{dict.analytics.timeRanges.weekly}</SelectItem>
                <SelectItem value="monthly">{dict.analytics.timeRanges.monthly}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="sales">{dict.analytics.tabs.sales}</TabsTrigger>
            <TabsTrigger value="orders">{dict.analytics.tabs.orders}</TabsTrigger>
            <TabsTrigger value="metrics">{dict.analytics.tabs.metrics}</TabsTrigger>
            <TabsTrigger value="products">{dict.analytics.tabs.products}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales" className="space-y-6">
            <h3 className="text-lg font-medium mb-2">{dict.analytics.salesOverTime}</h3>
            <SalesChart data={data.charts?.salesData} timeRange={timeRange} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{dict.analytics.salesByMethod}</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.charts?.salesByMethod} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="method" type="category" />
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Legend />
                      <Bar dataKey="amount" name={dict.analytics.amount} fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{dict.analytics.salesByTimeOfDay}</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.charts?.salesByTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Legend />
                      <Area type="monotone" dataKey="amount" name={dict.analytics.amount} fill="#82ca9d" stroke="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-6">
            <h3 className="text-lg font-medium mb-2">{dict.analytics.ordersOverTime}</h3>
            <OrdersChart data={data.charts?.ordersData} timeRange={timeRange} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{dict.analytics.ordersByStatus}</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.charts?.ordersByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Count']} />
                      <Legend />
                      <Bar dataKey="count" name={dict.analytics.count} fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{dict.analytics.averageOrderValue}</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.charts?.averageOrderValue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Average']} />
                      <Legend />
                      <Line type="monotone" dataKey="value" name={dict.analytics.avgValue} stroke="#ff7300" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-6">
            <h3 className="text-lg font-medium mb-2">{dict.analytics.operationalMetrics}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{dict.analytics.preparationTime}</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.charts?.preparationTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip formatter={(value) => [`${value} min`, 'Time']} />
                      <Legend />
                      <Line type="monotone" dataKey="time" name={dict.analytics.minutes} stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{dict.analytics.deliveryTime}</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.charts?.deliveryTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip formatter={(value) => [`${value} min`, 'Time']} />
                      <Legend />
                      <Line type="monotone" dataKey="time" name={dict.analytics.minutes} stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{dict.analytics.customerSatisfaction}</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.charts?.customerSatisfaction}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip formatter={(value) => [`${value}/5`, 'Rating']} />
                      <Legend />
                      <Line type="monotone" dataKey="rating" name={dict.analytics.rating} stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{dict.analytics.deliveryDistribution}</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.charts?.deliveryDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="distance" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Orders']} />
                      <Legend />
                      <Bar dataKey="count" name={dict.analytics.count} fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-6">
            <h3 className="text-lg font-medium mb-2">{dict.analytics.productsPerformance}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{dict.analytics.topProducts}</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.charts?.topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => [value, 'Orders']} />
                      <Legend />
                      <Bar dataKey="orders" name={dict.analytics.count} fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{dict.analytics.topProductsRevenue}</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.charts?.topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Legend />
                      <Bar dataKey="amount" name={dict.analytics.revenue} fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{dict.analytics.productCategoryDistribution}</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.charts?.categoryDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Orders']} />
                      <Legend />
                      <Bar dataKey="count" name={dict.analytics.count} fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{dict.analytics.categoryRevenue}</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.charts?.categoryDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Legend />
                      <Bar dataKey="amount" name={dict.analytics.revenue} fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Sales Chart Component
const SalesChart = ({ data, timeRange }: { data: any[], timeRange: string }) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={
              timeRange === 'daily' ? 'hour' : 
              timeRange === 'weekly' ? 'day' : 'week'
            }
          />
          <YAxis />
          <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
          <Legend />
          <Line type="monotone" dataKey="amount" name="Sales" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Orders Chart Component
const OrdersChart = ({ data, timeRange }: { data: any[], timeRange: string }) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={
              timeRange === 'daily' ? 'hour' : 
              timeRange === 'weekly' ? 'day' : 'week'
            }
          />
          <YAxis />
          <Tooltip formatter={(value) => [value, 'Orders']} />
          <Legend />
          <Line type="monotone" dataKey="count" name="Orders" stroke="#82ca9d" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Mock data generator for development
function getMockData(timeRange: string) {
  // Daily data
  if (timeRange === 'daily') {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const salesData = hours.map(hour => ({
      hour: `${hour}:00`,
      amount: Math.floor(Math.random() * 500) + 100
    }));
    
    const ordersData = hours.map(hour => ({
      hour: `${hour}:00`,
      count: Math.floor(Math.random() * 20) + 1
    }));
    
    return {
      summary: {
        totalOrders: 245,
        totalSales: 12800.75,
        averageOrderValue: 52.25,
        totalCustomers: 180,
      },
      charts: {
        salesData,
        ordersData,
        salesByMethod: [
          { method: 'Credit Card', amount: 8320.50 },
          { method: 'Debit Card', amount: 3250.00 },
          { method: 'Cash', amount: 1230.25 },
        ],
        salesByTime: [
          { time: 'Morning', amount: 2845.75 },
          { time: 'Afternoon', amount: 4567.25 },
          { time: 'Evening', amount: 5387.75 },
        ],
        ordersByStatus: [
          { status: 'Pending', count: 12 },
          { status: 'In Progress', count: 18 },
          { status: 'Delivered', count: 205 },
          { status: 'Cancelled', count: 10 },
        ],
        averageOrderValue: hours.map(hour => ({
          date: `${hour}:00`,
          value: Math.floor(Math.random() * 20) + 40
        })),
        preparationTime: hours.filter(h => h >= 8 && h <= 22).map(hour => ({
          date: `${hour}:00`,
          time: Math.floor(Math.random() * 10) + 15
        })),
        deliveryTime: hours.filter(h => h >= 8 && h <= 22).map(hour => ({
          date: `${hour}:00`,
          time: Math.floor(Math.random() * 15) + 20
        })),
        customerSatisfaction: hours.filter(h => h >= 8 && h <= 22).map(hour => ({
          date: `${hour}:00`,
          rating: (Math.random() * 1) + 4
        })),
        deliveryDistribution: [
          { distance: '0-1 km', count: 45 },
          { distance: '1-3 km', count: 78 },
          { distance: '3-5 km', count: 52 },
          { distance: '5-10 km', count: 38 },
          { distance: '10+ km', count: 12 },
        ],
        topProducts: [
          { name: 'Hamburguesa Classic', orders: 45, amount: 2250.00 },
          { name: 'Pizza Margherita', orders: 32, amount: 1920.00 },
          { name: 'Sushi Combo', orders: 28, amount: 1680.00 },
          { name: 'Burrito Especial', orders: 25, amount: 1250.00 },
          { name: 'Ensalada César', orders: 20, amount: 800.00 },
        ],
        categoryDistribution: [
          { name: 'Hamburguesas', count: 78, amount: 3980.50 },
          { name: 'Pizzas', count: 52, amount: 2756.25 },
          { name: 'Sushi', count: 45, amount: 2340.75 },
          { name: 'Ensaladas', count: 38, amount: 1584.80 },
          { name: 'Postres', count: 32, amount: 1138.45 },
        ],
      }
    };
  }
  
  // Weekly data
  if (timeRange === 'weekly') {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const salesData = days.map(day => ({
      day,
      amount: Math.floor(Math.random() * 2000) + 1000
    }));
    
    const ordersData = days.map(day => ({
      day,
      count: Math.floor(Math.random() * 50) + 20
    }));
    
    return {
      summary: {
        totalOrders: 245,
        totalSales: 12800.75,
        averageOrderValue: 52.25,
        totalCustomers: 180,
      },
      charts: {
        salesData,
        ordersData,
        salesByMethod: [
          { method: 'Credit Card', amount: 8320.50 },
          { method: 'Debit Card', amount: 3250.00 },
          { method: 'Cash', amount: 1230.25 },
        ],
        salesByTime: [
          { time: 'Morning', amount: 2845.75 },
          { time: 'Afternoon', amount: 4567.25 },
          { time: 'Evening', amount: 5387.75 },
        ],
        ordersByStatus: [
          { status: 'Pending', count: 12 },
          { status: 'In Progress', count: 18 },
          { status: 'Delivered', count: 205 },
          { status: 'Cancelled', count: 10 },
        ],
        averageOrderValue: days.map(day => ({
          date: day,
          value: Math.floor(Math.random() * 20) + 40
        })),
        preparationTime: days.map(day => ({
          date: day,
          time: Math.floor(Math.random() * 10) + 15
        })),
        deliveryTime: days.map(day => ({
          date: day,
          time: Math.floor(Math.random() * 15) + 20
        })),
        customerSatisfaction: days.map(day => ({
          date: day,
          rating: (Math.random() * 1) + 4
        })),
        deliveryDistribution: [
          { distance: '0-1 km', count: 45 },
          { distance: '1-3 km', count: 78 },
          { distance: '3-5 km', count: 52 },
          { distance: '5-10 km', count: 38 },
          { distance: '10+ km', count: 12 },
        ],
        topProducts: [
          { name: 'Hamburguesa Classic', orders: 45, amount: 2250.00 },
          { name: 'Pizza Margherita', orders: 32, amount: 1920.00 },
          { name: 'Sushi Combo', orders: 28, amount: 1680.00 },
          { name: 'Burrito Especial', orders: 25, amount: 1250.00 },
          { name: 'Ensalada César', orders: 20, amount: 800.00 },
        ],
        categoryDistribution: [
          { name: 'Hamburguesas', count: 78, amount: 3980.50 },
          { name: 'Pizzas', count: 52, amount: 2756.25 },
          { name: 'Sushi', count: 45, amount: 2340.75 },
          { name: 'Ensaladas', count: 38, amount: 1584.80 },
          { name: 'Postres', count: 32, amount: 1138.45 },
        ],
      }
    };
  }
  
  // Monthly data
  const weeks = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
  const salesData = weeks.map(week => ({
    week,
    amount: Math.floor(Math.random() * 10000) + 5000
  }));
  
  const ordersData = weeks.map(week => ({
    week,
    count: Math.floor(Math.random() * 250) + 150
  }));
  
  return {
    summary: {
      totalOrders: 950,
      totalSales: 49875.25,
      averageOrderValue: 52.50,
      totalCustomers: 450,
    },
    charts: {
      salesData,
      ordersData,
      salesByMethod: [
        { method: 'Credit Card', amount: 32500.50 },
        { method: 'Debit Card', amount: 12375.00 },
        { method: 'Cash', amount: 5000.25 },
      ],
      salesByTime: [
        { time: 'Morning', amount: 12500.75 },
        { time: 'Afternoon', amount: 18750.25 },
        { time: 'Evening', amount: 18625.75 },
      ],
      ordersByStatus: [
        { status: 'Pending', count: 25 },
        { status: 'In Progress', count: 45 },
        { status: 'Delivered', count: 850 },
        { status: 'Cancelled', count: 30 },
      ],
      averageOrderValue: weeks.map(week => ({
        date: week,
        value: Math.floor(Math.random() * 20) + 40
      })),
      preparationTime: weeks.map(week => ({
        date: week,
        time: Math.floor(Math.random() * 10) + 15
      })),
      deliveryTime: weeks.map(week => ({
        date: week,
        time: Math.floor(Math.random() * 15) + 20
      })),
      customerSatisfaction: weeks.map(week => ({
        date: week,
        rating: (Math.random() * 1) + 4
      })),
      deliveryDistribution: [
        { distance: '0-1 km', count: 180 },
        { distance: '1-3 km', count: 320 },
        { distance: '3-5 km', count: 260 },
        { distance: '5-10 km', count: 150 },
        { distance: '10+ km', count: 40 },
      ],
      topProducts: [
        { name: 'Hamburguesa Classic', orders: 180, amount: 9000.00 },
        { name: 'Pizza Margherita', orders: 150, amount: 9000.00 },
        { name: 'Sushi Combo', orders: 120, amount: 7200.00 },
        { name: 'Burrito Especial', orders: 110, amount: 5500.00 },
        { name: 'Ensalada César', orders: 90, amount: 3600.00 },
      ],
      categoryDistribution: [
        { name: 'Hamburguesas', count: 320, amount: 16000.50 },
        { name: 'Pizzas', count: 250, amount: 13750.25 },
        { name: 'Sushi', count: 180, amount: 10800.75 },
        { name: 'Ensaladas', count: 120, amount: 5000.80 },
        { name: 'Postres', count: 80, amount: 4325.45 },
      ],
    }
  };
}

export default PerformanceMetrics;