# Emergency SQL Scripts

This directory contains emergency and diagnostic SQL scripts that should **NOT** be run as part of the normal migration sequence. These are troubleshooting tools for specific issues.

## When to Use These Scripts

- **DIAGNOSE_*.sql**: Run these to diagnose specific issues (user creation, auth blocking, sync problems)
- **EMERGENCY_*.sql**: Run these only when you're experiencing critical errors that prevent basic functionality
- **QUICK_FIX_*.sql**: Temporary fixes for specific issues
- **VERIFY_*.sql**: Scripts to verify and fix specific migrations

## Important Notes

⚠️ **DO NOT** run these scripts as part of normal database setup!

These scripts are meant to be run manually when troubleshooting specific issues. They may:
- Disable triggers
- Modify critical database settings
- Create temporary fixes
- Require manual cleanup afterward

## Normal Migration Order

For normal database setup, run migrations in order from `000_reset_database.sql` through `031_*.sql` in the `migrations/` directory.

See `../migrations/README.md` for the complete migration order.

