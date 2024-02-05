alter table "public"."strategy_entries" add column "funding_needed" numeric;
alter table "public"."strategy_entries" add column "report" text;
alter table "public"."strategy_entries" add constraint "strategy_entries_funding_needed_check" CHECK (((funding_needed >= 0.01) AND (funding_needed <= 1.00))) not valid;
alter table "public"."strategy_entries" validate constraint "strategy_entries_funding_needed_check";
alter table "public"."strategy_entries" add column "smart_ranking" numeric;
alter table "public"."strategy_entries" add constraint "strategy_entries_smart_ranking_check" CHECK (((smart_ranking >= 0.01) AND (smart_ranking <= 1.00))) not valid;
alter table "public"."strategy_entries" validate constraint "strategy_entries_smart_ranking_check";