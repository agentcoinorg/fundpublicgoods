create policy "Everyone can see all applications"
on "public"."applications"
as permissive
for select
to public
using (true);