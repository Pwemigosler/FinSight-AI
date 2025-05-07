
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { Calendar, Plus, Filter, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BillList from './bills/BillList';
import BillForm from './bills/BillForm';
import BillCalendarView from './bills/BillCalendarView';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import BillBanner from './bills/BillBanner';
import useBills from '@/hooks/useBills';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const BillsView: React.FC = () => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const { 
    bills, 
    isLoading, 
    billsTotal, 
    realtimeConnected, 
    connectionError,
    refreshBills 
  } = useBills();

  // Attempt to refresh bills periodically if there's a connection error
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (connectionError) {
      interval = setInterval(() => {
        console.log('Connection error detected, auto-refreshing bills...');
        refreshBills();
      }, 30000); // Refresh every 30 seconds if there's a connection error
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionError, refreshBills]);

  const handleOpenForm = () => {
    if (!user) {
      toast.error("Please sign in to add bills");
      return;
    }
    setIsFormOpen(true);
  };

  const handleViewChange = (newView: 'list' | 'calendar') => {
    setView(newView);
  };

  const handleManualRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshBills();
      toast.success('Bills refreshed successfully');
    } catch (error) {
      console.error('Error refreshing bills:', error);
      toast.error('Failed to refresh bills');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshBills, isRefreshing]);

  // Ensure we update the UI if the connection status changes
  useEffect(() => {
    if (realtimeConnected) {
      console.log('Real-time connection established, refreshing bills');
      refreshBills();
    }
  }, [realtimeConnected, refreshBills]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bills</h1>
          <p className="text-gray-500">Manage your recurring bills and expenses</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="relative"
            title="Refresh bills"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Tabs defaultValue="list" className="mr-4">
            <TabsList>
              <TabsTrigger 
                value="list" 
                onClick={() => handleViewChange('list')}
              >
                List
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                onClick={() => handleViewChange('calendar')}
              >
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            onClick={handleOpenForm} 
            className="flex items-center"
          >
            <Plus className="mr-1 h-4 w-4" /> Add Bill
          </Button>
        </div>
      </div>

      <BillBanner />
      
      {connectionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            We're having trouble maintaining a live connection. Your changes may not update in real-time.
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh} 
              disabled={isRefreshing}
              className="ml-2"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Bills</CardTitle>
            <CardDescription>Monthly recurring</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${billsTotal.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upcoming Bills</CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bills.filter(b => b.status === 'upcoming').length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Paid Bills</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bills.filter(b => b.status === 'paid').length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overdue Bills</CardTitle>
            <CardDescription>Needs attention</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bills.filter(b => b.status === 'overdue').length}</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        view === 'list' ? (
          <BillList 
            isLoading={isLoading} 
            bills={bills} 
            realtimeConnected={realtimeConnected}
            onRefresh={handleManualRefresh}
          />
        ) : (
          <BillCalendarView 
            isLoading={isLoading} 
            bills={bills} 
          />
        )
      )}

      <BillForm 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
      />
    </div>
  );
};

export default BillsView;
