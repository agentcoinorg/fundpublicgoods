alter table "public"."strategy_entries" drop constraint "strategy_entries_smart_ranking_check";

alter table "public"."funding_entries" drop constraint "funding_entries_project_id_fkey";

drop view if exists "public"."funding_entries_view";

alter table "public"."projects" drop column "description";
alter table "public"."projects" drop column "logo";
alter table "public"."projects" drop column "title";
alter table "public"."projects" drop column "twitter";
alter table "public"."projects" drop column "updated_at";
alter table "public"."projects" drop column "website";
alter table "public"."projects" alter column "id" set default gen_random_uuid();

alter table "public"."applications" add column "description" text not null;
alter table "public"."applications" add column "logo" text;
alter table "public"."applications" add column "title" text not null;
alter table "public"."applications" add column "twitter" text;
alter table "public"."applications" add column "website" text;

alter table "public"."funding_entries" add constraint "funding_entries_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;
alter table "public"."funding_entries" validate constraint "funding_entries_project_id_fkey";

alter table "public"."applications" drop constraint "applications_project_id_fkey";
alter table "public"."funding_entries" drop constraint "funding_entries_project_id_fkey";
alter table "public"."strategy_entries" drop constraint "strategy_entries_project_id_fkey";

alter table "public"."projects" alter column "id" set data type uuid using "id"::uuid;
alter table "public"."applications" alter column "project_id" set data type uuid using "project_id"::uuid;
alter table "public"."funding_entries" alter column "project_id" set data type uuid using "project_id"::uuid;
alter table "public"."strategy_entries" alter column "project_id" set data type uuid using "project_id"::uuid;

alter table "public"."applications" add constraint "applications_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;
alter table "public"."applications" validate constraint "applications_project_id_fkey";
alter table "public"."funding_entries" add constraint "funding_entries_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;
alter table "public"."funding_entries" validate constraint "funding_entries_project_id_fkey";
alter table "public"."strategy_entries" add constraint "strategy_entries_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;
alter table "public"."strategy_entries" validate constraint "strategy_entries_project_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.merge_projects(project_ids uuid[])
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_project_id UUID;
BEGIN
    -- Step 1: Insert a new project and capture its ID
    INSERT INTO projects DEFAULT VALUES RETURNING id INTO new_project_id;

    -- Step 2: Update applications to point to the new project
    UPDATE applications
    SET project_id = new_project_id
    WHERE project_id = ANY(project_ids);

    -- Step 3: Delete the original projects
    DELETE FROM projects
    WHERE id = ANY(project_ids);

    -- Return the ID of the newly inserted project
    RETURN new_project_id;
END;
$function$
;
