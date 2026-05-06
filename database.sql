CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    role VARCHAR(20) 
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50)
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category_id INTEGER REFERENCES categories(id),
    titulo VARCHAR(150),
    descricao TEXT,
    status VARCHAR(20) DEFAULT 'Aberto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (nome, email, role) VALUES ('Admin', 'admin@teste.com', 'ADMIN'), ('User', 'user@teste.com', 'USER');
INSERT INTO categories (nome) VALUES ('Suporte Técnico'), ('Manutenção'), ('Acessos');