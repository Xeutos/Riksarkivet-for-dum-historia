-- Riksarkivet för dum historia – databasschema
-- Körs automatiskt av Docker första gången (docker-entrypoint-initdb.d)

CREATE DATABASE IF NOT EXISTS riksarkivet
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE riksarkivet;

-- Ta bort i omvänd ordning (tabeller med främmande nycklar först)
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS quiz;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(50)  NOT NULL UNIQUE,
  email        VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ett quiz per epok
CREATE TABLE quiz (
  quizId INT AUTO_INCREMENT PRIMARY KEY,
  epok   VARCHAR(100) NOT NULL
);

CREATE TABLE questions (
  questionId       INT AUTO_INCREMENT PRIMARY KEY,
  quizId           INT NOT NULL,
  articleId        INT NULL,          -- vilken artikel frågan bygger på (artiklarna ligger i articles.json)
  type             ENUM('multiple_choice', 'true_false') NOT NULL DEFAULT 'multiple_choice',
  question         VARCHAR(500) NOT NULL,
  questionImageUrl VARCHAR(500) NULL,
  rightAnswer      VARCHAR(255) NOT NULL,
  wrongAnswer1     VARCHAR(255) NOT NULL,
  wrongAnswer2     VARCHAR(255) NULL,
  wrongAnswer3     VARCHAR(255) NULL,
  FOREIGN KEY (quizId) REFERENCES quiz(quizId) ON DELETE CASCADE
);

CREATE TABLE results (
  resultId    INT AUTO_INCREMENT PRIMARY KEY,
  userId      INT NOT NULL,
  quizId      INT NOT NULL,
  score       INT NOT NULL,
  total       INT NOT NULL,
  completedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (quizId) REFERENCES quiz(quizId) ON DELETE CASCADE
);

CREATE TABLE favorites (
  favoriteId INT AUTO_INCREMENT PRIMARY KEY,
  userId     INT NOT NULL,
  articleId  INT NOT NULL,
  createdAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (userId, articleId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);