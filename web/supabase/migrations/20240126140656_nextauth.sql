--
-- Name: next_auth; Type: SCHEMA;
--
CREATE SCHEMA next_auth;

GRANT USAGE ON SCHEMA next_auth TO service_role;
GRANT ALL ON SCHEMA next_auth TO postgres;

--
-- Create users table
--
CREATE TABLE IF NOT EXISTS next_auth.users
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text,
    email text,
    "emailVerified" timestamp with time zone,
    image text,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT email_unique UNIQUE (email)
);

GRANT ALL ON TABLE next_auth.users TO postgres;
GRANT ALL ON TABLE next_auth.users TO service_role;

--- uid() function to be used in RLS policies
CREATE FUNCTION next_auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select
  	coalesce(
		nullif(current_setting('request.jwt.claim.sub', true), ''),
		(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
	)::uuid
$$;

--
-- Create sessions table
--
CREATE TABLE IF NOT EXISTS  next_auth.sessions
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    expires timestamp with time zone NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" uuid,
    CONSTRAINT sessions_pkey PRIMARY KEY (id),
    CONSTRAINT sessionToken_unique UNIQUE ("sessionToken"),
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES  next_auth.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

GRANT ALL ON TABLE next_auth.sessions TO postgres;
GRANT ALL ON TABLE next_auth.sessions TO service_role;

--
-- Create accounts table
--
CREATE TABLE IF NOT EXISTS  next_auth.accounts
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at bigint,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    oauth_token_secret text,
    oauth_token text,
    "userId" uuid,
    CONSTRAINT accounts_pkey PRIMARY KEY (id),
    CONSTRAINT provider_unique UNIQUE (provider, "providerAccountId"),
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES  next_auth.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

GRANT ALL ON TABLE next_auth.accounts TO postgres;
GRANT ALL ON TABLE next_auth.accounts TO service_role;

--
-- Create verification_tokens table
--
CREATE TABLE IF NOT EXISTS  next_auth.verification_tokens
(
    identifier text,
    token text,
    expires timestamp with time zone NOT NULL,
    CONSTRAINT verification_tokens_pkey PRIMARY KEY (token),
    CONSTRAINT token_unique UNIQUE (token),
    CONSTRAINT token_identifier_unique UNIQUE (token, identifier)
);

GRANT ALL ON TABLE next_auth.verification_tokens TO postgres;
GRANT ALL ON TABLE next_auth.verification_tokens TO service_role;

create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "address" text,
    "is_anon" boolean not null
);

alter table "public"."users" enable row level security;
alter table "public"."users" OWNER TO "postgres";
alter table "public"."workers" add column "user_id" uuid DEFAULT auth.uid()not null;

CREATE UNIQUE INDEX users_address_key ON public.users USING btree (address);
CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";
alter table "public"."users" add constraint "users_address_key" UNIQUE using index "users_address_key";

alter table "public"."workers" add constraint "workers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;
alter table "public"."workers" validate constraint "workers_user_id_fkey";

-- Drop old anon-only policies --
drop policy "anon_logs_table_select_policy" on "public"."logs";
drop policy "anon_projects_table_select_policy" on "public"."projects";
drop policy "anon_runs_table_select_policy" on "public"."runs";
drop policy "anon_strategy_entries_table_select_policy" on "public"."strategy_entries";

create policy "Everyone can see all logs"
on "public"."logs"
as permissive
for select
to public
using (true);


create policy "Everyone can see all projects"
on "public"."projects"
as permissive
for select
to public
using (true);


create policy "Everyone can see all runs"
on "public"."runs"
as permissive
for select
to public
using (true);


create policy "Users can only insert their own runs"
on "public"."runs"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM workers
  WHERE ((workers.id = runs.worker_id) AND (workers.user_id = auth.uid())))));


create policy "Everyone can see strategy entries"
on "public"."strategy_entries"
as permissive
for select
to public
using (true);


create policy "Users can only see and manage their own data"
on "public"."users"
as permissive
for all
to public
using ((auth.uid() = id))
with check ((auth.uid() = id));


create policy "Everyone can see all workers"
on "public"."workers"
as permissive
for select
to public
using (true);


create policy "Users can only insert workers of their own"
on "public"."workers"
as permissive
for insert
to public
with check ((auth.uid() = user_id));