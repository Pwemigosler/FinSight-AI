
// Sample data for reports
export const monthlyExpensesData = [
  { month: 'Jan', income: 7250, expenses: 5800 },
  { month: 'Feb', income: 7350, expenses: 5950 },
  { month: 'Mar', income: 7400, expenses: 6100 },
  { month: 'Apr', income: 7900, expenses: 6300 },
  { month: 'May', income: 8100, expenses: 6200 },
  { month: 'Jun', income: 8200, expenses: 6150 },
  { month: 'Jul', income: 8350, expenses: 6250 },
  { month: 'Aug', income: 8400, expenses: 6300 },
];

export const categorySpendingData = [
  { name: 'Housing', value: 1800, color: '#9b87f5' },
  { name: 'Food', value: 650, color: '#7E69AB' },
  { name: 'Transportation', value: 320, color: '#F97316' },
  { name: 'Entertainment', value: 410, color: '#0EA5E9' },
  { name: 'Utilities', value: 310, color: '#10B981' },
  { name: 'Healthcare', value: 220, color: '#D946EF' },
];

export const savingsHistoryData = [
  { month: 'Jan', amount: 1450 },
  { month: 'Feb', amount: 1400 },
  { month: 'Mar', amount: 1300 },
  { month: 'Apr', amount: 1600 },
  { month: 'May', amount: 1900 },
  { month: 'Jun', amount: 2050 },
  { month: 'Jul', amount: 2100 },
  { month: 'Aug', amount: 2100 },
];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const calculateAverageSavings = (data: Array<{amount: number}>) => {
  return (data.reduce((sum, item) => sum + item.amount, 0) / data.length).toFixed(0);
};
