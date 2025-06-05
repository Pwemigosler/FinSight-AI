
// A simple sentiment analysis utility using a scoring approach
// This is a basic implementation to avoid external dependencies

// Words with positive sentiments and their scores
const positiveWords: Record<string, number> = {
  'happy': 1,
  'great': 1,
  'excellent': 2,
  'good': 1,
  'thanks': 1,
  'thank': 1,
  'awesome': 2,
  'amazing': 2,
  'love': 2,
  'nice': 1,
  'perfect': 2,
  'well': 1,
  'yes': 0.5,
  'save': 0.5,
  'savings': 0.5,
  'profit': 1,
  'growth': 1,
  'success': 1,
  'successful': 1,
  'achieve': 1,
  'accomplished': 1,
  'increase': 0.5,
  'earned': 1,
  'earning': 1,
  'gain': 1
};

// Words with negative sentiments and their scores
const negativeWords: Record<string, number> = {
  'sad': 1,
  'bad': 1,
  'terrible': 2,
  'awful': 2,
  'poor': 1,
  'no': 0.5,
  'not': 0.5,
  'hate': 2,
  'dislike': 1,
  'sorry': 0.5,
  'wrong': 1,
  'fail': 1,
  'failed': 1,
  'debt': 1,
  'expense': 0.5,
  'expenses': 0.5,
  'expensive': 0.5,
  'cost': 0.5,
  'costs': 0.5,
  'costly': 0.5,
  'loss': 1,
  'lost': 1,
  'losing': 1,
  'decrease': 0.5,
  'decline': 0.5
};

// Function to analyze sentiment in a message
export const analyze = (text: string): { score: number; comparative: number; tokens: string[] } => {
  // Check for empty text
  if (!text || text.trim() === '') {
    return { score: 0, comparative: 0, tokens: [] };
  }

  // Convert to lowercase and split into words
  const tokens = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .split(/\s+/);

  let score = 0;
  
  // Score each word
  tokens.forEach(word => {
    if (positiveWords[word]) {
      score += positiveWords[word];
    }
    if (negativeWords[word]) {
      score -= negativeWords[word];
    }
  });
  
  // Special cases: questions often indicate confusion or thinking
  if (text.includes('?')) {
    score -= 0.5; // Slight negative for questions
  }
  
  // Calculate comparative score (normalized by text length)
  const comparative = tokens.length > 0 ? score / tokens.length : 0;
  
  return {
    score,
    comparative,
    tokens
  };
};

// Export from 'natural-sentiment' namespace to match context imports
export const naturalSentiment = {
  analyze
};
