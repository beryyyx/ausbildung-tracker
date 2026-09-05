CREATE TABLE `gmail_account` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`refresh_token` text NOT NULL,
	`access_token` text NOT NULL,
	`access_token_expires_at` integer NOT NULL,
	`reconnect_required` integer DEFAULT false NOT NULL,
	`last_synced_at` integer,
	`last_sync_listed` integer,
	`last_sync_examined` integer,
	`last_sync_matched` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "gmail_account_singleton_check" CHECK("gmail_account"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE `gmail_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message_id` text NOT NULL,
	`from_address` text NOT NULL,
	`from_name` text,
	`subject` text NOT NULL,
	`received_at` integer NOT NULL,
	`application_id` integer,
	`suggested_status` text,
	`state` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "gmail_messages_state_check" CHECK("gmail_messages"."state" IN ('pending', 'applied', 'dismissed')),
	CONSTRAINT "gmail_messages_suggested_status_check" CHECK("gmail_messages"."suggested_status" IN ('invitation', 'rejected', 'sent'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gmail_messages_message_id_unique` ON `gmail_messages` (`message_id`);