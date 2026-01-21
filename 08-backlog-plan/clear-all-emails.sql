-- Clear all user emails
-- Set email to empty string for all users

UPDATE users SET email = '' WHERE TRUE;

-- Verify
SELECT COUNT(*) as total_users,
       SUM(CASE WHEN email = '' THEN 1 ELSE 0 END) as users_with_empty_email
FROM users;
