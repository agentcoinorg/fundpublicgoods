DELETE FROM "indexing"."gitcoin_indexing_jobs" WHERE "network_id" = 424;
DELETE FROM "indexing"."gitcoin_applications" WHERE "network" = 424;
DELETE FROM "public"."applications" WHERE network = 424;