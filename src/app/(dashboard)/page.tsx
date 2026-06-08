"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  Scissors,
} from "lucide-react";
import type { AppointmentWithRelations } from "@/lib/database.types";

type Stats = {
  todayTotal: number;
  todayCompleted: number;
  todayPending: number;
  todayRevenue: number;
  totalClients: number;
  activeProfessionals: number;
};

const statusColors: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-800",
  confirmado: "bg-yellow-100 text-yellow-800",
  em_atendimento: "bg-purple-100 text-purple-800",
  concluido: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  em_atendimento: "Em Atendimento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setStats);
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/appointments?date=${today}`).then((r) => r.json()).then(setAppointments);
  }, []);

  if (!stats) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Agendamentos Hoje"
          value={stats.todayTotal}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Concluídos"
          value={stats.todayCompleted}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatCard
          title="Pendentes"
          value={stats.todayPending}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Faturamento Hoje"
          value={`R$ ${stats.todayRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Total de Clientes"
          value={stats.totalClients}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Profissionais Ativos"
          value={stats.activeProfessionals}
          icon={<Scissors className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agendamentos de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum agendamento para hoje.</p>
          ) : (
            <div className="space-y-3">
              {appointments
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                .map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-mono font-medium w-14">
                        {appt.start_time.slice(0, 5)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{appt.client.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {appt.service.name} — {appt.professional.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        R$ {appt.price.toFixed(2)}
                      </span>
                      <Badge variant="secondary" className={statusColors[appt.status]}>
                        {statusLabels[appt.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 bg-muted rounded animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-4 w-24 bg-muted rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
