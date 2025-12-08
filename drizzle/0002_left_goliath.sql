CREATE TABLE `business_claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`locationId` int NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`verificationDocumentUrl` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`businessUserId` int NOT NULL,
	`reply` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `review_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','business','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `reviews` ADD `overallRating` int NOT NULL;--> statement-breakpoint
ALTER TABLE `reviews` ADD `photoUrls` text;