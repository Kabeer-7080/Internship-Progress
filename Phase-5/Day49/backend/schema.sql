-- FinGuard Database Schema for MySQL
-- Database: finguard

CREATE DATABASE IF NOT EXISTS `finguard` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `finguard`;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'Analyst',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Assessments Table (Loan Applications & Fraud Risk Checks)
CREATE TABLE IF NOT EXISTS `assessments` (
  `id` VARCHAR(64) NOT NULL,
  `subject` VARCHAR(120) NOT NULL,
  `kind` VARCHAR(30) NOT NULL DEFAULT 'Loan',
  `amount` DOUBLE NOT NULL,
  `income` DOUBLE NOT NULL,
  `credit_score` INT NOT NULL,
  `employment` VARCHAR(50) DEFAULT 'Full time',
  `term_months` INT DEFAULT 36,
  `channel` VARCHAR(50) DEFAULT 'Branch',
  `score` INT NOT NULL,
  `verdict` VARCHAR(30) NOT NULL,
  `reason` VARCHAR(500) DEFAULT NULL,
  `factors_json` TEXT DEFAULT NULL,
  `user_id` VARCHAR(64) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_assessments_created` (`created_at`),
  INDEX `idx_assessments_verdict` (`verdict`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Team Members Table
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `role` VARCHAR(20) NOT NULL DEFAULT 'Analyst',
  `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Revoked Tokens Table (Day 38 Session Logout)
CREATE TABLE IF NOT EXISTS `revoked_tokens` (
  `id` VARCHAR(64) NOT NULL,
  `token` VARCHAR(512) NOT NULL,
  `revoked_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_revoked_token` (`token`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

