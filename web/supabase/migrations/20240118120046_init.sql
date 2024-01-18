CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TABLE "public"."workers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp WITH time zone NOT NULL DEFAULT NOW(),
    "prompt" text NOT NULL,
    PRIMARY KEY ("id")
);

ALTER TABLE
    "public"."workers" enable ROW LEVEL SECURITY;

CREATE TABLE "public"."logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "worker_id" uuid NOT NULL,
    "status" text NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE CASCADE
);

ALTER TABLE
    "public"."logs" enable ROW LEVEL SECURITY;

ALTER publication supabase_realtime
ADD
    TABLE "public"."logs";

CREATE policy "anon_logs_table_select_policy" ON "public"."logs" FOR
SELECT
    TO anon USING (TRUE);

CREATE TABLE "public"."strategies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "worker_id" uuid NOT NULL,
    "project_id" VARCHAR(255) NOT NULL,
    "evaluation_reasoning" TEXT,
    "evaluation_impact" DECIMAL(3, 2),
    "evaluation_interest" DECIMAL(3, 2),
    "weight" DECIMAL(3, 2),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE CASCADE
)

CREATE TABLE "public"."projects" (
    "id" VARCHAR(255) NOT NULL,
    "title" TEXT,
    "recipient" VARCHAR(255),
    "description" TEXT,
    "website" VARCHAR(255),
    "answers" TEXT,  -- JSON [{ "question": "...", "answer": "..." }]
    PRIMARY KEY ("id")
)
