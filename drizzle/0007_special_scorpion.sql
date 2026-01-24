ALTER TABLE `sourceMaterials` ADD `status` enum('PENDING','PROCESSED','FAILED') DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE `sourceMaterials` ADD `errorMessage` text;