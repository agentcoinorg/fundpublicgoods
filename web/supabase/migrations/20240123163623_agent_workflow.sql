create table "public"."applications" (
    "id" text not null,
    "created_at" int not null,
    "recipient" text not null,
    "network" int not null,
    "round" text not null,
    "answers" json,
    "project_id" text not null,
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id"),
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."applications" OWNER TO "postgres";
ALTER TABLE "public"."applications" enable row level security;
