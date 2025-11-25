CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, role) VALUES ('admin', 'admin');
