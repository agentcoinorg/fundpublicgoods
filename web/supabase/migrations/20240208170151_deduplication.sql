alter table "public"."applications" drop constraint "applications_project_id_fkey";

alter table "public"."funding_entries" drop constraint "funding_entries_project_id_fkey";

alter table "public"."strategy_entries" drop constraint "strategy_entries_project_id_fkey";

drop view if exists "public"."funding_entries_view";

alter table "public"."applications" add column "gitcoin_project_id" text not null;
alter table "public"."applications" alter column "project_id" set data type uuid using "project_id"::uuid;

alter table "public"."projects" add column "gitcoin_id" text not null;
alter table "public"."projects" alter column "id" set data type uuid using "id"::uuid;
alter table "public"."projects" alter column "id" set default gen_random_uuid();

alter table "public"."strategy_entries" alter column "project_id" set data type uuid using "project_id"::uuid;

alter table "public"."funding_entries" alter column "project_id" set data type uuid using "project_id"::uuid;

alter table "public"."applications" add constraint "applications_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;
alter table "public"."applications" validate constraint "applications_project_id_fkey";

alter table "public"."funding_entries" add constraint "funding_entries_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;
alter table "public"."funding_entries" validate constraint "funding_entries_project_id_fkey";

alter table "public"."strategy_entries" add constraint "strategy_entries_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;
alter table "public"."strategy_entries" validate constraint "strategy_entries_project_id_fkey";