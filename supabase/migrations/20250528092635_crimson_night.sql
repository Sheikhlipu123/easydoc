/*
  # Initial schema setup for API Manager

  1. New Tables
    - `api_keys`: Stores API key information and usage limits
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `name` (text)
      - `hourly_limit` (integer)
      - `monthly_limit` (integer)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `api_usage`: Tracks API usage statistics
      - `id` (uuid, primary key)
      - `api_key_id` (uuid, foreign key)
      - `timestamp` (timestamptz)
      - `endpoint` (text)
      - `status_code` (integer)
      - `response_time` (integer)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hourly_limit integer NOT NULL DEFAULT 100,
  monthly_limit integer NOT NULL DEFAULT 1000,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create API Usage table
CREATE TABLE IF NOT EXISTS api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES api_keys(id),
  timestamp timestamptz DEFAULT now(),
  endpoint text NOT NULL,
  status_code integer NOT NULL,
  response_time integer NOT NULL
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read api_keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert api_keys"
  ON api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read api_usage"
  ON api_usage
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert api_usage"
  ON api_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (true);