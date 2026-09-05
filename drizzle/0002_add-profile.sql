CREATE TABLE `profile` (
	`id` integer PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`birth_date` text,
	`street` text,
	`postal_code` text,
	`city` text,
	`phone` text,
	`email` text,
	`school_name` text,
	`school_degree` text,
	`graduation_year` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "profile_singleton_check" CHECK("profile"."id" = 1),
	CONSTRAINT "profile_school_degree_check" CHECK("profile"."school_degree" IN ('hauptschulabschluss', 'mittlerer_schulabschluss', 'for_mit_qualifikation', 'fachhochschulreife', 'abitur'))
);
--> statement-breakpoint
CREATE TABLE `profile_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`file_name` text NOT NULL,
	`stored_name` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_files_stored_name_unique` ON `profile_files` (`stored_name`);--> statement-breakpoint
CREATE TABLE `profile_grades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`zeugnis_id` integer NOT NULL,
	`subject` text NOT NULL,
	`grade` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`zeugnis_id`) REFERENCES `profile_zeugnisse`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "profile_grades_grade_check" CHECK("profile_grades"."grade" BETWEEN 0 AND 15)
);
--> statement-breakpoint
CREATE TABLE `profile_internships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company` text NOT NULL,
	`field` text,
	`start_date` text,
	`end_date` text,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profile_languages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`language` text NOT NULL,
	`level` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "profile_languages_level_check" CHECK("profile_languages"."level" IN ('a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'native'))
);
--> statement-breakpoint
CREATE TABLE `profile_zeugnisse` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slot` text NOT NULL,
	`title` text,
	`scale` text DEFAULT 'sek1' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "profile_zeugnisse_slot_check" CHECK("profile_zeugnisse"."slot" IN ('latest', 'previous')),
	CONSTRAINT "profile_zeugnisse_scale_check" CHECK("profile_zeugnisse"."scale" IN ('sek1'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_zeugnisse_slot_unique` ON `profile_zeugnisse` (`slot`);