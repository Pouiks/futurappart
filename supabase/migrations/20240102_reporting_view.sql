-- Create a flat view for easier reporting (Excel/Metabase style)
-- This allows filtering by City, Residence, and Typology without complex JSON parsing.

CREATE OR REPLACE VIEW analytics_events_flat AS
SELECT 
  e.created_at,
  e.event_type,
  e.city,
  
  -- Residence Details
  r.name as residence_name,
  
  -- Unit Details (extracted from metadata joins)
  u.type as unit_typology,
  u.price as unit_price,
  
  -- Session/User
  e.session_id,
  e.user_id,
  
  -- Extracted Metadata (common fields)
  e.metadata->>'channel' as channel,
  e.metadata->>'partner_status' as partner_status,
  e.metadata->>'source' as source
  
FROM events e
LEFT JOIN canon_residences r ON e.residence_id = r.id
-- Try to join unit if unit_id is present in metadata (common for recommendations/leads)
-- Note: JSONB operator ->> returns text, cast to UUID for join if valid
LEFT JOIN canon_units u ON (e.metadata->>'unit_id')::uuid = u.id;

-- Example Usage Comments:
-- Filter by City: WHERE city = 'bordeaux'
-- Filter by Residence: WHERE residence_name = 'Kley...'
-- Filter by Typology: WHERE unit_typology = 'STUDIO'
