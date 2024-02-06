drop policy "anon_funding_entries_table_select_policy" on "public"."funding_entries";

create policy "Everyone can see funding entries"
on "public"."funding_entries"
as permissive
for select
to public
using (true);

