create table "indexing"."gitcoin_egress_jobs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "is_running" boolean not null default false,
    "skip_applications" int not null default 0,
    "last_updated_at" timestamp with time zone not null default now(),
    "is_failed" boolean not null default false,
    "error" text null,
    PRIMARY KEY ("id")
);
alter table "indexing"."gitcoin_egress_jobs" OWNER TO "postgres";
alter table "indexing"."gitcoin_egress_jobs" enable row level security;

insert into "indexing"."gitcoin_egress_jobs" default values;

update "indexing"."gitcoin_indexing_jobs" 
    set "is_running" = false, 
        "last_updated_at" = now(), 
        "is_failed" = false, 
        "error" = null ,
        "skip_rounds" = 0,
        "skip_projects" = 0;

delete from "indexing"."gitcoin_applications";
delete from "indexing"."gitcoin_projects";

alter table "indexing"."gitcoin_applications" 
    add column "network" int not null;