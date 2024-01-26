
create type "public"."step_name" as enum ('FETCH_PROJECTS', 'EVALUATE_PROJECTS', 'ANALYZE_FUNDING', 'SYNTHESIZE_RESULTS');

create type "public"."step_status" as enum ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ERRORED');

alter table "public"."logs" drop column "message";

alter table "public"."logs" add column "ended_at" timestamp with time zone;

alter table "public"."logs" add column "status" step_status not null;

alter table "public"."logs" add column "step_name" step_name not null;

alter table "public"."logs" add column "value" text;