-- Insert sample data into users table with UUIDs
INSERT INTO users (id, username, reputation_score) VALUES
    (gen_random_uuid(), 'john_doe', 10),
    (gen_random_uuid(), 'jane_smith', 20),
    (gen_random_uuid(), 'alice_wonder', 15),
    (gen_random_uuid(), 'bob_builder', 5);

-- Retrieve UUIDs for users for reference in later inserts
WITH user_ids AS (
    SELECT id, username FROM users
    WHERE username IN ('john_doe', 'jane_smith', 'alice_wonder', 'bob_builder')
)
-- Insert sample data into products table with UUIDs
INSERT INTO products (id, title, description, price, seller_id) VALUES
    (gen_random_uuid(), 'Wireless Headphones', 'Noise-cancelling over-ear headphones', 99.99, (SELECT id FROM user_ids WHERE username = 'john_doe')),
    (gen_random_uuid(), 'Smartphone', 'Latest model with advanced features', 699.99, (SELECT id FROM user_ids WHERE username = 'jane_smith')),
    (gen_random_uuid(), 'Laptop', 'Lightweight and powerful laptop', 1299.99, (SELECT id FROM user_ids WHERE username = 'alice_wonder')),
    (gen_random_uuid(), 'Desk Lamp', 'LED desk lamp with adjustable brightness', 29.99, (SELECT id FROM user_ids WHERE username = 'bob_builder'));

-- Retrieve UUIDs for products and users for reference in later inserts
WITH user_ids AS (
    SELECT id, username FROM users
    WHERE username IN ('john_doe', 'jane_smith', 'alice_wonder', 'bob_builder')
),
product_ids AS (
    SELECT id, title FROM products
    WHERE title IN ('Wireless Headphones', 'Smartphone', 'Laptop', 'Desk Lamp')
)
-- Insert sample data into transactions table with UUIDs
INSERT INTO transactions (id, buyer_id, product_id, status) VALUES
    (gen_random_uuid(), (SELECT id FROM user_ids WHERE username = 'john_doe'), (SELECT id FROM product_ids WHERE title = 'Smartphone'), 'completed'),
    (gen_random_uuid(), (SELECT id FROM user_ids WHERE username = 'jane_smith'), (SELECT id FROM product_ids WHERE title = 'Laptop'), 'pending'),
    (gen_random_uuid(), (SELECT id FROM user_ids WHERE username = 'alice_wonder'), (SELECT id FROM product_ids WHERE title = 'Wireless Headphones'), 'completed'),
    (gen_random_uuid(), (SELECT id FROM user_ids WHERE username = 'bob_builder'), (SELECT id FROM product_ids WHERE title = 'Desk Lamp'), 'cancelled');

-- Retrieve UUIDs for users and products for reference in later inserts
WITH user_ids AS (
    SELECT id, username FROM users
    WHERE username IN ('john_doe', 'jane_smith', 'alice_wonder', 'bob_builder')
),
product_ids AS (
    SELECT id, title FROM products
    WHERE title IN ('Wireless Headphones', 'Smartphone', 'Laptop', 'Desk Lamp')
)
-- Insert sample data into reviews table with UUIDs
INSERT INTO reviews (id, user_id, product_id, rating, content) VALUES
    (gen_random_uuid(), (SELECT id FROM user_ids WHERE username = 'john_doe'), (SELECT id FROM product_ids WHERE title = 'Smartphone'), 5, 'Excellent product, highly recommended!'),
    (gen_random_uuid(), (SELECT id FROM user_ids WHERE username = 'jane_smith'), (SELECT id FROM product_ids WHERE title = 'Laptop'), 4, 'Good quality, but a bit expensive.'),
    (gen_random_uuid(), (SELECT id FROM user_ids WHERE username = 'alice_wonder'), (SELECT id FROM product_ids WHERE title = 'Wireless Headphones'), 5, 'Amazing sound quality!'),
    (gen_random_uuid(), (SELECT id FROM user_ids WHERE username = 'bob_builder'), (SELECT id FROM product_ids WHERE title = 'Desk Lamp'), 3, 'Decent lamp, but could be brighter.');
