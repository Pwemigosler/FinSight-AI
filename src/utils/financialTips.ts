
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
  "Remember that small savings add up over time."
];

// Function to get a random tip
export const getRandomTip = (): string => {
  const randomIndex = Math.floor(Math.random() * financialTips.length);
  return financialTips[randomIndex];
};
