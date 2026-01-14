-- SQL command to add reservation_date column to reservations table
-- Run this in your Supabase SQL Editor

ALTER TABLE reservations 
ADD COLUMN reservation_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Note: After running this, you may want to remove the DEFAULT constraint
-- if you want to enforce that dates must be explicitly provided:
-- ALTER TABLE reservations ALTER COLUMN reservation_date DROP DEFAULT;
