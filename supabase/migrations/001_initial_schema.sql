-- =============================================================================
-- QUANTALYZE DATABASE SCHEMA
-- Version: 1.0
-- Description: Habit tracking and quality scoring system
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE subscription_status AS ENUM ('free', 'pro', 'cancelled');
CREATE TYPE habit_category AS ENUM ('vitality', 'focus', 'discipline', 'social');
CREATE TYPE goal_type AS ENUM ('binary', 'number', 'duration');

-- =============================================================================
-- PROFILES TABLE
-- Stores user profile information, extends Supabase auth.users
-- =============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_status subscription_status DEFAULT 'free' NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- HABITS TABLE
-- Stores user-defined habits with categories and weights
-- =============================================================================

CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category habit_category NOT NULL,
    weight INTEGER NOT NULL CHECK (weight >= 1 AND weight <= 5) DEFAULT 3,
    goal_type goal_type NOT NULL DEFAULT 'binary',
    goal_value NUMERIC,
    unit TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, name)
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_category ON habits(category);

CREATE TRIGGER habits_updated_at
    BEFORE UPDATE ON habits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- DAILY_LOGS TABLE
-- Stores daily habit completion data
-- =============================================================================

CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    value NUMERIC NOT NULL,
    normalized_value NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, habit_id, date)
);

CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, date);
CREATE INDEX idx_daily_logs_habit_date ON daily_logs(habit_id, date);

CREATE TRIGGER daily_logs_updated_at
    BEFORE UPDATE ON daily_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- QUALITY_SCORES TABLE
-- Stores calculated daily quality scores per bucket
-- =============================================================================

CREATE TABLE quality_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    vitality_score NUMERIC CHECK (vitality_score >= 0 AND vitality_score <= 1),
    focus_score NUMERIC CHECK (focus_score >= 0 AND focus_score <= 1),
    discipline_score NUMERIC CHECK (discipline_score >= 0 AND discipline_score <= 1),
    social_score NUMERIC CHECK (social_score >= 0 AND social_score <= 1),
    overall_score NUMERIC CHECK (overall_score >= 0 AND overall_score <= 1),
    consistency_multiplier NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, date)
);

CREATE INDEX idx_quality_scores_user_date ON quality_scores(user_id, date DESC);

CREATE TRIGGER quality_scores_updated_at
    BEFORE UPDATE ON quality_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- AI_INSIGHTS TABLE
-- Stores AI-generated habit stacking suggestions
-- =============================================================================

CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    insight_type TEXT DEFAULT 'habit_stack',
    title TEXT,
    content TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_ai_insights_created_at ON ai_insights(created_at DESC);

-- =============================================================================
-- IMPORT_SESSIONS TABLE
-- Tracks spreadsheet import history
-- =============================================================================

CREATE TABLE import_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    row_count INTEGER,
    column_mappings JSONB,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_import_sessions_user_id ON import_sessions(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Habits policies
CREATE POLICY "Users can view own habits"
    ON habits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
    ON habits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
    ON habits FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
    ON habits FOR DELETE
    USING (auth.uid() = user_id);

-- Daily logs policies
CREATE POLICY "Users can view own logs"
    ON daily_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
    ON daily_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
    ON daily_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
    ON daily_logs FOR DELETE
    USING (auth.uid() = user_id);

-- Quality scores policies
CREATE POLICY "Users can view own scores"
    ON quality_scores FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
    ON quality_scores FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores"
    ON quality_scores FOR UPDATE
    USING (auth.uid() = user_id);

-- AI insights policies
CREATE POLICY "Users can view own insights"
    ON ai_insights FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
    ON ai_insights FOR UPDATE
    USING (auth.uid() = user_id);

-- Import sessions policies
CREATE POLICY "Users can view own imports"
    ON import_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own imports"
    ON import_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- FUNCTION: Auto-create profile on user signup
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
