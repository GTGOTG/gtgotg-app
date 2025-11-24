CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` varchar(255) NOT NULL,
	`name` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`latitude` varchar(20) NOT NULL,
	`longitude` varchar(20) NOT NULL,
	`street` text,
	`city` varchar(255),
	`state` varchar(2),
	`postcode` varchar(20),
	`phone` varchar(50),
	`website` text,
	`brand` varchar(255),
	`hasRestroom` int NOT NULL DEFAULT 1,
	`restroomType` enum('public','customer') NOT NULL,
	`restroomConfidence` varchar(10),
	`source` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`),
	CONSTRAINT `locations_externalId_unique` UNIQUE(`externalId`)
);
--> statement-breakpoint
CREATE TABLE `ownerReplies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`userId` int NOT NULL,
	`reply` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ownerReplies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ownerVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`userId` int NOT NULL,
	`verificationStatus` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ownerVerifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `ownerVerifications_locationId_unique` UNIQUE(`locationId`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`userId` int NOT NULL,
	`cleanlinessRating` int NOT NULL,
	`adaComplianceRating` int,
	`safetyRating` int NOT NULL,
	`restroomTypeUsed` enum('male','female','unisex_family') NOT NULL,
	`usedAdaStall` int NOT NULL DEFAULT 0,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userBadges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeType` enum('reviewer','bronze','silver','gold','platinum','expert') NOT NULL,
	`reviewCount` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userBadges_id` PRIMARY KEY(`id`)
);
