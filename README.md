
# FinSight AI

FinSight AI is a financial management application that helps users track their finances, analyze documents, and get AI-powered insights from their financial data.

## Tech Stack

- Frontend: React + TypeScript
- UI Components: Shadcn UI (Tailwind CSS)
- Backend: Supabase (PostgreSQL with pgvector)
- AI: OpenAI for document analysis and Q&A

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/finsight-ai.git
   cd finsight-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (create a `.env` file in the root):
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Push database schema to Supabase:
   ```bash
   supabase db push
   ```

5. Deploy the edge functions:
   ```bash
   supabase functions deploy askDocument
   supabase functions deploy processDocument
   ```

6. Set up secrets for the edge functions:
   ```bash
   supabase secrets set OPENAI_API_KEY=your_openai_api_key
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- User authentication and profile management
- Transaction tracking and categorization
- Bill payment reminders
- Budget planning and monitoring
- Document management with AI-powered analysis
- Question answering for financial documents
- Responsive UI for mobile and desktop

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Set the build command: `npm run build`
3. Set the output directory: `dist`
4. Add environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Edge Functions

Deploy edge functions to Supabase:

```bash
supabase functions deploy askDocument
supabase functions deploy processDocument
```

Set required secrets:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key
```

## Testing

### Run unit tests:

```bash
npm test
```

### Run end-to-end tests:

```bash
npm run cypress
```

## License

MIT
