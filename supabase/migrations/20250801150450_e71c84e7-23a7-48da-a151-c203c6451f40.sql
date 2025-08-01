-- Remove duplicate matches, keeping only the most recent one for each external_id
WITH ranked_matches AS (
  SELECT id, external_id, 
         ROW_NUMBER() OVER (PARTITION BY external_id ORDER BY updated_at DESC, created_at DESC) as rn
  FROM matches 
  WHERE external_id IS NOT NULL
)
DELETE FROM matches 
WHERE id IN (
  SELECT id FROM ranked_matches WHERE rn > 1
);