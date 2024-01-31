drop policy "Users can only insert their own runs" on "public"."runs";
drop policy "Everyone can see all workers" on "public"."workers";
drop policy "Users can only insert workers of their own" on "public"."workers";

alter table "public"."runs" drop constraint "runs_worker_id_fkey";
alter table "public"."workers" drop constraint "workers_user_id_fkey";

alter table "public"."workers" drop constraint "workers_pkey";

drop index if exists "public"."workers_pkey";
drop table "public"."workers";

alter table "public"."runs" drop column "worker_id";
alter table "public"."runs" add column "user_id" uuid not null;
alter table "public"."runs" add constraint "runs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;
alter table "public"."runs" validate constraint "runs_user_id_fkey";
alter table "public"."runs" alter column "user_id" set default auth.uid();

create policy "Users can only insert runs of their own"
on "public"."runs"
as permissive
for insert
to public
with check ((auth.uid() = user_id));