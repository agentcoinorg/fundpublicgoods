alter table "public"."applications" drop constraint "applications_project_id_fkey";

alter table "public"."funding_entries" drop constraint "funding_entries_project_id_fkey";

alter table "public"."strategy_entries" drop constraint "strategy_entries_project_id_fkey";

drop view if exists "public"."funding_entries_view";

create table "public"."recipients" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid not null,
    "address" text not null,
    "chain" bigint not null,
    "timestamp" timestamp with time zone not null
);


alter table "public"."recipients" enable row level security;

alter table "public"."applications" add column "gitcoin_project_id" text not null;
alter table "public"."applications" alter column "project_id" set data type uuid using "project_id"::uuid;

alter table "public"."projects" add column "gitcoin_id" text not null;
alter table "public"."projects" alter column "id" set data type uuid using "id"::uuid;

alter table "public"."strategy_entries" alter column "project_id" set data type uuid using "project_id"::uuid;

CREATE UNIQUE INDEX recipients_pkey ON public.recipients USING btree (id);

alter table "public"."recipients" add constraint "recipients_pkey" PRIMARY KEY using index "recipients_pkey";

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

alter table "public"."funding_entries" alter column "project_id" set data type uuid using "project_id"::uuid;

alter table "public"."applications" add constraint "applications_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;
alter table "public"."applications" validate constraint "applications_project_id_fkey";

alter table "public"."funding_entries" add constraint "funding_entries_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;
alter table "public"."funding_entries" validate constraint "funding_entries_project_id_fkey";

alter table "public"."recipients" add constraint "recipients_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;
alter table "public"."recipients" validate constraint "recipients_project_id_fkey";

alter table "public"."strategy_entries" add constraint "strategy_entries_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;
alter table "public"."strategy_entries" validate constraint "strategy_entries_project_id_fkey";