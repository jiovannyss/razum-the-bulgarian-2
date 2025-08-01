-- Add admin_rating column to cached_fixtures table
ALTER TABLE cached_fixtures 
ADD COLUMN admin_rating integer DEFAULT 1;