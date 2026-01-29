-- Add game_state column to profiles table to store user progress
alter table profiles add column game_state jsonb;
