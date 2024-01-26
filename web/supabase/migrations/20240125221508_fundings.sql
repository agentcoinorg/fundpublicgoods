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
    A.recipient, 
    FE.amount, 
    P.description, 
    P.title, 
    R.worker_id, 
    P.id,
    A.network,
    FE.token
FROM runs R
INNER JOIN funding_entries FE ON R.id = FE.run_id
INNER JOIN projects P ON FE.project_id = P.id
INNER JOIN (
    SELECT
        applications.*,
        ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at DESC) as rn
    FROM applications
) A ON P.id = A.project_id
WHERE A.rn = 1;
