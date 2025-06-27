-- Insert sample users
INSERT INTO users (id, email, password, name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@algeriatravel.com', '$2b$10$hash1', 'Admin User', 'Admin'),
  ('550e8400-e29b-41d4-a716-446655440002', 'vendor@algeriatravel.com', '$2b$10$hash2', 'Vendor User', 'Vendeur'),
  ('550e8400-e29b-41d4-a716-446655440003', 'ahmed.benali@email.com', '$2b$10$hash3', 'Ahmed Benali', 'User'),
  ('550e8400-e29b-41d4-a716-446655440004', 'fatima.khelifi@email.com', '$2b$10$hash4', 'Fatima Khelifi', 'User'),
  ('550e8400-e29b-41d4-a716-446655440005', 'youcef.mammeri@email.com', '$2b$10$hash5', 'Youcef Mammeri', 'User'),
  ('550e8400-e29b-41d4-a716-446655440006', 'soyed.dev@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Soyed Developer', 'Admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample destinations
INSERT INTO destinations (id, name, price, description) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Sahara Desert', 45000, 'Experience the vast beauty of the Sahara Desert'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Constantine', 28500, 'Explore the historic city of bridges'),
  ('650e8400-e29b-41d4-a716-446655440003', 'Algiers', 35200, 'Discover the capital city''s rich heritage'),
  ('650e8400-e29b-41d4-a716-446655440004', 'Tlemcen', 22800, 'Immerse in cultural heritage'),
  ('650e8400-e29b-41d4-a716-446655440005', 'Oran', 41600, 'Enjoy the coastal Mediterranean city')
ON CONFLICT (name) DO NOTHING;

-- Insert sample trips
INSERT INTO trips (id, name, description, price, duration, tags, season, creator_id, is_agency_trip) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'Sahara Desert Adventure', 'Experience the magic of the Sahara with camel trekking, desert camping, and stargazing.', 45000, '3 days', ARRAY['Adventure', 'Desert', 'Camping'], 'Winter', '550e8400-e29b-41d4-a716-446655440001', true),
  ('750e8400-e29b-41d4-a716-446655440002', 'Constantine Historical Tour', 'Discover the rich history and architecture of Constantine, the city of bridges.', 28500, '2 days', ARRAY['History', 'Culture', 'Architecture'], 'All Year', '550e8400-e29b-41d4-a716-446655440001', true),
  ('750e8400-e29b-41d4-a716-446655440003', 'Algiers City Break', 'Explore the capital city''s blend of French colonial and Islamic architecture.', 35200, '4 days', ARRAY['City', 'Culture', 'History'], 'Spring', '550e8400-e29b-41d4-a716-446655440001', true),
  ('750e8400-e29b-41d4-a716-446655440004', 'Tlemcen Cultural Experience', 'Immerse yourself in the cultural heritage of Tlemcen and its surroundings.', 22800, '2 days', ARRAY['Culture', 'Heritage', 'Art'], 'Summer', '550e8400-e29b-41d4-a716-446655440001', true),
  ('750e8400-e29b-41d4-a716-446655440005', 'Oran Coastal Getaway', 'Enjoy the Mediterranean coastline and vibrant city life of Oran.', 41600, '3 days', ARRAY['Beach', 'City', 'Relaxation'], 'Summer', '550e8400-e29b-41d4-a716-446655440001', true)
ON CONFLICT (name) DO NOTHING;

-- Insert trip availabilities
INSERT INTO trip_availabilities (trip_id, available_seats, status) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 20, 'Available'),
  ('750e8400-e29b-41d4-a716-446655440002', 15, 'Available'),
  ('750e8400-e29b-41d4-a716-446655440003', 25, 'Available'),
  ('750e8400-e29b-41d4-a716-446655440004', 12, 'Limited'),
  ('750e8400-e29b-41d4-a716-446655440005', 18, 'Available')
ON CONFLICT (trip_id) DO NOTHING;

-- Insert sample reservations
INSERT INTO reservations (id, full_name, email, number_of_people, status, user_id, trip_id) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', 'Ahmed Benali', 'ahmed.benali@email.com', 2, 'CONFIRMED', '550e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001'),
  ('850e8400-e29b-41d4-a716-446655440002', 'Fatima Khelifi', 'fatima.khelifi@email.com', 4, 'PENDING', '550e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002'),
  ('850e8400-e29b-41d4-a716-446655440003', 'Youcef Mammeri', 'youcef.mammeri@email.com', 1, 'CONFIRMED', '550e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440003'),
  ('850e8400-e29b-41d4-a716-446655440004', 'Amina Boudiaf', 'amina.boudiaf@email.com', 3, 'CONFIRMED', NULL, '750e8400-e29b-41d4-a716-446655440004'),
  ('850e8400-e29b-41d4-a716-446655440005', 'Karim Zeroual', 'karim.zeroual@email.com', 2, 'CANCELLED', NULL, '750e8400-e29b-41d4-a716-446655440005');

-- Insert sample payments
INSERT INTO payments (amount, payment_method, status, reservation_id, paid_at) VALUES
  (45000.00, 'Credit Card', 'PAID', '850e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 day'),
  (28500.00, 'Bank Transfer', 'PENDING', '850e8400-e29b-41d4-a716-446655440002', NULL),
  (35200.00, 'Credit Card', 'PAID', '850e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '2 days'),
  (22800.00, 'Cash', 'PAID', '850e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '3 days'),
  (41600.00, 'Credit Card', 'FAILED', '850e8400-e29b-41d4-a716-446655440005', NULL);

-- Insert sample promo codes
INSERT INTO promo_codes (code, discount_percentage, valid_until, usage_limit) VALUES
  ('WELCOME10', 10.00, NOW() + INTERVAL '30 days', 100),
  ('SUMMER20', 20.00, NOW() + INTERVAL '60 days', 50),
  ('FAMILY15', 15.00, NOW() + INTERVAL '45 days', 75);
