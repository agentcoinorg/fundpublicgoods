CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TABLE "public"."workers" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp WITH time zone NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("id")
);

ALTER TABLE
    "public"."workers" enable ROW LEVEL SECURITY;

CREATE TABLE "public"."runs" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "worker_id" uuid NOT NULL,
    "created_at" timestamp WITH time zone NOT NULL DEFAULT NOW(),
    "prompt" text NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE CASCADE
);

ALTER TABLE
    "public"."runs" enable ROW LEVEL SECURITY;

CREATE policy "anon_runs_table_select_policy" ON "public"."runs" FOR
SELECT
    TO anon USING (TRUE);

CREATE TABLE "public"."logs" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "run_id" uuid NOT NULL,
    "created_at" timestamp WITH time zone NOT NULL DEFAULT NOW(),
    "message" text NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE CASCADE
);

ALTER TABLE
    "public"."logs" enable ROW LEVEL SECURITY;

ALTER publication supabase_realtime
ADD
    TABLE "public"."logs";

CREATE policy "anon_logs_table_select_policy" ON "public"."logs" FOR
SELECT
    TO anon USING (TRUE);

CREATE TABLE "public"."projects" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "title" TEXT,
    "recipient" TEXT,
    "description" TEXT,
    "website" TEXT,
    PRIMARY KEY ("id")
);

ALTER TABLE
    "public"."projects" enable ROW LEVEL SECURITY;

CREATE policy "anon_projects_table_select_policy" ON "public"."projects" FOR
SELECT
    TO anon USING (TRUE);

CREATE TABLE "public"."strategy_entries" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "run_id" uuid NOT NULL,
    "project_id" uuid NOT NULL,
    "created_at" timestamp WITH time zone NOT NULL DEFAULT NOW(),
    "reasoning" TEXT,
    "impact" NUMERIC(3, 2) CHECK ("impact" >= 0.01 AND "impact" <= 1.00),
    "interest" NUMERIC(3, 2) CHECK ("interest" >= 0.01 AND "interest" <= 1.00),
    "weight" NUMERIC(3, 2) CHECK ("weight" >= 0.01 AND "weight" <= 1.00),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE CASCADE,
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id")
);

ALTER TABLE
    "public"."strategy_entries" enable ROW LEVEL SECURITY;

CREATE policy "anon_strategy_entries_table_select_policy" ON "public"."strategy_entries" FOR
SELECT
    TO anon USING (TRUE);
