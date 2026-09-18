-- ==============================================================================
-- Agri-Sovereign / Uzhavan-Sahayak — Initial Production Database Schema
-- Version: 20260917000001
-- PostgreSQL + Supabase Auth + Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table (Tied 1-to-1 to auth.users)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    full_name text,
    avatar_url text,
    role text not null default 'farmer' check (role in ('farmer', 'agronomist', 'admin')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 2. Farmers Table (Domain Agronomic Identity)
-- ------------------------------------------------------------------------------
create table if not exists public.farmers (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid references public.profiles(id) on delete set null,
    name text not null,
    phone text,
    district text not null default 'Coimbatore',
    state text not null default 'Tamil Nadu',
    preferred_language text not null default 'ta',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 3. Fields Table (Farmer Land & Soil Characteristics)
-- ------------------------------------------------------------------------------
create table if not exists public.fields (
    id uuid primary key default gen_random_uuid(),
    farmer_id uuid not null references public.farmers(id) on delete cascade,
    name text not null,
    district text not null,
    area_acres numeric(6, 2) not null default 2.5,
    soil_type text not null default 'செம்மண் / Red Loam',
    soil_ph numeric(3, 1) not null default 6.8,
    irrigation_source text not null default 'சொட்டு நீர்ப் பாசனம் / Drip Irrigation',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 4. Crops Table (Active & Historical Crops per Field)
-- ------------------------------------------------------------------------------
create table if not exists public.crops (
    id uuid primary key default gen_random_uuid(),
    farmer_id uuid not null references public.farmers(id) on delete cascade,
    field_id uuid references public.fields(id) on delete set null,
    crop_name text not null,
    variety text,
    sowing_date date,
    stage text not null default 'வளர்ச்சிப் பருவம் / Vegetative',
    health_status text not null default 'good' check (health_status in ('good', 'stressed', 'diseased', 'pest_attack', 'recovered')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 5. WhatsApp Contacts Table (Authorized JID / LID Transport Identities)
-- ------------------------------------------------------------------------------
create table if not exists public.whatsapp_contacts (
    id uuid primary key default gen_random_uuid(),
    farmer_id uuid not null references public.farmers(id) on delete cascade,
    jid text not null unique,
    lid text,
    display_name text,
    is_authorized boolean not null default false,
    authorized_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 6. Conversation Sessions Table (Session-Scoped Agricultural Context)
-- ------------------------------------------------------------------------------
create table if not exists public.conversation_sessions (
    id uuid primary key default gen_random_uuid(),
    farmer_id uuid not null references public.farmers(id) on delete cascade,
    field_id uuid references public.fields(id) on delete set null,
    crop_id uuid references public.crops(id) on delete set null,
    topic text not null default 'General Agronomic Advisory',
    status text not null default 'active' check (status in ('active', 'resolved', 'closed')),
    channel text not null default 'web' check (channel in ('web', 'whatsapp', 'voice')),
    started_at timestamptz not null default now(),
    last_activity_at timestamptz not null default now(),
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 7. Messages Table (Persistent Agronomic Dialogue & Multi-modal Metadata)
-- ------------------------------------------------------------------------------
create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references public.conversation_sessions(id) on delete cascade,
    farmer_id uuid not null references public.farmers(id) on delete cascade,
    role text not null check (role in ('farmer', 'assistant', 'system')),
    text text not null,
    audio_metadata jsonb,
    image_metadata jsonb,
    safety_metadata jsonb,
    telemetry jsonb,
    created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 8. Field Observations Table (Non-Definitive Visual & Symptom Analysis)
-- ------------------------------------------------------------------------------
create table if not exists public.field_observations (
    id uuid primary key default gen_random_uuid(),
    farmer_id uuid not null references public.farmers(id) on delete cascade,
    field_id uuid references public.fields(id) on delete set null,
    crop_id uuid references public.crops(id) on delete set null,
    session_id uuid references public.conversation_sessions(id) on delete set null,
    observation_type text not null default 'leaf_symptom',
    visual_observations jsonb not null default '[]'::jsonb,
    symptoms jsonb not null default '[]'::jsonb,
    visual_confidence numeric(4, 3),
    assessment text,
    possible_causes jsonb not null default '[]'::jsonb,
    recommended_action text,
    image_url text,
    created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- Performance Indexes
-- ------------------------------------------------------------------------------
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_farmers_profile_id on public.farmers(profile_id);
create index if not exists idx_fields_farmer_id on public.fields(farmer_id);
create index if not exists idx_crops_farmer_id on public.crops(farmer_id);
create index if not exists idx_crops_field_id on public.crops(field_id);
create index if not exists idx_whatsapp_contacts_jid on public.whatsapp_contacts(jid);
create index if not exists idx_whatsapp_contacts_farmer_id on public.whatsapp_contacts(farmer_id);
create index if not exists idx_conversation_sessions_farmer_id on public.conversation_sessions(farmer_id);
create index if not exists idx_conversation_sessions_last_activity on public.conversation_sessions(last_activity_at desc);
create index if not exists idx_messages_session_id on public.messages(session_id);
create index if not exists idx_messages_created_at on public.messages(created_at desc);
create index if not exists idx_field_observations_farmer_id on public.field_observations(farmer_id);
create index if not exists idx_field_observations_session_id on public.field_observations(session_id);

-- ------------------------------------------------------------------------------
-- Automated Updated_at Triggers
-- ------------------------------------------------------------------------------
create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create or replace trigger trg_profiles_updated_at
    before update on public.profiles
    for each row execute function public.set_current_timestamp_updated_at();

create or replace trigger trg_farmers_updated_at
    before update on public.farmers
    for each row execute function public.set_current_timestamp_updated_at();

create or replace trigger trg_fields_updated_at
    before update on public.fields
    for each row execute function public.set_current_timestamp_updated_at();

create or replace trigger trg_crops_updated_at
    before update on public.crops
    for each row execute function public.set_current_timestamp_updated_at();

create or replace trigger trg_whatsapp_contacts_updated_at
    before update on public.whatsapp_contacts
    for each row execute function public.set_current_timestamp_updated_at();

create or replace trigger trg_conversation_sessions_updated_at
    before update on public.conversation_sessions
    for each row execute function public.set_current_timestamp_updated_at();

-- ------------------------------------------------------------------------------
-- Automated Profile & Default Farmer Creation on Signup
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
declare
    v_full_name text;
    v_farmer_id uuid;
    v_field_id uuid;
begin
    v_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'விவசாயி');

    -- 1. Create Profile
    insert into public.profiles (id, email, full_name, avatar_url, role)
    values (new.id, new.email, v_full_name, new.raw_user_meta_data->>'avatar_url', 'farmer')
    on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name);

    -- 2. Create Default Farmer Record if none exists
    insert into public.farmers (profile_id, name, district, state, preferred_language)
    values (new.id, v_full_name, 'Coimbatore', 'Tamil Nadu', 'ta')
    returning id into v_farmer_id;

    -- 3. Create Default Starter Field
    insert into public.fields (farmer_id, name, district, area_acres, soil_type, soil_ph, irrigation_source)
    values (v_farmer_id, 'முதன்மை தோட்டம் (Main Field)', 'Coimbatore', 3.0, 'செம்மண் (Red Loam)', 6.8, 'சொட்டு நீர்ப்பாசனம் (Drip)')
    returning id into v_field_id;

    -- 4. Create Default Starter Crop
    insert into public.crops (farmer_id, field_id, crop_name, variety, stage, health_status)
    values (v_farmer_id, v_field_id, 'மக்காச்சோளம் (Maize)', 'CO 6', 'வளர்ச்சிப் பருவம் (Vegetative)', 'good');

    return new;
end;
$$ language plpgsql security definer;

-- Trigger firing on new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.farmers enable row level security;
alter table public.fields enable row level security;
alter table public.crops enable row level security;
alter table public.whatsapp_contacts enable row level security;
alter table public.conversation_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.field_observations enable row level security;

-- Helper function: Check if current auth.uid() owns the farmer record
create or replace function public.is_farmer_owner(f_id uuid)
returns boolean as $$
begin
    return exists (
        select 1 from public.farmers
        where id = f_id and profile_id = auth.uid()
    );
end;
$$ language plpgsql security definer;

-- 1. Profiles Policies
create policy "Users can view own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- 2. Farmers Policies
create policy "Users can view own farmer records"
    on public.farmers for select
    using (profile_id = auth.uid());

create policy "Users can insert own farmer records"
    on public.farmers for insert
    with check (profile_id = auth.uid());

create policy "Users can update own farmer records"
    on public.farmers for update
    using (profile_id = auth.uid());

-- 3. Fields Policies
create policy "Farmers can view own fields"
    on public.fields for select
    using (public.is_farmer_owner(farmer_id));

create policy "Farmers can insert own fields"
    on public.fields for insert
    with check (public.is_farmer_owner(farmer_id));

create policy "Farmers can update own fields"
    on public.fields for update
    using (public.is_farmer_owner(farmer_id));

create policy "Farmers can delete own fields"
    on public.fields for delete
    using (public.is_farmer_owner(farmer_id));

-- 4. Crops Policies
create policy "Farmers can view own crops"
    on public.crops for select
    using (public.is_farmer_owner(farmer_id));

create policy "Farmers can insert own crops"
    on public.crops for insert
    with check (public.is_farmer_owner(farmer_id));

create policy "Farmers can update own crops"
    on public.crops for update
    using (public.is_farmer_owner(farmer_id));

create policy "Farmers can delete own crops"
    on public.crops for delete
    using (public.is_farmer_owner(farmer_id));

-- 5. WhatsApp Contacts Policies
create policy "Farmers can view own whatsapp contacts"
    on public.whatsapp_contacts for select
    using (public.is_farmer_owner(farmer_id));

create policy "Farmers can insert own whatsapp contacts"
    on public.whatsapp_contacts for insert
    with check (public.is_farmer_owner(farmer_id));

create policy "Farmers can update own whatsapp contacts"
    on public.whatsapp_contacts for update
    using (public.is_farmer_owner(farmer_id));

-- 6. Conversation Sessions Policies
create policy "Farmers can view own conversation sessions"
    on public.conversation_sessions for select
    using (public.is_farmer_owner(farmer_id));

create policy "Farmers can insert own conversation sessions"
    on public.conversation_sessions for insert
    with check (public.is_farmer_owner(farmer_id));

create policy "Farmers can update own conversation sessions"
    on public.conversation_sessions for update
    using (public.is_farmer_owner(farmer_id));

-- 7. Messages Policies
create policy "Farmers can view own messages"
    on public.messages for select
    using (public.is_farmer_owner(farmer_id));

create policy "Farmers can insert own messages"
    on public.messages for insert
    with check (public.is_farmer_owner(farmer_id));

-- 8. Field Observations Policies
create policy "Farmers can view own field observations"
    on public.field_observations for select
    using (public.is_farmer_owner(farmer_id));

create policy "Farmers can insert own field observations"
    on public.field_observations for insert
    with check (public.is_farmer_owner(farmer_id));

create policy "Farmers can update own field observations"
    on public.field_observations for update
    using (public.is_farmer_owner(farmer_id));
