-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(255) NOT NULL,
  user_id UUID,
  session_id VARCHAR(255) NOT NULL,
  residence_id UUID,
  city VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_residence_id ON events(residence_id);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow insert from authenticated service role or backend (if connecting via direct connection it bypasses RLS, but good practice)
-- Since we use Prisma with a connection string that usually has admin rights or we might want to be careful.
-- However, for Supabase "Client" use, we definitely want to BLOCK direct inserts from public anon key just in case.
-- Although we said "Insertion uniquement via routes server", ensuring RLS blocks public access is good.

-- Policy: No public access
CREATE POLICY "No public access" ON events
FOR ALL
USING (false);
