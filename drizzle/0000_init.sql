CREATE TABLE `applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company` text NOT NULL,
	`position` text NOT NULL,
	`city` text,
	`url` text,
	`applied_at` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`deadline` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "applications_status_check" CHECK("applications"."status" IN ('draft', 'sent', 'invitation', 'rejected', 'offer'))
);
