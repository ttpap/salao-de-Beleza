"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import type {
  Professional,
  Client,
  Service,
  AppointmentWithRelations,
  AppointmentStatus,
} from "@/lib/database.types";

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

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export default function AgendamentosPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formProfessional, setFormProfessional] = useState("");
  const [formClient, setFormClient] = useState("");
  const [formService, setFormService] = useState("");
  const [formTime, setFormTime] = useState("09:00");
  const [formNotes, setFormNotes] = useState("");

  const loadAppointments = useCallback(() => {
    const dateStr = formatDate(selectedDate);
    fetch(`/api/appointments?date=${dateStr}`)
      .then((r) => r.json())
      .then(setAppointments);
  }, [selectedDate]);

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

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const today = () => setSelectedDate(new Date());

  const handleCreate = async () => {
    const service = services.find((s) => s.id === formService);
    if (!service || !formProfessional || !formClient) return;

    const data = {
      client_id: formClient,
      professional_id: formProfessional,
      service_id: formService,
      date: formatDate(selectedDate),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agendamentos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Agendamento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={today}>Hoje</Button>
          <Button variant="outline" size="icon" onClick={nextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm font-medium capitalize">{formatDateBR(selectedDate)}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
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
                        <div
                          key={appt.id}
                          className={`rounded-md border p-2 text-sm ${statusColors[appt.status]}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{appt.start_time.slice(0, 5)}–{appt.end_time.slice(0, 5)}</span>
                              {" "}{appt.client.name}
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
                                      Agendamento de {appt.client.name} será removido.
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
                            {appt.service.name} — {appt.professional.name} — R$ {appt.price.toFixed(2)}
                          </div>
                          {appt.notes && (
                            <div className="text-xs opacity-60 mt-1">{appt.notes}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo</CardTitle>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
