-- Achievement Verification System
-- Allows users to invite colleagues to verify their achievements

CREATE TABLE IF NOT EXISTS achievementVerifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  achievementId INT NOT NULL,
  userId INT NOT NULL,
  verifierEmail VARCHAR(320),
  verifierName VARCHAR(255),
  verificationStatus ENUM('pending', 'verified', 'declined') DEFAULT 'pending',
  verificationToken VARCHAR(64) UNIQUE,
  verifiedAt TIMESTAMP NULL,
  verifierComments TEXT,
  relationship VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (achievementId) REFERENCES achievements(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_verification_achievement ON achievementVerifications(achievementId);
CREATE INDEX idx_verification_token ON achievementVerifications(verificationToken);
CREATE INDEX idx_verification_status ON achievementVerifications(verificationStatus);
