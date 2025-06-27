-- Create the soyed.dev@gmail.com user
INSERT INTO users (id, email, password, name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440006', 'soyed.dev@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Soyed Developer', 'Admin')
ON CONFLICT (email) DO NOTHING;

-- Verify the user was created
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'soyed.dev@gmail.com';
