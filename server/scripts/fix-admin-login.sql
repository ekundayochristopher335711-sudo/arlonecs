-- =====================================================================
-- AURUM — RECOVER ADMIN LOGIN
-- Run in: Supabase dashboard -> SQL Editor -> New query
-- =====================================================================

-- STEP 1: see which accounts actually exist.
-- Run this on its own first and read the emails in the result.
SELECT id, email, name, role, "isActive", "createdAt"
FROM "User"
ORDER BY "createdAt";


-- ---------------------------------------------------------------------
-- STEP 2: give yourself a known working password.
--
-- Replace the email below with one from STEP 1, then run.
-- This sets the password to:  AurumAdmin2026!
-- and guarantees the account is an active ADMIN.
-- ---------------------------------------------------------------------

UPDATE "User"
SET password  = '$2a$12$TGMsTesJGZb7J6HeYzTIXeGHVaLcS9LOIRjooVkhQR2cF9W5Mv4my',
    role      = 'ADMIN',
    "isActive" = true
WHERE email = 'PUT_THE_EMAIL_FROM_STEP_1_HERE';


-- ---------------------------------------------------------------------
-- STEP 2b (alternative): no usable account at all? Create one outright.
-- Change the email if you want a different login address.
-- ---------------------------------------------------------------------

-- INSERT INTO "User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
-- VALUES (
--   gen_random_uuid()::text,
--   'admin@aurum.com',
--   '$2a$12$TGMsTesJGZb7J6HeYzTIXeGHVaLcS9LOIRjooVkhQR2cF9W5Mv4my',
--   'System Admin',
--   'ADMIN',
--   true,
--   NOW(),
--   NOW()
-- );


-- ---------------------------------------------------------------------
-- STEP 3 (optional): remove any leftover account you do not want.
-- ---------------------------------------------------------------------

-- DELETE FROM "AuditLog" WHERE "userId" IN (SELECT id FROM "User" WHERE email = 'unwanted@example.com');
-- DELETE FROM "User" WHERE email = 'unwanted@example.com';
