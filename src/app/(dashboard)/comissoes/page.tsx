"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { DollarSign, TrendingUp, Users, Plus, CheckCircle, Trash2, ArrowDownCircle } from "lucide-react";
import type { Professional } from "@/lib/database.types";

type CommissionData = {
  professional: Professional;
  total: number;
  commission: number;
  count: number;
};

type Payment = {
  id: string;
  professional_id: string;
  amount: number;
  type: "pagamento" | "adiantamento";
  reference_month: string;
  notes: string | null;
  created_at: string;
  professional: { id: string; name: string };
};

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

function formatMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1);
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export default function ComissoesPage() {
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"pagamento" | "adiantamento">("pagamento");
  const [dialogProfessional, setDialogProfessional] = useState("");
  const [dialogAmount, setDialogAmount] = useState("");
  const [dialogNotes, setDialogNotes] = useState("");

  const { startDate, endDate } = getMonthRange(selectedMonth);

  const loadData = useCallback(() => {
    fetch(`/api/commissions?startDate=${startDate}&endDate=${endDate}`)
      .then((r) => r.json())
      .then(setCommissions);
    fetch(`/api/payments?month=${selectedMonth}`)
      .then((r) => r.json())
      .then(setPayments);
  }, [startDate, endDate, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalRevenue = commissions.reduce((s, c) => s + c.total, 0);
  const totalCommissions = commissions.reduce((s, c) => s + c.commission, 0);
  const totalAppointments = commissions.reduce((s, c) => s + c.count, 0);
  const totalPaid = payments
    .filter((p) => p.type === "pagamento")
    .reduce((s, p) => s + p.amount, 0);
  const totalAdvances = payments
    .filter((p) => p.type === "adiantamento")
    .reduce((s, p) => s + p.amount, 0);

  const getProfessionalPayments = (profId: string) => {
    const profPayments = payments.filter((p) => p.professional_id === profId);
    const paid = profPayments
      .filter((p) => p.type === "pagamento")
      .reduce((s, p) => s + p.amount, 0);
    const advances = profPayments
      .filter((p) => p.type === "adiantamento")
      .reduce((s, p) => s + p.amount, 0);
    return { paid, advances, total: paid + advances };
  };

  const openPaymentDialog = (type: "pagamento" | "adiantamento", profId?: string) => {
    setDialogType(type);
    setDialogProfessional(profId || "");
    setDialogAmount("");
    setDialogNotes("");
    setDialogOpen(true);
  };

  const handleCreatePayment = async () => {
    if (!dialogProfessional || !dialogAmount) return;

    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professional_id: dialogProfessional,
        amount: parseFloat(dialogAmount),
        type: dialogType,
        reference_month: selectedMonth,
        notes: dialogNotes || null,
      }),
    });

    setDialogOpen(false);
    loadData();
  };

  const deletePayment = async (id: string) => {
    await fetch(`/api/payments/${id}`, { method: "DELETE" });
    loadData();
  };

  const navigateMonth = (dir: -1 | 1) => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + dir);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Comissões</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openPaymentDialog("adiantamento")}>
            <ArrowDownCircle className="h-4 w-4 mr-2" />Adiantamento
          </Button>
          <Button size="sm" onClick={() => openPaymentDialog("pagamento")}>
            <DollarSign className="h-4 w-4 mr-2" />Registrar Pagamento
          </Button>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
          ‹
        </Button>
        <span className="text-sm font-medium capitalize min-w-[160px] text-center">
          {formatMonth(selectedMonth)}
        </span>
        <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
          ›
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSelectedMonth(getCurrentMonth())}>
          Mês Atual
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comissões</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCommissions.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Adiantamentos</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">R$ {totalAdvances.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atendimentos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Commission table with payment status */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Profissional</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead className="text-right">Atend.</TableHead>
                <TableHead className="text-right">Faturamento</TableHead>
                <TableHead className="text-right">%</TableHead>
                <TableHead className="text-right">Comissão</TableHead>
                <TableHead className="text-right">Adiant.</TableHead>
                <TableHead className="text-right">Pago</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((c) => {
                const pp = getProfessionalPayments(c.professional.id);
                const balance = c.commission - pp.total;
                const isQuitado = balance <= 0.01;

                return (
                  <TableRow key={c.professional.id}>
                    <TableCell className="font-medium">{c.professional.name}</TableCell>
                    <TableCell className="text-right">{c.count}</TableCell>
                    <TableCell className="text-right">R$ {c.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{c.professional.commission_pct}%</TableCell>
                    <TableCell className="text-right font-medium">R$ {c.commission.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-orange-600">
                      {pp.advances > 0 ? `R$ ${pp.advances.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {pp.paid > 0 ? `R$ ${pp.paid.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {isQuitado ? "R$ 0,00" : `R$ ${balance.toFixed(2)}`}
                    </TableCell>
                    <TableCell className="text-center">
                      {isQuitado ? (
                        <Badge className="bg-green-100 text-green-800">Quitado</Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!isQuitado && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => {
                              setDialogType("pagamento");
                              setDialogProfessional(c.professional.id);
                              setDialogAmount(balance.toFixed(2));
                              setDialogNotes("");
                              setDialogOpen(true);
                            }}
                          >
                            Pagar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {commissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    Nenhuma comissão no período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment history */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos — {formatMonth(selectedMonth)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Obs.</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">
                      {new Date(p.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{p.professional?.name || "—"}</TableCell>
                    <TableCell>
                      {p.type === "pagamento" ? (
                        <Badge className="bg-green-100 text-green-800">Pagamento</Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800">Adiantamento</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">R$ {p.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.notes || "—"}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {p.type === "pagamento" ? "Pagamento" : "Adiantamento"} de R$ {p.amount.toFixed(2)} para {p.professional?.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deletePayment(p.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payment/Advance dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "pagamento" ? "Registrar Pagamento" : "Registrar Adiantamento"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Profissional</Label>
              <Select value={dialogProfessional} onValueChange={setDialogProfessional}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {commissions.map((c) => (
                    <SelectItem key={c.professional.id} value={c.professional.id}>
                      {c.professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={dialogAmount}
                onChange={(e) => setDialogAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={dialogNotes}
                onChange={(e) => setDialogNotes(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <Button
              onClick={handleCreatePayment}
              className="w-full"
              disabled={!dialogProfessional || !dialogAmount}
            >
              {dialogType === "pagamento" ? "Confirmar Pagamento" : "Confirmar Adiantamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
