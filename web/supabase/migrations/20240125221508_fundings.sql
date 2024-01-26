CREATE TABLE "public"."funding_entries" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp WITH time zone NOT NULL DEFAULT NOW(),
    "run_id" uuid NOT NULL,
    "project_id" text NOT NULL,
    "transaction_id" text,
    "amount" text NOT NULL,
    "token" text NOT NULL,
    "weight" numeric NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE CASCADE,
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE
);

ALTER TABLE
    "public"."funding_entries" enable ROW LEVEL SECURITY;

CREATE policy "anon_funding_entries_table_select_policy" ON "public"."funding_entries" FOR
SELECT
    TO anon USING (TRUE);

CREATE VIEW funding_entries_view AS
SELECT
    applications.recipient,
    funding_entries.amount,
    projects.description,
    projects.title,
    runs.worker_id
FROM
    runs
    INNER JOIN funding_entries ON runs.id = funding_entries.run_id
    INNER JOIN projects ON funding_entries.project_id = projects.id
    INNER JOIN applications ON projects.id = applications.project_id;