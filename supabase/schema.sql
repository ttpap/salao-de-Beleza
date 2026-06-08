-- Extensoes
create extension if not exists "uuid-ossp";

-- Enum status
create type appointment_status as enum (
  'agendado',
  'confirmado',
  'em_atendimento',
  'concluido',
  'cancelado'
);

-- Profissionais
create table professionals (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  name text not null,
  phone text not null,
  email text not null,
  specialties text[] default '{}',
  commission_pct numeric(5,2) not null default 50.00,
  is_active boolean default true,
  work_schedule jsonb not null default '{
    "seg": {"active": true, "start": "09:00", "end": "18:00"},
    "ter": {"active": true, "start": "09:00", "end": "18:00"},
    "qua": {"active": true, "start": "09:00", "end": "18:00"},
    "qui": {"active": true, "start": "09:00", "end": "18:00"},
    "sex": {"active": true, "start": "09:00", "end": "18:00"},
    "sab": {"active": true, "start": "09:00", "end": "13:00"},
    "dom": {"active": false, "start": "09:00", "end": "18:00"}
  }'::jsonb,
  google_calendar_id text,
  google_refresh_token text
);

-- Clientes
create table clients (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  name text not null,
  phone text not null,
  email text,
  notes text
);

-- Servicos
create table services (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  name text not null,
  duration_min integer not null default 30,
  price numeric(10,2) not null,
  is_active boolean default true
);

-- Agendamentos
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  client_id uuid not null references clients(id),
  professional_id uuid not null references professionals(id),
  service_id uuid not null references services(id),
  date date not null,
  start_time time not null,
  end_time time not null,
  status appointment_status default 'agendado',
  notes text,
  price numeric(10,2) not null,
  google_event_id text
);

-- Indices
create index idx_appointments_date on appointments(date);
create index idx_appointments_professional on appointments(professional_id, date);
create index idx_appointments_client on appointments(client_id);
create index idx_appointments_status on appointments(status);

-- RLS (desabilitado por enquanto - gestor tem acesso total)
alter table professionals enable row level security;
alter table clients enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;

-- Politicas permissivas (ajustar quando auth implementado)
create policy "allow_all" on professionals for all using (true) with check (true);
create policy "allow_all" on clients for all using (true) with check (true);
create policy "allow_all" on services for all using (true) with check (true);
create policy "allow_all" on appointments for all using (true) with check (true);
