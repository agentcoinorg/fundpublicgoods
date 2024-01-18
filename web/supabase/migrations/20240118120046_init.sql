CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TABLE "public"."workers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp WITH time zone NOT NULL DEFAULT NOW(),
    "prompt" text NOT NULL,
    PRIMARY KEY ("id"),
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