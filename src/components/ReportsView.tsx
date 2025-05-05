
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { FileBarChart, FilePieChart, ArrowUpRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Sample data for reports
const monthlyExpensesData = [
  { month: 'Jan', income: 7250, expenses: 5800 },
  { month: 'Feb', income: 7350, expenses: 5950 },
  { month: 'Mar', income: 7400, expenses: 6100 },
  { month: 'Apr', income: 7900, expenses: 6300 },
  { month: 'May', income: 8100, expenses: 6200 },
  { month: 'Jun', income: 8200, expenses: 6150 },
  { month: 'Jul', income: 8350, expenses: 6250 },
  { month: 'Aug', income: 8400, expenses: 6300 },
];

const categorySpendingData = [
  { name: 'Housing', value: 1800, color: '#0EA5E9' },
  { name: 'Food', value: 650, color: '#0284C7' },
  { name: 'Transportation', value: 320, color: '#F97316' },
  { name: 'Entertainment', value: 410, color: '#0EA5E9' },
  { name: 'Utilities', value: 310, color: '#10B981' },
  { name: 'Healthcare', value: 220, color: '#D946EF' },
];

const savingsHistoryData = [
  { month: 'Jan', amount: 1450 },
  { month: 'Feb', amount: 1400 },
  { month: 'Mar', amount: 1300 },
  { month: 'Apr', amount: 1600 },
  { month: 'May', amount: 1900 },
  { month: 'Jun', amount: 2050 },
  { month: 'Jul', amount: 2100 },
  { month: 'Aug', amount: 2100 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="font-bold">
            {`${entry.name}: $${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ReportsView = () => {
  const [reportPeriod, setReportPeriod] = useState("last6months");
  
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Filter className="h-3 w-3 mr-1" />
            Filter
          </Button>
          <select 
            value={reportPeriod} 
            onChange={(e) => setReportPeriod(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="last3months">Last 3 Months</option>
            <option value="last6months">Last 6 Months</option>
            <option value="lastyear">Last Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileBarChart className="h-5 w-5 text-ptcustom-blue" />
                Income vs. Expenses
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-ptcustom-blue">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyExpensesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar name="Income" dataKey="income" fill="#0EA5E9" />
                  <Bar name="Expenses" dataKey="expenses" fill="#F97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Spending Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FilePieChart className="h-5 w-5 text-ptcustom-blue" />
                Spending by Category
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-ptcustom-blue">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categorySpendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {categorySpendingData.map((category) => (
                <div key={category.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                  <span className="text-xs truncate">{category.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Savings Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileBarChart className="h-5 w-5 text-ptcustom-blue" />
                Savings History
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-ptcustom-blue">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={savingsHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#0EA5E9"
                    strokeWidth={2}
                    name="Savings"
                    dot={{ fill: '#0EA5E9', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#0284C7' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Financial Summary Cards */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-2">Average Monthly Savings</h3>
            <p className="text-3xl font-bold text-ptcustom-blue">
              ${savingsHistoryData.reduce((sum, item) => sum + item.amount, 0) / savingsHistoryData.length}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              For {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-2">Highest Expense Category</h3>
            <p className="text-3xl font-bold text-ptcustom-blue">
              Housing
            </p>
            <p className="text-sm text-gray-500 mt-1">
              $1,800 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-2">Year-to-Date Savings</h3>
            <p className="text-3xl font-bold text-ptcustom-blue">
              $12,680
            </p>
            <p className="text-sm text-gray-500 mt-1">
              24% increase from last year
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsView;
