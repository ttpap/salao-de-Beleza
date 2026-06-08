"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, Users } from "lucide-react";
import type { Professional } from "@/lib/database.types";

type CommissionData = {
  professional: Professional;
  total: number;
  commission: number;
  count: number;
};

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

export default function ComissoesPage() {
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const defaults = getMonthRange();
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);

  const load = () => {
    fetch(`/api/commissions?startDate=${startDate}&endDate=${endDate}`)
      .then((r) => r.json())
      .then(setCommissions);
  };

  useEffect(() => { load(); }, [startDate, endDate]);

  const totalRevenue = commissions.reduce((s, c) => s + c.total, 0);
  const totalCommissions = commissions.reduce((s, c) => s + c.commission, 0);
  const totalAppointments = commissions.reduce((s, c) => s + c.count, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Comissões</h1>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label>Data Início</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Data Fim</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => {
          const r = getMonthRange();
          setStartDate(r.startDate);
          setEndDate(r.endDate);
        }}>
          Mês Atual
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Comissões
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCommissions.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Atendimentos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Profissional</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead className="text-right">Atendimentos</TableHead>
                <TableHead className="text-right">Faturamento</TableHead>
                <TableHead className="text-right">% Comissão</TableHead>
                <TableHead className="text-right">Valor Comissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((c) => (
                <TableRow key={c.professional.id}>
                  <TableCell className="font-medium">{c.professional.name}</TableCell>
                  <TableCell className="text-right">{c.count}</TableCell>
                  <TableCell className="text-right">R$ {c.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{c.professional.commission_pct}%</TableCell>
                  <TableCell className="text-right font-medium">
                    R$ {c.commission.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {commissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhuma comissão no período selecionado.
                  </TableCell>
                </TableRow>
              )}
              {commissions.length > 0 && (
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{totalAppointments}</TableCell>
                  <TableCell className="text-right">R$ {totalRevenue.toFixed(2)}</TableCell>
                  <TableCell />
                  <TableCell className="text-right">R$ {totalCommissions.toFixed(2)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
