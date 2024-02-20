CREATE VIEW unique_categories_views AS SELECT DISTINCT unnest(categories) AS category
FROM "public"."projects";