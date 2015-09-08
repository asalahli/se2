BEGIN TRANSACTION;
CREATE TABLE `groups` (
	`name`	TEXT
);
CREATE TABLE "grades" (
	`submitter`	TEXT NOT NULL,
	`deliverable`	TEXT NOT NULL,
	`component`	INTEGER,
	`grade`	REAL NOT NULL,
	`text`	TEXT
);
CREATE TABLE "deliverables" (
	`shortname`	TEXT NOT NULL UNIQUE,
	`name`	TEXT NOT NULL,
	`description`	TEXT,
	`is_group`	INTEGER NOT NULL DEFAULT 1,
	`weight`	REAL NOT NULL DEFAULT 0,
	`open_date`	INTEGER NOT NULL,
	`close_date`	INTEGER NOT NULL
);
CREATE TABLE "deliverable_components" (
	`deliverable`	TEXT NOT NULL,
	`description`	TEXT,
	`type`	TEXT NOT NULL,
	`weight`	REAL NOT NULL DEFAULT 0
);
CREATE TABLE "auth" (
	`firstname`	TEXT NOT NULL,
	`lastname`	TEXT NOT NULL,
	`userid`	TEXT NOT NULL UNIQUE,
	`student_number`	TEXT NOT NULL UNIQUE,
	`github_id`	TEXT NOT NULL DEFAULT '',
	`group_id`	INTEGER
);
COMMIT;
