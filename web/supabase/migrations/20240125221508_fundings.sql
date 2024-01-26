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
    "public"."runs" enable ROW LEVEL SECURITY;

CREATE policy "anon_funding_entries_table_select_policy" ON "public"."funding_entries" FOR
SELECT
    TO anon USING (TRUE);