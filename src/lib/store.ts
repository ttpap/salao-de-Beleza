import type {
  Professional,
  Client,
  Service,
  Appointment,
  AppointmentWithRelations,
  WorkSchedule,
} from "./database.types";

const defaultSchedule: WorkSchedule = {
  seg: { active: true, start: "09:00", end: "18:00" },
  ter: { active: true, start: "09:00", end: "18:00" },
  qua: { active: true, start: "09:00", end: "18:00" },
  qui: { active: true, start: "09:00", end: "18:00" },
  sex: { active: true, start: "09:00", end: "18:00" },
  sab: { active: true, start: "09:00", end: "13:00" },
  dom: { active: false, start: "09:00", end: "18:00" },
};

const demoProfessionals: Professional[] = [
  {
    id: "p1",
    created_at: new Date().toISOString(),
    name: "Maria Silva",
    phone: "(11) 99999-1111",
    email: "maria@salao.com",
    specialties: ["Corte feminino", "Coloração"],
    commission_pct: 50,
    is_active: true,
    work_schedule: defaultSchedule,
    google_calendar_id: null,
    google_refresh_token: null,
  },
  {
    id: "p2",
    created_at: new Date().toISOString(),
    name: "João Santos",
    phone: "(11) 99999-2222",
    email: "joao@salao.com",
    specialties: ["Corte masculino", "Barba"],
    commission_pct: 45,
    is_active: true,
    work_schedule: defaultSchedule,
    google_calendar_id: null,
    google_refresh_token: null,
  },
  {
    id: "p3",
    created_at: new Date().toISOString(),
    name: "Ana Oliveira",
    phone: "(11) 99999-3333",
    email: "ana@salao.com",
    specialties: ["Escova", "Tratamento capilar", "Coloração"],
    commission_pct: 50,
    is_active: true,
    work_schedule: defaultSchedule,
    google_calendar_id: null,
    google_refresh_token: null,
  },
];

const demoClients: Client[] = [
  {
    id: "c1",
    created_at: new Date().toISOString(),
    name: "Fernanda Costa",
    phone: "(11) 98888-1111",
    email: "fernanda@email.com",
    notes: "Prefere horário pela manhã",
  },
  {
    id: "c2",
    created_at: new Date().toISOString(),
    name: "Carlos Mendes",
    phone: "(11) 98888-2222",
    email: null,
    notes: null,
  },
  {
    id: "c3",
    created_at: new Date().toISOString(),
    name: "Patricia Lima",
    phone: "(11) 98888-3333",
    email: "patricia@email.com",
    notes: "Alergia a amônia",
  },
];

