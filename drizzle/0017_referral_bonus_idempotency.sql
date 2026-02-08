-- Idempotency for referral bonus: track when bonus was granted per referred user
ALTER TABLE `users` ADD COLUMN `referralBonusGrantedAt` timestamp DEFAULT NULL;
