-- Add unique constraint on external_id to prevent duplicates
ALTER TABLE matches ADD CONSTRAINT unique_external_id UNIQUE (external_id);