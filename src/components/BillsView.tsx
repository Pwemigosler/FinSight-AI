
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Calendar, Plus, Filter, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BillList from './bills/BillList';
import BillForm from './bills/BillForm';
import BillCalendarView from './bills/BillCalendarView';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import BillBanner from './bills/BillBanner';
import useBills from '@/hooks/useBills';

const BillsView: React.FC = () => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuth();
  const { bills, isLoading, billsTotal } = useBills();

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

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bills</h1>
          <p className="text-gray-500">Manage your recurring bills and expenses</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
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
