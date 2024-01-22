create table "public"."gitcoin_projects" (
    "id" text not null,
    "created_at" timestamp with time zone not null default now(),
    "data" json not null,
    "protocol" int not null,
    "pointer" text not null,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."gitcoin_projects" OWNER TO "postgres";
ALTER TABLE "public"."gitcoin_projects" enable row level security;

create table "public"."gitcoin_applications" (
    "id" text not null,
    "created_at" timestamp with time zone not null default now(),
    "data" json not null,
    "protocol" int not null,
    "pointer" text not null,
    "round_id" text not null,
    "project_id" text not null,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "public"."gitcoin_projects"("id") ON DELETE CASCADE
);
ALTER TABLE "public"."gitcoin_applications" OWNER TO "postgres";
ALTER TABLE "public"."gitcoin_applications" enable row level security;

create table "public"."gitcoin_indexing_jobs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "url" text not null,
    "is_running" boolean not null default false,
    "skip_rounds" int not null default 0,
    "skip_projects" int not null default 0,
    "last_updated_at" timestamp with time zone not null default now(),
    "is_failed" boolean not null default false,
    "error" text null,
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."gitcoin_indexing_jobs" OWNER TO "postgres";
ALTER TABLE "public"."gitcoin_indexing_jobs" enable row level security;

insert into "public"."gitcoin_indexing_jobs" ("url") values 
    ('https://api.thegraph.com/subgraphs/name/allo-protocol/grants-round-polygon'), 
    ('https://api.thegraph.com/subgraphs/name/vacekj/allo-mainnet'),
    ('https://graph-gitcoin-mainnet.hirenodes.io/subgraphs/name/gitcoin/allo'),
    ('https://api.thegraph.com/subgraphs/name/gitcoinco/gitcoin-grants-arbitrum-one'),
    ('https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-optimism-mainnet'),
    ('https://api.studio.thegraph.com/query/45391/grants-round-base/v0.0.1'),
    ('https://api.studio.thegraph.com/query/45391/grants-round-zkera/v0.0.2'),
    ('https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-avalanche-mainnet'),
    ('https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-fantom-mainnet'),
    ('https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-optimism-mainnet');
