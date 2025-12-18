CREATE TABLE `game` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`platform` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `review` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rating` integer NOT NULL,
	`comment` text NOT NULL
);
