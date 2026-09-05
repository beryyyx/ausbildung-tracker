PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_gmail_messages` (
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
	CONSTRAINT "gmail_messages_state_check" CHECK("__new_gmail_messages"."state" IN ('pending', 'applied', 'noted', 'dismissed')),
	CONSTRAINT "gmail_messages_suggested_status_check" CHECK("__new_gmail_messages"."suggested_status" IN ('invitation', 'rejected', 'sent'))
);
--> statement-breakpoint
INSERT INTO `__new_gmail_messages`("id", "message_id", "from_address", "from_name", "subject", "received_at", "application_id", "suggested_status", "state", "created_at", "updated_at") SELECT "id", "message_id", "from_address", "from_name", "subject", "received_at", "application_id", "suggested_status", "state", "created_at", "updated_at" FROM `gmail_messages`;--> statement-breakpoint
DROP TABLE `gmail_messages`;--> statement-breakpoint
ALTER TABLE `__new_gmail_messages` RENAME TO `gmail_messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `gmail_messages_message_id_unique` ON `gmail_messages` (`message_id`);