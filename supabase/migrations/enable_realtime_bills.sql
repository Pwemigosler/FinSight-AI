
-- Enable REPLICA IDENTITY FULL for bills table to get complete row data during updates
ALTER TABLE public.bills REPLICA IDENTITY FULL;

-- Add the bills table to the supabase_realtime publication
BEGIN;
  -- First check if the table is already in the publication
  -- to avoid "relation already in publication" error
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'bills'
  ) THEN
    -- Add the table to the publication
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bills;
  END IF;
COMMIT;
