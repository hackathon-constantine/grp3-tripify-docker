-- Clear existing data
DELETE FROM payments;
DELETE FROM reservations;
DELETE FROM trip_availabilities;
DELETE FROM trips;
DELETE FROM destinations;
DELETE FROM users WHERE email != 'soyed.dev@gmail.com';

-- Insert real Algerian users
INSERT INTO users (id, email, password, name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'amina.benaissa@email.com', '$2b$10$hash10', 'Amina Benaissa', 'User'),
  ('550e8400-e29b-41d4-a716-446655440011', 'karim.boumediene@email.com', '$2b$10$hash11', 'Karim Boumediene', 'User'),
  ('550e8400-e29b-41d4-a716-446655440012', 'fatima.zerhouni@email.com', '$2b$10$hash12', 'Fatima Zerhouni', 'Vendeur'),
  ('550e8400-e29b-41d4-a716-446655440013', 'omar.benali@email.com', '$2b$10$hash13', 'Omar Benali', 'User'),
  ('550e8400-e29b-41d4-a716-446655440014', 'yasmine.khelifi@email.com', '$2b$10$hash14', 'Yasmine Khelifi', 'User'),
  ('550e8400-e29b-41d4-a716-446655440015', 'rachid.mammeri@email.com', '$2b$10$hash15', 'Rachid Mammeri', 'User'),
  ('550e8400-e29b-41d4-a716-446655440016', 'leila.boudiaf@email.com', '$2b$10$hash16', 'Leila Boudiaf', 'User')
ON CONFLICT (email) DO NOTHING;

-- Insert real Algerian destinations
INSERT INTO destinations (id, name, price, description) VALUES
  ('650e8400-e29b-41d4-a716-446655440010', 'Tassili N''Ajjer National Park', 85000, 'UNESCO World Heritage site featuring prehistoric rock art and stunning sandstone formations'),
  ('650e8400-e29b-41d4-a716-446655440011', 'Hoggar Mountains', 120000, 'Majestic volcanic mountain range home to Mount Tahat and rich Tuareg culture'),
  ('650e8400-e29b-41d4-a716-446655440012', 'Casbah of Algiers', 35000, 'Historic UNESCO World Heritage citadel with Ottoman palaces and Islamic architecture'),
  ('650e8400-e29b-41d4-a716-446655440013', 'Timgad Archaeological Site', 65000, 'Best-preserved Roman city in North Africa with ancient theater and forum'),
  ('650e8400-e29b-41d4-a716-446655440014', 'M''zab Valley', 75000, 'UNESCO site with five fortified cities showcasing unique Mozabite architecture'),
  ('650e8400-e29b-41d4-a716-446655440015', 'Constantine', 40000, 'The City of Bridges dramatically perched on rocky plateaus with spectacular gorges')
ON CONFLICT (name) DO NOTHING;

-- Insert real Algerian trips
INSERT INTO trips (id, name, description, price, duration, tags, season, creator_id, is_agency_trip) VALUES
  ('750e8400-e29b-41d4-a716-446655440010', 'Tassili N''Ajjer Rock Art Tour', 'Explore prehistoric rock art and stunning landscapes of Tassili N''Ajjer National Park, featuring ancient cave paintings and dramatic sandstone formations.', 85000, '5 days', ARRAY['UNESCO', 'Rock Art', 'Desert', 'History'], 'October-April', '550e8400-e29b-41d4-a716-446655440006', true),
  ('750e8400-e29b-41d4-a716-446655440011', 'Hoggar Mountains Expedition', 'Adventure through the majestic Hoggar Mountains, home to Mount Tahat and legendary Tuareg culture. Experience breathtaking sunrises and volcanic landscapes.', 120000, '7 days', ARRAY['Mountains', 'Adventure', 'Tuareg Culture', 'Hiking'], 'November-March', '550e8400-e29b-41d4-a716-446655440006', true),
  ('750e8400-e29b-41d4-a716-446655440012', 'Casbah of Algiers Walking Tour', 'Discover the historic Casbah of Algiers, a UNESCO World Heritage site. Walk through narrow streets and visit Ottoman palaces.', 35000, '1 day', ARRAY['UNESCO', 'History', 'Architecture', 'Culture'], 'All Year', '550e8400-e29b-41d4-a716-446655440006', true),
  ('750e8400-e29b-41d4-a716-446655440013', 'Timgad Roman Ruins Discovery', 'Step back in time at Timgad, the best-preserved Roman city in North Africa. Explore ancient theater, forum, and triumphal arch.', 65000, '2 days', ARRAY['UNESCO', 'Roman History', 'Archaeology', 'Ancient'], 'September-May', '550e8400-e29b-41d4-a716-446655440006', true),
  ('750e8400-e29b-41d4-a716-446655440014', 'M''zab Valley Cultural Journey', 'Experience the unique architecture and culture of M''zab Valley, home to the Mozabite people and five fortified cities.', 75000, '3 days', ARRAY['UNESCO', 'Culture', 'Architecture', 'Traditional'], 'October-April', '550e8400-e29b-41d4-a716-446655440006', true),
  ('750e8400-e29b-41d4-a716-446655440015', 'Oran Bay Coastal Experience', 'Enjoy the Mediterranean charm of Oran. Visit Santa Cruz Fort, explore historic city center, and relax on beautiful beaches.', 45000, '2 days', ARRAY['Coastal', 'Mediterranean', 'History', 'Beach'], 'All Year', '550e8400-e29b-41d4-a716-446655440006', true),
  ('750e8400-e29b-41d4-a716-446655440016', 'Djémila Archaeological Site Tour', 'Explore Djémila (ancient Cuicul), one of the most beautiful Roman ruins. Marvel at well-preserved mosaics and temples.', 55000, '2 days', ARRAY['UNESCO', 'Roman', 'Archaeology', 'Mosaics'], 'March-November', '550e8400-e29b-41d4-a716-446655440006', true),
  ('750e8400-e29b-41d4-a716-446655440017', 'Constantine Bridges & Gorges Tour', 'Discover Constantine, the City of Bridges, dramatically perched on rocky plateau. Visit spectacular gorges and historic bridges.', 40000, '2 days', ARRAY['Bridges', 'Gorges', 'History', 'Architecture'], 'All Year', '550e8400-e29b-41d4-a716-446655440006', true)
