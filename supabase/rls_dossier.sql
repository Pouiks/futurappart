-- Enable RLS
ALTER TABLE dossier_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- 1. Dossier Persons Policies
-- Users can see their own dossier persons (linked via profileId -> auth.uid())
-- Assuming profile.id == auth.uid() OR there is a mapping table. 
-- In this schema, profile.id IS the user_id (or correlated). Let's assume profile.id matches auth.uid() for simplicity (or use a join).

CREATE POLICY "Users can insert their own dossier persons" 
ON dossier_persons FOR INSERT 
WITH CHECK (auth.uid()::text = profile_id);

CREATE POLICY "Users can view their own dossier persons" 
ON dossier_persons FOR SELECT 
USING (auth.uid()::text = profile_id);

CREATE POLICY "Users can update their own dossier persons" 
ON dossier_persons FOR UPDATE 
USING (auth.uid()::text = profile_id);

CREATE POLICY "Users can delete their own dossier persons" 
ON dossier_persons FOR DELETE 
USING (auth.uid()::text = profile_id);

-- 2. User Documents Policies
-- Users can see documents BELONGING to a person they own.
-- Requires a join or EXISTS clause.

CREATE POLICY "Users can insert documents for their persons" 
ON user_documents FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dossier_persons dp
    WHERE dp.id = person_id
    AND dp.profile_id = auth.uid()::text
  )
);

CREATE POLICY "Users can view their documents" 
ON user_documents FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM dossier_persons dp
    WHERE dp.id = person_id
    AND dp.profile_id = auth.uid()::text
  )
);

-- STORAGE BUCKET POLICIES (Supabase Storage)
-- Bucket: 'secure-documents'

-- INSERT
-- (storage.foldername(name))[1] should match auth.uid()
-- Path format: {userId}/{role}/{docType}/{filename}

-- CREATE POLICY "Allow Upload to own folder"
CREATE POLICY "Allow Upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
 bucket_id = 'secure-documents' AND
 (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT
CREATE POLICY "Allow View own folder"
ON storage.objects FOR SELECT
USING (
 bucket_id = 'secure-documents' AND
 (storage.foldername(name))[1] = auth.uid()::text
);
