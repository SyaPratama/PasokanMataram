-- Seed commodity taxonomy mapping (business categories → ML training labels)
INSERT INTO commodity_taxonomy_mapping (id, business_category, ml_training_label) VALUES
('11111111-1111-1111-1111-111111111111', 'PERISHABLE_VEGETABLE', 'Hortikultura'),
('22222222-2222-2222-2222-222222222222', 'GRAIN', 'Pangan Pokok'),
('33333333-3333-3333-3333-333333333333', 'MEAT', 'Pangan Pokok'),
('44444444-4444-4444-4444-444444444444', 'MILK', 'Pangan Pokok'),
('55555555-5555-5555-5555-555555555555', 'PROCESSED', 'Perkebunan')
ON DUPLICATE KEY UPDATE ml_training_label = VALUES(ml_training_label);
