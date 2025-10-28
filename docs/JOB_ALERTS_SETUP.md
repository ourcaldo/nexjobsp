# Job Alerts Feature - Database Setup

## Overview
The job alerts feature allows users to subscribe to notifications for jobs matching their preferences. This document provides the SQL queries needed to set up the required database table and functions.

## Database Schema

### 1. Create job_alerts Table

Run this SQL query in your Supabase SQL editor:

```sql
-- Create job_alerts table
CREATE TABLE IF NOT EXISTS job_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_name VARCHAR(255) NOT NULL,
  keywords TEXT[],
  location_province VARCHAR(100),
  location_city VARCHAR(100),
  job_categories TEXT[],
  job_types TEXT[],
  experience_levels TEXT[],
  education_levels TEXT[],
  industries TEXT[],
  work_policies TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  is_active BOOLEAN DEFAULT true,
  frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly')),
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON job_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_is_active ON job_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_job_alerts_frequency ON job_alerts(frequency);
CREATE INDEX IF NOT EXISTS idx_job_alerts_last_sent ON job_alerts(last_sent_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_job_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_alerts_updated_at_trigger
  BEFORE UPDATE ON job_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_job_alerts_updated_at();

-- Add RLS policies
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own alerts
CREATE POLICY "Users can view own job alerts"
  ON job_alerts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own alerts
CREATE POLICY "Users can create own job alerts"
  ON job_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own alerts
CREATE POLICY "Users can update own job alerts"
  ON job_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own alerts
CREATE POLICY "Users can delete own job alerts"
  ON job_alerts FOR DELETE
  USING (auth.uid() = user_id);
```

### 2. Create job_alert_logs Table (Optional - for tracking sent alerts)

```sql
-- Create job_alert_logs table to track which jobs were sent to which users
CREATE TABLE IF NOT EXISTS job_alert_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES job_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_ids TEXT[] NOT NULL,
  jobs_count INTEGER NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  email_status VARCHAR(20) DEFAULT 'sent' CHECK (email_status IN ('sent', 'failed', 'bounced'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_job_alert_logs_alert_id ON job_alert_logs(alert_id);
CREATE INDEX IF NOT EXISTS idx_job_alert_logs_user_id ON job_alert_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alert_logs_sent_at ON job_alert_logs(sent_at);

-- Add RLS policies
ALTER TABLE job_alert_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own alert logs
CREATE POLICY "Users can view own job alert logs"
  ON job_alert_logs FOR SELECT
  USING (auth.uid() = user_id);
```

## Verification

After running these queries, verify the tables were created successfully:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('job_alerts', 'job_alert_logs');

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('job_alerts', 'job_alert_logs');

-- Check RLS policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('job_alerts', 'job_alert_logs');
```

## Next Steps

After creating the database tables:

1. Create API routes for job alerts CRUD operations in `app/api/user/job-alerts/`
2. Implement the job alerts UI component in `components/JobAlerts/`
3. Set up email notifications (using Resend, SendGrid, or similar service)
4. Create a cron job or scheduled function to process and send alerts
5. Update `.env.example` and `.env` with email service credentials
6. Set `NEXT_PUBLIC_FEATURE_JOB_ALERTS=true` in `.env` to enable the feature

## Email Service Configuration

Add these environment variables for email notifications:

```env
# Email Service (Choose one: resend, sendgrid, ses)
EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@nexjob.tech
EMAIL_FROM_NAME=Nexjob Job Alerts

# Resend (if using Resend)
RESEND_API_KEY=your_resend_api_key

# SendGrid (if using SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key

# AWS SES (if using AWS SES)
AWS_SES_REGION=ap-southeast-1
AWS_SES_ACCESS_KEY=your_aws_access_key
AWS_SES_SECRET_KEY=your_aws_secret_key
```

## Notes

- The `job_alerts` table stores user preferences for job notifications
- The `job_alert_logs` table tracks which alerts have been sent to prevent duplicates
- RLS policies ensure users can only access their own alerts
- The frequency field allows users to choose how often they receive alerts (instant, daily, weekly)
- Indexes are created for optimal query performance
