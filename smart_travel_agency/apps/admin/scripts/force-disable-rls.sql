-- Force disable RLS and remove all policies with CASCADE
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_availabilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;
ALTER TABLE weather DISABLE ROW LEVEL SECURITY;

-- Drop all policies with CASCADE to ensure complete removal
DROP POLICY IF EXISTS "Users can view their own data" ON users CASCADE;
DROP POLICY IF EXISTS "Admins can view all users" ON users CASCADE;
DROP POLICY IF EXISTS "Anyone can view active trips" ON trips CASCADE;
DROP POLICY IF EXISTS "Trip creators can manage their trips" ON trips CASCADE;
DROP POLICY IF EXISTS "Users can view their own reservations" ON reservations CASCADE;
DROP POLICY IF EXISTS "Admins and Vendeurs can view all reservations" ON reservations CASCADE;

-- Force drop any remaining policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        BEGIN
            EXECUTE format('DROP POLICY %I ON %I.%I CASCADE', r.policyname, r.schemaname, r.tablename);
        EXCEPTION WHEN OTHERS THEN
            -- Continue if policy doesn't exist
            NULL;
        END;
    END LOOP;
END $$;

-- Grant full access to anon role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant full access to authenticated role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Ensure no RLS is enabled
UPDATE pg_class SET relrowsecurity = false WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
