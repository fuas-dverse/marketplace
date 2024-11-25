-- Insert sample data into users table
INSERT INTO users (username, reputation_score) VALUES
    ('john_doe', 10),
    ('jane_smith', 20),
    ('alice_wonder', 15),
    ('bob_builder', 5);

-- Insert sample data into products table
INSERT INTO products (title, description, price, seller_id) VALUES
    ('Wireless Headphones', 'Noise-cancelling over-ear headphones', 99.99, 1),
    ('Smartphone', 'Latest model with advanced features', 699.99, 2),
    ('Laptop', 'Lightweight and powerful laptop', 1299.99, 3),
    ('Desk Lamp', 'LED desk lamp with adjustable brightness', 29.99, 4);

-- Insert sample data into transactions table
INSERT INTO transactions (buyer_id, product_id, status) VALUES
    (1, 2, 'completed'),
    (2, 3, 'pending'),
    (3, 1, 'completed'),
    (4, 4, 'cancelled');

-- Insert sample data into reviews table
INSERT INTO reviews (user_id, product_id, rating, content) VALUES
    (1, 2, 5, 'Excellent product, highly recommended!'),
    (2, 3, 4, 'Good quality, but a bit expensive.'),
    (3, 1, 5, 'Amazing sound quality!'),
    (4, 4, 3, 'Decent lamp, but could be brighter.');
