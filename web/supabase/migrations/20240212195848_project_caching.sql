alter table "public"."projects" add column "description_short" text;

alter table "public"."projects" add column "funding_needed" numeric;

alter table "public"."projects" add column "impact" numeric;

alter table "public"."projects" add constraint "projects_funding_needed_check" CHECK (((funding_needed >= 0.00) AND (funding_needed <= 1.00))) not valid;

alter table "public"."projects" validate constraint "projects_funding_needed_check";

alter table "public"."projects" add constraint "projects_impact_check" CHECK (((impact >= 0.00) AND (impact <= 1.00))) not valid;

alter table "public"."projects" validate constraint "projects_impact_check";