const demoServices: Service[] = [
  { id: "s1", created_at: new Date().toISOString(), name: "Corte Feminino", duration_min: 45, price: 80, is_active: true },
  { id: "s2", created_at: new Date().toISOString(), name: "Corte Masculino", duration_min: 30, price: 50, is_active: true },
  { id: "s3", created_at: new Date().toISOString(), name: "Escova", duration_min: 40, price: 60, is_active: true },
  { id: "s4", created_at: new Date().toISOString(), name: "Coloração", duration_min: 90, price: 150, is_active: true },
  { id: "s5", created_at: new Date().toISOString(), name: "Barba", duration_min: 20, price: 35, is_active: true },
  { id: "s6", created_at: new Date().toISOString(), name: "Tratamento Capilar", duration_min: 60, price: 120, is_active: true },
  { id: "s7", created_at: new Date().toISOString(), name: "Manicure", duration_min: 40, price: 45, is_active: true },
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

const demoAppointments: Appointment[] = [
  {
    id: "a1", created_at: new Date().toISOString(),
    client_id: "c1", professional_id: "p1", service_id: "s1",
    date: todayStr(), start_time: "09:00", end_time: "09:45",
    status: "concluido", notes: null, price: 80, google_event_id: null,
  },
  {
    id: "a2", created_at: new Date().toISOString(),
    client_id: "c2", professional_id: "p2", service_id: "s2",
    date: todayStr(), start_time: "10:00", end_time: "10:30",
    status: "confirmado", notes: null, price: 50, google_event_id: null,
  },
  {
    id: "a3", created_at: new Date().toISOString(),
    client_id: "c3", professional_id: "p3", service_id: "s4",
    date: todayStr(), start_time: "14:00", end_time: "15:30",
    status: "agendado", notes: "Primeira coloração", price: 150, google_event_id: null,
  },
  {
    id: "a4", created_at: new Date().toISOString(),
    client_id: "c1", professional_id: "p3", service_id: "s3",
    date: todayStr(), start_time: "16:00", end_time: "16:40",
    status: "agendado", notes: null, price: 60, google_event_id: null,
  },
];

let professionals = [...demoProfessionals];
let clients = [...demoClients];
let services = [...demoServices];
let appointments = [...demoAppointments];
let nextId = 100;

function genId() {
  return `gen_${++nextId}`;
}

export const store = {
  // Professionals
  getProfessionals: () => professionals.filter((p) => p.is_active),
  getAllProfessionals: () => [...professionals],
  getProfessional: (id: string) => professionals.find((p) => p.id === id),
  addProfessional: (data: Omit<Professional, "id" | "created_at">) => {
    const p: Professional = { ...data, id: genId(), created_at: new Date().toISOString() };
    professionals.push(p);
    return p;
  },
  updateProfessional: (id: string, data: Partial<Professional>) => {
    const idx = professionals.findIndex((p) => p.id === id);
    if (idx >= 0) professionals[idx] = { ...professionals[idx], ...data };
    return professionals[idx];
  },
  deleteProfessional: (id: string) => {
    const idx = professionals.findIndex((p) => p.id === id);
    if (idx >= 0) professionals[idx].is_active = false;
  },

  // Clients
  getClients: () => [...clients],
  getClient: (id: string) => clients.find((c) => c.id === id),
  addClient: (data: Omit<Client, "id" | "created_at">) => {
    const c: Client = { ...data, id: genId(), created_at: new Date().toISOString() };
    clients.push(c);
    return c;
  },
  updateClient: (id: string, data: Partial<Client>) => {
    const idx = clients.findIndex((c) => c.id === id);
    if (idx >= 0) clients[idx] = { ...clients[idx], ...data };
    return clients[idx];
  },
  deleteClient: (id: string) => {
    clients = clients.filter((c) => c.id !== id);
  },

  // Services
  getServices: () => services.filter((s) => s.is_active),
  getAllServices: () => [...services],
  getService: (id: string) => services.find((s) => s.id === id),
  addService: (data: Omit<Service, "id" | "created_at">) => {
    const s: Service = { ...data, id: genId(), created_at: new Date().toISOString() };
    services.push(s);
    return s;
  },
  updateService: (id: string, data: Partial<Service>) => {
    const idx = services.findIndex((s) => s.id === id);
    if (idx >= 0) services[idx] = { ...services[idx], ...data };
    return services[idx];
  },
  deleteService: (id: string) => {
    const idx = services.findIndex((s) => s.id === id);
    if (idx >= 0) services[idx].is_active = false;
  },

  // Appointments
  getAppointments: (date?: string) => {
    let result = [...appointments];
    if (date) result = result.filter((a) => a.date === date);
    return result;
  },
  getAppointmentsByProfessional: (professionalId: string, date?: string) => {
    let result = appointments.filter((a) => a.professional_id === professionalId);
    if (date) result = result.filter((a) => a.date === date);
    return result;
  },
  getAppointmentsWithRelations: (date?: string): AppointmentWithRelations[] => {
    let result = [...appointments];
    if (date) result = result.filter((a) => a.date === date);
    return result.map((a) => ({
      ...a,
      client: clients.find((c) => c.id === a.client_id)!,
      professional: professionals.find((p) => p.id === a.professional_id)!,
      service: services.find((s) => s.id === a.service_id)!,
    })).filter((a) => a.client && a.professional && a.service);
  },
  getAppointmentsInRange: (startDate: string, endDate: string) => {
    return appointments.filter((a) => a.date >= startDate && a.date <= endDate);
  },
  addAppointment: (data: Omit<Appointment, "id" | "created_at">) => {
    const a: Appointment = { ...data, id: genId(), created_at: new Date().toISOString() };
    appointments.push(a);
    return a;
  },
  updateAppointment: (id: string, data: Partial<Appointment>) => {
    const idx = appointments.findIndex((a) => a.id === id);
    if (idx >= 0) appointments[idx] = { ...appointments[idx], ...data };
    return appointments[idx];
  },
  deleteAppointment: (id: string) => {
    appointments = appointments.filter((a) => a.id !== id);
  },

  // Commissions
  getCommissions: (startDate: string, endDate: string) => {
    const completed = appointments.filter(
      (a) => a.status === "concluido" && a.date >= startDate && a.date <= endDate
    );
    const byProfessional = new Map<string, { total: number; commission: number; count: number }>();
    for (const a of completed) {
      const prof = professionals.find((p) => p.id === a.professional_id);
      if (!prof) continue;
      const existing = byProfessional.get(a.professional_id) || { total: 0, commission: 0, count: 0 };
      existing.total += a.price;
      existing.commission += a.price * (prof.commission_pct / 100);
      existing.count += 1;
      byProfessional.set(a.professional_id, existing);
    }
    return Array.from(byProfessional.entries()).map(([profId, data]) => ({
      professional: professionals.find((p) => p.id === profId)!,
      ...data,
    }));
  },

  // Dashboard stats
  getDashboardStats: () => {
    const today = todayStr();
    const todayAppts = appointments.filter((a) => a.date === today);
    const completed = todayAppts.filter((a) => a.status === "concluido");
    const revenue = completed.reduce((sum, a) => sum + a.price, 0);
    return {
      todayTotal: todayAppts.length,
      todayCompleted: completed.length,
      todayPending: todayAppts.filter((a) => a.status === "agendado" || a.status === "confirmado").length,
      todayRevenue: revenue,
      totalClients: clients.length,
      activeProfessionals: professionals.filter((p) => p.is_active).length,
    };
  },
};
