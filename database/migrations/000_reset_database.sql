-- ============================================
-- Migration 000: Complete Database Reset
-- ============================================
-- Purpose: Completely removes all database objects (tables, functions, triggers, policies, extensions)
--          Use this to start fresh if migrations fail or you need to recreate the database
-- Dependencies: None (this is the first script to run)
-- WARNING: This will DELETE ALL DATA! Use only in development or when starting fresh.
-- 
-- IMPORTANT: Review this script carefully before running!
-- This script will:
--   1. Drop all triggers
--   2. Drop all functions
--   3. Drop all tables (and their data)
--   4. Drop all RLS policies
--   5. Drop custom extensions (keeps built-in extensions)
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: DROP ALL TRIGGERS
-- ============================================
-- Triggers must be dropped before tables/functions

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all triggers on public schema tables
    FOR r IN (
        SELECT schemaname, tablename, triggername
        FROM pg_triggers
        WHERE schemaname = 'public'
        AND NOT tgisinternal
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE', 
            r.triggername, r.schemaname, r.tablename);
    END LOOP;
    
    -- Also disable triggers on auth.users if they exist
    BEGIN
        ALTER TABLE auth.users DISABLE TRIGGER ALL;
    EXCEPTION WHEN OTHERS THEN
        -- Ignore if we don't have permission or table doesn't exist
        NULL;
    END;
END $$;

-- ============================================
-- STEP 2: DROP ALL FUNCTIONS
-- ============================================
-- Drop all user-defined functions in public schema

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT n.nspname as schema_name, p.proname as function_name, 
               oidvectortypes(p.proargtypes) as arg_types
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname NOT LIKE 'pg_%'
        AND p.proname NOT LIKE 'plpgsql%'
    ) LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE', 
                r.schema_name, r.function_name, COALESCE(r.arg_types, ''));
        EXCEPTION WHEN OTHERS THEN
            -- Try without parameters if parameterized drop fails
            BEGIN
                EXECUTE format('DROP FUNCTION IF EXISTS %I.%I CASCADE', 
                    r.schema_name, r.function_name);
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop function: %.%', r.schema_name, r.function_name;
            END;
        END;
    END LOOP;
END $$;

-- ============================================
-- STEP 3: DROP ALL TABLES
-- ============================================
-- Drop tables in reverse dependency order (children first)

DROP TABLE IF EXISTS collection_outfits CASCADE;
DROP TABLE IF EXISTS outfit_comments CASCADE;
DROP TABLE IF EXISTS shared_outfit_likes CASCADE;
DROP TABLE IF EXISTS suggestion_feedback CASCADE;
DROP TABLE IF EXISTS outfit_history CASCADE;
DROP TABLE IF EXISTS shared_outfits CASCADE;
DROP TABLE IF EXISTS outfit_collections CASCADE;
DROP TABLE IF EXISTS style_preferences CASCADE;
DROP TABLE IF EXISTS notification_delivery_log CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS outfit_shares CASCADE;
DROP TABLE IF EXISTS outfit_items CASCADE;
DROP TABLE IF EXISTS outfit_likes CASCADE;
DROP TABLE IF EXISTS outfits CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS friend_outfit_suggestions CASCADE;
DROP TABLE IF EXISTS item_likes CASCADE;
DROP TABLE IF EXISTS catalog_items CASCADE;
DROP TABLE IF EXISTS generated_outfits CASCADE;
DROP TABLE IF EXISTS suggestions CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS clothes CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS app_config CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- STEP 4: DROP ALL RLS POLICIES
-- ============================================
-- Policies are automatically dropped with tables, but we ensure cleanup

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                r.policyname, r.schemaname, r.tablename);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- ============================================
-- STEP 5: DROP CUSTOM EXTENSIONS
-- ============================================
-- Only drop extensions we added, not built-in PostgreSQL extensions

DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
DROP EXTENSION IF EXISTS "pgcrypto" CASCADE;
DROP EXTENSION IF EXISTS "pg_trgm" CASCADE;
DROP EXTENSION IF EXISTS "pg_net" CASCADE;

-- ============================================
-- STEP 6: VERIFY CLEANUP
-- ============================================

DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- Count remaining tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    
    -- Count remaining functions
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname NOT LIKE 'pg_%'
    AND p.proname NOT LIKE 'plpgsql%';
    
    -- Count remaining triggers
    SELECT COUNT(*) INTO trigger_count
    FROM pg_triggers
    WHERE schemaname = 'public'
    AND NOT tgisinternal;
    
    RAISE NOTICE '========== RESET COMPLETE ==========';
    RAISE NOTICE 'Remaining tables: %', table_count;
    RAISE NOTICE 'Remaining functions: %', function_count;
    RAISE NOTICE 'Remaining triggers: %', trigger_count;
    
    IF table_count > 0 OR function_count > 0 OR trigger_count > 0 THEN
        RAISE WARNING 'Some objects may still exist. Check manually if needed.';
    ELSE
        RAISE NOTICE 'Database has been completely reset. Ready for fresh migrations.';
    END IF;
END $$;

COMMIT;

-- ============================================
-- NEXT STEPS
-- ============================================
-- After running this reset script:
-- 1. Run migrations in sequential order starting from 001_initial_schema.sql
-- 2. Execute each migration file in order (001, 002, 003, etc.)
-- 3. Check for any errors after each migration
-- 4. Refer to README.md for complete migration order

SELECT 
    '========== RESET SCRIPT COMPLETE ==========' as status,
    'Database has been reset. You can now run migrations starting from 001_initial_schema.sql' as next_steps;

