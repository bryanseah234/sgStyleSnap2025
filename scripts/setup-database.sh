#!/bin/bash

# StyleSnap Database Setup Helper Script
# This script helps you set up your Supabase database with all migrations

set -e  # Exit on error

echo "============================================"
echo "StyleSnap Database Setup"
echo "============================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set!"
    echo ""
    echo "Please set your Supabase connection string:"
    echo "export DATABASE_URL='postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres'"
    echo ""
    echo "To find your connection string:"
    echo "1. Go to Supabase Dashboard → Settings → Database"
    echo "2. Copy the 'Connection string' under 'psql'"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ ERROR: psql is not installed!"
    echo ""
    echo "Please install PostgreSQL client:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    echo ""
    exit 1
fi

echo "✅ psql is installed"
echo ""

# Check if SQL files exist
if [ ! -f "sql/001_initial_schema.sql" ]; then
    echo "❌ ERROR: SQL migration files not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "✅ SQL migration files found"
echo ""

# Confirm before proceeding
echo "This script will run 4 migrations in order:"
echo "  1. 001_initial_schema.sql - Core tables"
echo "  2. 002_rls_policies.sql - Security policies"
echo "  3. 003_indexes_functions.sql - Performance"
echo "  4. 004_advanced_features.sql - Advanced features"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "============================================"
echo "Running Migrations..."
echo "============================================"
echo ""

# Migration 1: Initial Schema
echo "📦 Running Migration 1: Initial Schema..."
psql "$DATABASE_URL" -f sql/001_initial_schema.sql
if [ $? -eq 0 ]; then
    echo "✅ Migration 1 complete"
else
    echo "❌ Migration 1 failed!"
    exit 1
fi
echo ""

# Migration 2: RLS Policies
echo "🔒 Running Migration 2: Row Level Security Policies..."
psql "$DATABASE_URL" -f sql/002_rls_policies.sql
if [ $? -eq 0 ]; then
    echo "✅ Migration 2 complete"
else
    echo "❌ Migration 2 failed!"
    exit 1
fi
echo ""

# Migration 3: Indexes & Functions
echo "⚡ Running Migration 3: Indexes & Functions..."
psql "$DATABASE_URL" -f sql/003_indexes_functions.sql
if [ $? -eq 0 ]; then
    echo "✅ Migration 3 complete"
else
    echo "❌ Migration 3 failed!"
    exit 1
fi
echo ""

# Migration 4: Advanced Features
echo "🚀 Running Migration 4: Advanced Features..."
psql "$DATABASE_URL" -f sql/004_advanced_features.sql
if [ $? -eq 0 ]; then
    echo "✅ Migration 4 complete"
else
    echo "❌ Migration 4 failed!"
    exit 1
fi
echo ""

echo "============================================"
echo "Verifying Setup..."
echo "============================================"
echo ""

# Check tables exist
echo "Checking tables..."
TABLES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
TABLES=$(echo $TABLES | xargs)  # Trim whitespace

if [ "$TABLES" -ge 9 ]; then
    echo "✅ Tables created: $TABLES tables found"
else
    echo "⚠️  Warning: Expected at least 9 tables, found $TABLES"
fi

# Check RLS is enabled
echo "Checking Row Level Security..."
RLS_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;")
RLS_COUNT=$(echo $RLS_COUNT | xargs)

if [ "$RLS_COUNT" -ge 9 ]; then
    echo "✅ RLS enabled on $RLS_COUNT tables"
else
    echo "⚠️  Warning: RLS may not be enabled on all tables"
fi

# Check indexes exist
echo "Checking indexes..."
INDEX_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';")
INDEX_COUNT=$(echo $INDEX_COUNT | xargs)

if [ "$INDEX_COUNT" -ge 15 ]; then
    echo "✅ Indexes created: $INDEX_COUNT indexes found"
else
    echo "⚠️  Warning: Expected at least 15 indexes, found $INDEX_COUNT"
fi

echo ""
echo "============================================"
echo "🎉 Database Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. ✅ Configure Google OAuth in Supabase dashboard"
echo "2. ✅ Copy .env.example to .env and fill in credentials"
echo "3. ✅ Run 'npm install' to install dependencies"
echo "4. ✅ Run 'npm run dev' to start development server"
echo ""
echo "For detailed instructions, see DATABASE_GUIDE.md"
echo ""
