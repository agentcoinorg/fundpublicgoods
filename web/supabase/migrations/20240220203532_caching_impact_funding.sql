alter table "public"."strategy_entries" drop constraint "strategy_entries_funding_needed_check";

alter table "public"."strategy_entries" drop constraint "strategy_entries_impact_check";

alter table "public"."projects" add column "funding_needed" numeric;

alter table "public"."projects" add column "impact" numeric;

alter table "public"."projects" add column "impact_funding_report" text;

alter table "public"."strategy_entries" drop column "funding_needed";

alter table "public"."strategy_entries" drop column "impact";

alter table "public"."projects" add constraint "projects_funding_needed_check" CHECK (((funding_needed >= 0.00) AND (funding_needed <= 1.00))) not valid;

alter table "public"."projects" validate constraint "projects_funding_needed_check";

alter table "public"."projects" add constraint "projects_impact_check" CHECK (((impact >= 0.00) AND (impact <= 1.00))) not valid;

alter table "public"."projects" validate constraint "projects_impact_check";