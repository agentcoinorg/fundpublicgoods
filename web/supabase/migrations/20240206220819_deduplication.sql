alter table "public"."strategy_entries" drop constraint "strategy_entries_smart_ranking_check";

drop view if exists "public"."funding_entries_view";

create table "public"."descriptions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "text" text not null,
    "project_id" text not null
);


alter table "public"."descriptions" enable row level security;

create table "public"."recipients" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "chain_id" bigint not null,
    "address" text not null,
    "project_id" text not null
);


alter table "public"."recipients" enable row level security;

create table "public"."websites" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "url" text not null,
    "project_id" text not null
);


alter table "public"."websites" enable row level security;

alter table "public"."applications" add column "description" text not null;

alter table "public"."applications" add column "logo" text;

alter table "public"."applications" add column "title" text not null;

alter table "public"."applications" add column "twitter" text;

alter table "public"."applications" add column "website" text;

alter table "public"."projects" drop column "description";

alter table "public"."projects" drop column "logo";

alter table "public"."projects" drop column "title";

alter table "public"."projects" drop column "twitter";

alter table "public"."projects" drop column "website";

CREATE UNIQUE INDEX descriptions_pkey ON public.descriptions USING btree (id);

CREATE UNIQUE INDEX recipients_pkey ON public.recipients USING btree (id);

CREATE UNIQUE INDEX websites_pkey ON public.websites USING btree (id);

alter table "public"."descriptions" add constraint "descriptions_pkey" PRIMARY KEY using index "descriptions_pkey";

alter table "public"."recipients" add constraint "recipients_pkey" PRIMARY KEY using index "recipients_pkey";

alter table "public"."websites" add constraint "websites_pkey" PRIMARY KEY using index "websites_pkey";

alter table "public"."descriptions" add constraint "descriptions_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;

alter table "public"."descriptions" validate constraint "descriptions_project_id_fkey";

alter table "public"."recipients" add constraint "recipients_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;

alter table "public"."recipients" validate constraint "recipients_project_id_fkey";

alter table "public"."websites" add constraint "websites_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;

alter table "public"."websites" validate constraint "websites_project_id_fkey";

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

grant delete on table "public"."descriptions" to "anon";

grant insert on table "public"."descriptions" to "anon";

grant references on table "public"."descriptions" to "anon";

grant select on table "public"."descriptions" to "anon";

grant trigger on table "public"."descriptions" to "anon";

grant truncate on table "public"."descriptions" to "anon";

grant update on table "public"."descriptions" to "anon";

grant delete on table "public"."descriptions" to "authenticated";

grant insert on table "public"."descriptions" to "authenticated";

grant references on table "public"."descriptions" to "authenticated";

grant select on table "public"."descriptions" to "authenticated";

grant trigger on table "public"."descriptions" to "authenticated";

grant truncate on table "public"."descriptions" to "authenticated";

grant update on table "public"."descriptions" to "authenticated";

grant delete on table "public"."descriptions" to "service_role";

grant insert on table "public"."descriptions" to "service_role";

grant references on table "public"."descriptions" to "service_role";

grant select on table "public"."descriptions" to "service_role";

grant trigger on table "public"."descriptions" to "service_role";

grant truncate on table "public"."descriptions" to "service_role";

grant update on table "public"."descriptions" to "service_role";

grant delete on table "public"."recipients" to "anon";

grant insert on table "public"."recipients" to "anon";

grant references on table "public"."recipients" to "anon";

grant select on table "public"."recipients" to "anon";

grant trigger on table "public"."recipients" to "anon";

grant truncate on table "public"."recipients" to "anon";

grant update on table "public"."recipients" to "anon";

grant delete on table "public"."recipients" to "authenticated";

grant insert on table "public"."recipients" to "authenticated";

grant references on table "public"."recipients" to "authenticated";

grant select on table "public"."recipients" to "authenticated";

grant trigger on table "public"."recipients" to "authenticated";

grant truncate on table "public"."recipients" to "authenticated";

grant update on table "public"."recipients" to "authenticated";

grant delete on table "public"."recipients" to "service_role";

grant insert on table "public"."recipients" to "service_role";

grant references on table "public"."recipients" to "service_role";

grant select on table "public"."recipients" to "service_role";

grant trigger on table "public"."recipients" to "service_role";

grant truncate on table "public"."recipients" to "service_role";

grant update on table "public"."recipients" to "service_role";

grant delete on table "public"."websites" to "anon";

grant insert on table "public"."websites" to "anon";

grant references on table "public"."websites" to "anon";

grant select on table "public"."websites" to "anon";

grant trigger on table "public"."websites" to "anon";

grant truncate on table "public"."websites" to "anon";

grant update on table "public"."websites" to "anon";

grant delete on table "public"."websites" to "authenticated";

grant insert on table "public"."websites" to "authenticated";

grant references on table "public"."websites" to "authenticated";

grant select on table "public"."websites" to "authenticated";

grant trigger on table "public"."websites" to "authenticated";

grant truncate on table "public"."websites" to "authenticated";

grant update on table "public"."websites" to "authenticated";

grant delete on table "public"."websites" to "service_role";

grant insert on table "public"."websites" to "service_role";

grant references on table "public"."websites" to "service_role";

grant select on table "public"."websites" to "service_role";

grant trigger on table "public"."websites" to "service_role";

grant truncate on table "public"."websites" to "service_role";

grant update on table "public"."websites" to "service_role";

alter table "public"."projects" drop column "updated_at";