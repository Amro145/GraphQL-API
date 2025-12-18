ALTER TABLE `review` ADD `game_id` integer NOT NULL REFERENCES game(id);--> statement-breakpoint
ALTER TABLE `review` ADD `user_id` integer NOT NULL REFERENCES users(id);