BEGIN TRANSACTION;
CREATE TABLE "deliverables" (
	`shortname`	TEXT NOT NULL UNIQUE,
	`name`	TEXT NOT NULL,
	`weight`	REAL NOT NULL DEFAULT 0,
	`open_date`	INTEGER NOT NULL,
	`close_date`	INTEGER NOT NULL
);
CREATE TABLE "deliverable_components" (
	`deliverable`	TEXT NOT NULL,
	`type`	TEXT NOT NULL,
	`weight`	REAL NOT NULL DEFAULT 0
);
CREATE TABLE "auth" (
	`firstname`	TEXT NOT NULL,
	`lastname`	TEXT NOT NULL,
	`userid`	TEXT NOT NULL UNIQUE,
	`student_number`	TEXT NOT NULL UNIQUE,
	`github_id`	TEXT NOT NULL DEFAULT '' UNIQUE
);
COMMIT;
