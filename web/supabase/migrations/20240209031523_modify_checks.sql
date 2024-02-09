ALTER TABLE "public"."strategy_entries" DROP CONSTRAINT "strategy_entries_impact_check";
ALTER TABLE "public"."strategy_entries" ADD CONSTRAINT "strategy_entries_impact_check" CHECK ("impact" >= 0.00 AND "impact" <= 1.00) not valid;
ALTER TABLE "public"."strategy_entries" validate CONSTRAINT "strategy_entries_impact_check";

ALTER TABLE "public"."strategy_entries" DROP CONSTRAINT "strategy_entries_interest_check";
ALTER TABLE "public"."strategy_entries" ADD CONSTRAINT "strategy_entries_interest_check" CHECK ("interest" >= 0.00 AND "interest" <= 1.00) not valid;
ALTER TABLE "public"."strategy_entries" validate CONSTRAINT "strategy_entries_interest_check";

ALTER TABLE "public"."strategy_entries" DROP CONSTRAINT "strategy_entries_weight_check";
ALTER TABLE "public"."strategy_entries" ADD CONSTRAINT "strategy_entries_weight_check" CHECK ("weight" >= 0.00 AND "weight" <= 1.00) not valid;
ALTER TABLE "public"."strategy_entries" validate CONSTRAINT "strategy_entries_weight_check";

ALTER TABLE "public"."strategy_entries" DROP CONSTRAINT "strategy_entries_funding_needed_check";
ALTER TABLE "public"."strategy_entries" ADD CONSTRAINT "strategy_entries_funding_needed_check" CHECK ("funding_needed" >= 0.00 AND "funding_needed" <= 1.00) not valid;
ALTER TABLE "public"."strategy_entries" validate CONSTRAINT "strategy_entries_funding_needed_check";

ALTER TABLE "public"."strategy_entries" DROP CONSTRAINT "strategy_entries_smart_ranking_check";
ALTER TABLE "public"."strategy_entries" ADD CONSTRAINT "strategy_entries_smart_ranking_check" CHECK ("smart_ranking" >= 0.00 AND "smart_ranking" <= 1.00) not valid;
ALTER TABLE "public"."strategy_entries" validate CONSTRAINT "strategy_entries_smart_ranking_check";
