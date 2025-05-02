
// Collection of financial tips to display
export const financialTips = [
  "Consider setting aside 20% of your income for savings and investments.",
  "Create an emergency fund that covers 3-6 months of expenses.",
  "Pay off high-interest debt first to save money in the long run.",
  "Review your subscription services monthly to eliminate unused ones.",
  "Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.",
  "Check your credit score regularly and work on improving it.",
  "Consider automating your savings to make it easier to stick to your budget.",
  "Look for no-fee banking options to avoid unnecessary charges.",
  "Compare insurance policies annually to ensure you're getting the best rates.",
  "Track your spending for a month to identify areas where you can cut back.",
  "Consider investing in index funds for a low-cost, diversified investment strategy.",
  "Take advantage of employer 401(k) matching contributions if available.",
  "Avoid lifestyle inflation when you get a raise or bonus.",
  "Set specific financial goals with deadlines to stay motivated.",
  "Remember that small savings add up over time.",
  "Look into high-yield savings accounts to make your emergency fund work harder.",
  "Consider using the envelope budgeting system to control spending.",
  "Review your tax withholdings to ensure you're not giving the government an interest-free loan.",
  "Shop around for better rates on insurance policies every year.",
  "Use cash-back credit cards for everyday purchases, but pay them off monthly.",
  "Look into refinancing high-interest debt to save on interest payments.",
  "Create a separate savings account for each of your financial goals.",
  "Consider a health savings account (HSA) if you have a high-deductible health plan.",
  "Review bank statements monthly to catch any unexpected fees.",
  "Always negotiate salaries, raises, and major purchases."
];

// Function to get a random tip
export const getRandomTip = (): string => {
  const randomIndex = Math.floor(Math.random() * financialTips.length);
  return financialTips[randomIndex];
};