ON CONFLICT (name) DO NOTHING;

-- Insert trip availabilities
INSERT INTO trip_availabilities (trip_id, available_seats, status) VALUES
  ('750e8400-e29b-41d4-a716-446655440010', 15, 'Available'),
  ('750e8400-e29b-41d4-a716-446655440011', 12, 'Available'),
  ('750e8400-e29b-41d4-a716-446655440012', 30, 'Available'),
  ('750e8400-e29b-41d4-a716-446655440013', 20, 'Available'),
  ('750e8400-e29b-41d4-a716-446655440014', 18, 'Available'),
  ('750e8400-e29b-41d4-a716-446655440015', 25, 'Available'),
  ('750e8400-e29b-41d4-a716-446655440016', 22, 'Available'),
  ('750e8400-e29b-41d4-a716-446655440017', 28, 'Available')
ON CONFLICT (trip_id) DO NOTHING;

-- Insert real reservations
INSERT INTO reservations (id, full_name, email, number_of_people, status, user_id, trip_id) VALUES
  ('850e8400-e29b-41d4-a716-446655440010', 'Amina Benaissa', 'amina.benaissa@email.com', 2, 'CONFIRMED', '550e8400-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440010'),
  ('850e8400-e29b-41d4-a716-446655440011', 'Karim Boumediene', 'karim.boumediene@email.com', 4, 'PENDING', '550e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440011'),
  ('850e8400-e29b-41d4-a716-446655440012', 'Fatima Zerhouni', 'fatima.zerhouni@email.com', 1, 'CONFIRMED', '550e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440012'),
  ('850e8400-e29b-41d4-a716-446655440013', 'Omar Benali', 'omar.benali@email.com', 3, 'CONFIRMED', '550e8400-e29b-41d4-a716-446655440013', '750e8400-e29b-41d4-a716-446655440013'),
  ('850e8400-e29b-41d4-a716-446655440014', 'Yasmine Khelifi', 'yasmine.khelifi@email.com', 2, 'CANCELLED', '550e8400-e29b-41d4-a716-446655440014', '750e8400-e29b-41d4-a716-446655440015'),
  ('850e8400-e29b-41d4-a716-446655440015', 'Rachid Mammeri', 'rachid.mammeri@email.com', 5, 'PENDING', '550e8400-e29b-41d4-a716-446655440015', '750e8400-e29b-41d4-a716-446655440014'),
  ('850e8400-e29b-41d4-a716-446655440016', 'Leila Boudiaf', 'leila.boudiaf@email.com', 2, 'CONFIRMED', '550e8400-e29b-41d4-a716-446655440016', '750e8400-e29b-41d4-a716-446655440016');

-- Insert payments
INSERT INTO payments (amount, payment_method, status, reservation_id, paid_at) VALUES
  (85000.00, 'Credit Card', 'PAID', '850e8400-e29b-41d4-a716-446655440010', NOW() - INTERVAL '2 days'),
  (120000.00, 'Bank Transfer', 'PENDING', '850e8400-e29b-41d4-a716-446655440011', NULL),
  (35000.00, 'Credit Card', 'PAID', '850e8400-e29b-41d4-a716-446655440012', NOW() - INTERVAL '1 day'),
  (65000.00, 'Cash', 'PAID', '850e8400-e29b-41d4-a716-446655440013', NOW() - INTERVAL '3 days'),
  (45000.00, 'Credit Card', 'FAILED', '850e8400-e29b-41d4-a716-446655440014', NULL),
  (95000.00, 'Bank Transfer', 'PENDING', '850e8400-e29b-41d4-a716-446655440015', NULL),
  (55000.00, 'Credit Card', 'PAID', '850e8400-e29b-41d4-a716-446655440016', NOW() - INTERVAL '4 days');
