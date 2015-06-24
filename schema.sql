BEGIN TRANSACTION;
CREATE TABLE "deliverables" (
	`name`	TEXT NOT NULL,
	`weight`	REAL NOT NULL DEFAULT 0
);
CREATE TABLE "deliverable_components" (
	`deliverable`	TEXT NOT NULL,
	`name`	TEXT NOT NULL,
	`open_date`	INTEGER NOT NULL,
	`close_date`	INTEGER NOT NULL
);
CREATE TABLE "auth" (
	`firstname`	TEXT NOT NULL,
	`lastname`	TEXT NOT NULL,
	`userid`	TEXT NOT NULL UNIQUE,
	`student_number`	TEXT NOT NULL UNIQUE,
	`github_id`	TEXT NOT NULL DEFAULT '' UNIQUE
);
COMMIT;
