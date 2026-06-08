"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, ChevronLeft, ChevronRight, Trash2, Calendar } from "lucide-react";
import type {
  Professional,
  Client,
  Service,
  AppointmentWithRelations,
  AppointmentStatus,
} from "@/lib/database.types";

type ViewMode = "dia" | "semana" | "mes";

const statusColors: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-800 border-blue-200",
  confirmado: "bg-yellow-100 text-yellow-800 border-yellow-200",
  em_atendimento: "bg-purple-100 text-purple-800 border-purple-200",
  concluido: "bg-green-100 text-green-800 border-green-200",
  cancelado: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  em_atendimento: "Em Atendimento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const allStatuses: AppointmentStatus[] = [
  "agendado",
  "confirmado",
  "em_atendimento",
  "concluido",
  "cancelado",
];

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatDateBR(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatWeekday(date: Date) {
  return date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diffToMon);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
}

function isSameDay(a: Date, b: Date) {
  return formatDate(a) === formatDate(b);
}

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

function getDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const d = new Date(start);
  while (d <= end) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export default function AgendamentosPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("dia");
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDate, setCreateDate] = useState<string>("");

  const [formProfessional, setFormProfessional] = useState("");
  const [formClient, setFormClient] = useState("");
  const [formService, setFormService] = useState("");
  const [formTime, setFormTime] = useState("09:00");
  const [formNotes, setFormNotes] = useState("");

  const dateRange = useMemo(() => {
    if (viewMode === "dia") {
      return { start: selectedDate, end: selectedDate };
    } else if (viewMode === "semana") {
      return getWeekRange(selectedDate);
    } else {
      return getMonthRange(selectedDate);
    }
  }, [selectedDate, viewMode]);

  const loadAppointments = useCallback(() => {
    if (viewMode === "dia") {
      const dateStr = formatDate(selectedDate);
      fetch(`/api/appointments?date=${dateStr}`)
        .then((r) => r.json())
        .then(setAppointments);
    } else {
      const from = formatDate(dateRange.start);
      const to = formatDate(dateRange.end);
      fetch(`/api/appointments?date_from=${from}&date_to=${to}`)
        .then((r) => r.json())
        .then(setAppointments);
    }
  }, [selectedDate, viewMode, dateRange]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    Promise.all([
      fetch("/api/professionals").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
    ]).then(([profs, cls, svcs]) => {
      setProfessionals(profs);
      setClients(cls);
      setServices(svcs);
    });
  }, []);

  const navigate = (direction: -1 | 1) => {
    const d = new Date(selectedDate);
    if (viewMode === "dia") {
      d.setDate(d.getDate() + direction);
    } else if (viewMode === "semana") {
      d.setDate(d.getDate() + direction * 7);
    } else {
      d.setMonth(d.getMonth() + direction);
    }
    setSelectedDate(d);
  };

  const goToday = () => setSelectedDate(new Date());

  const openCreateDialog = (date?: string) => {
    setCreateDate(date || formatDate(selectedDate));
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    const service = services.find((s) => s.id === formService);
    if (!service || !formProfessional || !formClient) return;

    const dateToUse = createDate || formatDate(selectedDate);

    const data = {
      client_id: formClient,
      professional_id: formProfessional,
      service_id: formService,
      date: dateToUse,
      start_time: formTime,
      end_time: addMinutes(formTime, service.duration_min),
      status: "agendado" as const,
      notes: formNotes || null,
      price: service.price,
      google_event_id: null,
    };

    await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setDialogOpen(false);
    setFormProfessional("");
    setFormClient("");
    setFormService("");
    setFormTime("09:00");
    setFormNotes("");
    setCreateDate("");
    loadAppointments();
  };

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadAppointments();
  };

  const deleteAppointment = async (id: string) => {
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    loadAppointments();
  };

  const hours = Array.from({ length: 12 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

  const headerLabel = useMemo(() => {
    if (viewMode === "dia") return formatDateBR(selectedDate);
    if (viewMode === "semana") {
      return `${formatDateShort(dateRange.start)} — ${formatDateShort(dateRange.end)}, ${dateRange.start.getFullYear()}`;
    }
    return formatMonthYear(selectedDate);
  }, [selectedDate, viewMode, dateRange]);

  // Appointment card used in all views
  const AppointmentCard = ({ appt }: { appt: AppointmentWithRelations }) => (
    <div className={`rounded-md border p-2 text-sm ${statusColors[appt.status]}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">{appt.start_time.slice(0, 5)}–{appt.end_time.slice(0, 5)}</span>
          {" "}{appt.client?.name || "—"}
        </div>
        <div className="flex items-center gap-1">
          <Select
            value={appt.status}
            onValueChange={(v) => updateStatus(appt.id, v as AppointmentStatus)}
          >
            <SelectTrigger className="h-7 w-auto text-xs border-0 bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allStatuses.map((s) => (
                <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Agendamento de {appt.client?.name || "cliente"} será removido.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Não</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteAppointment(appt.id)}>
                  Sim, remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="text-xs opacity-75">
        {appt.service?.name || "—"} — {appt.professional?.name || "—"} — R$ {appt.price.toFixed(2)}
      </div>
      {appt.notes && (
        <div className="text-xs opacity-60 mt-1">{appt.notes}</div>
      )}
    </div>
  );

  // DAY VIEW — time slots
  const DayView = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Agenda do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {hours.map((hour) => {
            const hourAppts = appointments.filter(
              (a) => a.start_time.slice(0, 2) === hour.slice(0, 2)
            );
            return (
              <div key={hour} className="flex gap-3 min-h-[3rem]">
                <div className="w-14 text-xs font-mono text-muted-foreground pt-1 shrink-0">
                  {hour}
                </div>
                <div className="flex-1 border-t pt-1 space-y-1">
                  {hourAppts.map((appt) => (
                    <AppointmentCard key={appt.id} appt={appt} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  // WEEK VIEW — columns per day
  const WeekView = () => {
    const days = getDaysInRange(dateRange.start, dateRange.end);
    const today = new Date();

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agenda da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dateStr = formatDate(day);
              const dayAppts = appointments.filter((a) => a.date === dateStr);
              const isToday = isSameDay(day, today);

              return (
                <div key={dateStr} className="min-h-[120px]">
                  <button
                    onClick={() => {
                      setSelectedDate(day);
                      setViewMode("dia");
                    }}
                    className={`w-full text-center text-xs font-medium py-1 rounded-t-md mb-1 hover:bg-accent transition-colors ${
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="capitalize">{formatWeekday(day)}</div>
                    <div className="text-sm font-bold">{day.getDate()}</div>
                  </button>
                  <div className="space-y-1">
                    {dayAppts.map((appt) => (
                      <div
                        key={appt.id}
                        className={`rounded border p-1.5 text-xs ${statusColors[appt.status]} cursor-pointer`}
                        onClick={() => {
                          setSelectedDate(day);
                          setViewMode("dia");
                        }}
                      >
                        <div className="font-medium">{appt.start_time.slice(0, 5)}</div>
                        <div className="truncate">{appt.client?.name || "—"}</div>
                        <div className="truncate opacity-75">{appt.service?.name || "—"}</div>
                      </div>
                    ))}
                    {dayAppts.length === 0 && (
                      <button
                        onClick={() => openCreateDialog(dateStr)}
                        className="w-full text-xs text-muted-foreground hover:text-primary hover:bg-accent rounded p-1 transition-colors"
                      >
                        + Agendar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  // MONTH VIEW — calendar grid
  const MonthView = () => {
    const { start, end } = dateRange;
    const today = new Date();

    // Pad to start on Monday
    const startDay = start.getDay();
    const padStart = startDay === 0 ? 6 : startDay - 1;
    const calStart = new Date(start);
    calStart.setDate(calStart.getDate() - padStart);

    // Pad to end on Sunday
    const endDay = end.getDay();
    const padEnd = endDay === 0 ? 0 : 7 - endDay;
    const calEnd = new Date(end);
    calEnd.setDate(calEnd.getDate() + padEnd);

    const days = getDaysInRange(calStart, calEnd);
    const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base capitalize">{formatMonthYear(selectedDate)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
            {weekdays.map((wd) => (
              <div key={wd} className="bg-muted text-center text-xs font-medium py-2 text-muted-foreground">
                {wd}
              </div>
            ))}
            {days.map((day) => {
              const dateStr = formatDate(day);
              const dayAppts = appointments.filter((a) => a.date === dateStr);
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
              const isToday = isSameDay(day, today);

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(day);
                    setViewMode("dia");
                  }}
                  className={`bg-background min-h-[80px] p-1 text-left hover:bg-accent transition-colors ${
                    !isCurrentMonth ? "opacity-40" : ""
                  }`}
                >
                  <div
                    className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  {dayAppts.length > 0 && (
                    <div className="space-y-0.5">
                      {dayAppts.slice(0, 3).map((appt) => (
                        <div
                          key={appt.id}
                          className={`rounded px-1 py-0.5 text-[10px] truncate ${statusColors[appt.status]}`}
                        >
                          {appt.start_time.slice(0, 5)} {appt.client?.name || "—"}
                        </div>
                      ))}
                      {dayAppts.length > 3 && (
                        <div className="text-[10px] text-muted-foreground pl-1">
                          +{dayAppts.length - 3} mais
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agendamentos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openCreateDialog()}><Plus className="h-4 w-4 mr-2" />Novo Agendamento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={createDate || formatDate(selectedDate)}
                  onChange={(e) => setCreateDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={formClient} onValueChange={setFormClient}>
                  <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} — {c.phone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Profissional</Label>
                <Select value={formProfessional} onValueChange={setFormProfessional}>
                  <SelectTrigger><SelectValue placeholder="Selecione o profissional" /></SelectTrigger>
                  <SelectContent>
                    {professionals.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Serviço</Label>
                <Select value={formService} onValueChange={setFormService}>
                  <SelectTrigger><SelectValue placeholder="Selecione o serviço" /></SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} — {s.duration_min}min — R$ {s.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!formClient || !formProfessional || !formService}>
                Agendar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* View mode toggle + navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>Hoje</Button>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <span className="text-sm font-medium capitalize order-last w-full text-center sm:order-none sm:w-auto">
          {headerLabel}
        </span>

        <div className="flex items-center bg-muted rounded-lg p-1 gap-0.5">
          {(["dia", "semana", "mes"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === mode
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === "dia" ? "Dia" : mode === "semana" ? "Semana" : "Mês"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div>
          {viewMode === "dia" && <DayView />}
          {viewMode === "semana" && <WeekView />}
          {viewMode === "mes" && <MonthView />}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{appointments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Concluídos</span>
                <span className="font-medium">
                  {appointments.filter((a) => a.status === "concluido").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cancelados</span>
                <span className="font-medium">
                  {appointments.filter((a) => a.status === "cancelado").length}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Faturamento</span>
                <span className="font-medium">
                  R$ {appointments
                    .filter((a) => a.status === "concluido")
                    .reduce((s, a) => s + a.price, 0)
                    .toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Por Profissional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {professionals.map((prof) => {
                const profAppts = appointments.filter(
                  (a) => a.professional_id === prof.id
                );
                if (profAppts.length === 0) return null;
                return (
                  <div key={prof.id} className="flex justify-between text-sm">
                    <span>{prof.name}</span>
                    <Badge variant="secondary">{profAppts.length}</Badge>
                  </div>
                );
              })}
              {appointments.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum agendamento no período.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
