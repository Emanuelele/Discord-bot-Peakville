CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    schedule_value VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL,
    days_value VARCHAR(50) DEFAULT '*',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id VARCHAR(255) NOT NULL,
    closer_id VARCHAR(255),
    transcript TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE allowlist (
    discord_id VARCHAR(50) PRIMARY KEY,
    executor VARCHAR(50)
);

CREATE TABLE `bans` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `discord_id` VARCHAR(64) DEFAULT NULL,
    `rockstar_id` VARCHAR(64) DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `license_id` VARCHAR(64) DEFAULT NULL,
    `xbox_live_id` VARCHAR(64) DEFAULT NULL,
    `live_id` VARCHAR(64) DEFAULT NULL,
    `fivem_id` VARCHAR(64) DEFAULT NULL,
    `ban_reason` TEXT NOT NULL,
    `ban_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `unban_date` DATETIME DEFAULT NULL,
    `admin_id` VARCHAR(64) NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE
);

CREATE TABLE suspensions (
    user_id VARCHAR(255) PRIMARY KEY,
    remand_count INT DEFAULT 0,
    suspension_end BIGINT DEFAULT 0,
    executor VARCHAR(255),
);

CREATE TABLE verification_attempts (
    user_id VARCHAR(255) PRIMARY KEY,
    attempts INT DEFAULT 0,
);

