-- 1. إضافة مستخدمين
INSERT INTO users (name, email) VALUES 
('Amro Nasor', 'amro@ubuntu.com'),
('The Net Ninja', 'shaun@ninja.com'),
('Gemini Partner', 'gemini@ai.com');

-- 2. إضافة ألعاب
INSERT INTO game (name, description, price, platform) VALUES 
('Elden Ring', 'Epic action RPG by FromSoftware', 60, '["PC", "PS5", "Xbox"]'),
('Zelda: TOTK', 'Legendary adventure on Nintendo', 70, '["Switch"]'),
('Cyberpunk 2077', 'Open-world sci-fi RPG', 50, '["PC", "PS5", "Xbox"]');

-- 3. إضافة مراجعات مرتبطة (gameId و userId)
INSERT INTO review (rating, comment, game_id, user_id) VALUES 
(5, 'Absolute masterpiece!', 1, 1),
(4, 'Great game but very difficult', 1, 2),
(5, 'Best open world ever', 2, 2),
(3, 'Good but buggy at launch', 3, 1);