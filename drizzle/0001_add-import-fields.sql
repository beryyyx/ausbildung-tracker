ALTER TABLE `applications` ADD `commute_minutes` integer;--> statement-breakpoint
ALTER TABLE `applications` ADD `source` text;--> statement-breakpoint
ALTER TABLE `applications` ADD `refnr` text;--> statement-breakpoint
CREATE UNIQUE INDEX `applications_refnr_unique` ON `applications` (`refnr`);