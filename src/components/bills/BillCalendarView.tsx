
import React, { useState, useMemo } from 'react';
import { Bill } from '@/types/bill';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO, isSameDay, addMonths } from 'date-fns';

interface BillCalendarViewProps {
  bills: Bill[];
  isLoading: boolean;
}

const BillCalendarView: React.FC<BillCalendarViewProps> = ({ bills, isLoading }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  
  // Helper to get all bill dates in the selected month
  const billDates = useMemo(() => {
    const dates: Record<string, Bill[]> = {};
    
    bills.forEach(bill => {
      const nextDueDate = parseISO(bill.next_due_date);
      const dateString = format(nextDueDate, 'yyyy-MM-dd');
      
      if (!dates[dateString]) {
        dates[dateString] = [];
      }
      
      dates[dateString].push(bill);
    });
    
    return dates;
  }, [bills]);
  
  const selectedDayBills = useMemo(() => {
    if (!selectedDate) return [];
    
    return bills.filter(bill => {
      const nextDueDate = parseISO(bill.next_due_date);
      return isSameDay(nextDueDate, selectedDate);
    });
  }, [selectedDate, bills]);
  
  // Function to highlight dates with bills in the calendar
  const getDayClassName = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    
    if (billDates[dateString]) {
      const hasPaid = billDates[dateString].some(bill => bill.status === 'paid');
      const hasOverdue = billDates[dateString].some(bill => bill.status === 'overdue');
      
      if (hasOverdue) return "bg-red-200 text-red-900";
      if (hasPaid) return "bg-green-200 text-green-900";
      return "bg-blue-200 text-blue-900";
    }
    
    return "";
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="grid md:grid-cols-[1fr_300px] gap-4">
        <div>
          <Calendar 
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border p-3 pointer-events-auto"
            month={month}
            onMonthChange={setMonth}
            modifiers={{
              booked: (date) => {
                const dateString = format(date, 'yyyy-MM-dd');
                return !!billDates[dateString];
              }
            }}
            modifiersClassNames={{
              booked: "font-bold"
            }}
            components={{
              DayContent: (props) => {
                const dateString = format(props.date, 'yyyy-MM-dd');
                const dayBills = billDates[dateString];
                
                return (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${getDayClassName(props.date)}`}>
                      {props.date.getDate()}
                    </div>
                    {dayBills && dayBills.length > 0 && (
                      <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 flex items-center justify-center">
                        <span className="text-[10px] font-bold">{dayBills.length}</span>
                      </span>
                    )}
                  </div>
                );
              }
            }}
          />
        </div>
        
        <div className="overflow-y-auto max-h-[400px]">
          <h3 className="text-lg font-semibold mb-2">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </h3>
          
          {selectedDayBills.length === 0 ? (
            <p className="text-gray-500">No bills due on this date.</p>
          ) : (
            <div className="space-y-3">
              {selectedDayBills.map(bill => (
                <Card key={bill.id} className={`
                  ${bill.status === 'paid' ? 'border-green-300 bg-green-50' : ''} 
                  ${bill.status === 'overdue' ? 'border-red-300 bg-red-50' : ''}
                  ${bill.status === 'upcoming' ? 'border-blue-300 bg-blue-50' : ''}
                `}>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-semibold">{bill.name}</h4>
                        <p className="text-sm text-gray-500">{bill.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${bill.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{bill.frequency}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold
                        ${bill.status === 'paid' ? 'bg-green-200 text-green-800' : ''} 
                        ${bill.status === 'overdue' ? 'bg-red-200 text-red-800' : ''}
                        ${bill.status === 'upcoming' ? 'bg-blue-200 text-blue-800' : ''}
                        ${bill.status === 'unpaid' ? 'bg-yellow-200 text-yellow-800' : ''}
                      `}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillCalendarView;
