"use client";

import { useEffect, useState } from "react";
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
import { Plus, Pencil, Trash2, Phone, Mail } from "lucide-react";
import type { Professional } from "@/lib/database.types";

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);

  const load = () => {
    fetch("/api/professionals").then((r) => r.json()).then(setProfessionals);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (formData: FormData) => {
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      specialties: (formData.get("specialties") as string).split(",").map((s) => s.trim()).filter(Boolean),
      commission_pct: parseFloat(formData.get("commission_pct") as string),
      is_active: true,
      work_schedule: editing?.work_schedule ?? {
        seg: { active: true, start: "09:00", end: "18:00" },
        ter: { active: true, start: "09:00", end: "18:00" },
        qua: { active: true, start: "09:00", end: "18:00" },
        qui: { active: true, start: "09:00", end: "18:00" },
        sex: { active: true, start: "09:00", end: "18:00" },
        sab: { active: true, start: "09:00", end: "13:00" },
        dom: { active: false, start: "09:00", end: "18:00" },
      },
      google_calendar_id: null,
      google_refresh_token: null,
    };

    if (editing) {
      await fetch(`/api/professionals/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setDialogOpen(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/professionals/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profissionais</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Profissional</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar" : "Novo"} Profissional</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" required defaultValue={editing?.name ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" required defaultValue={editing?.phone ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required defaultValue={editing?.email ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialties">Especialidades (separadas por vírgula)</Label>
                <Input id="specialties" name="specialties" defaultValue={editing?.specialties?.join(", ") ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission_pct">Comissão (%)</Label>
                <Input id="commission_pct" name="commission_pct" type="number" min="0" max="100" step="0.01" required defaultValue={editing?.commission_pct ?? 50} />
              </div>
              <Button type="submit" className="w-full">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {professionals.map((prof) => (
          <Card key={prof.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div>
                <CardTitle className="text-base">{prof.name}</CardTitle>
                <div className="flex flex-wrap gap-1 mt-2">
                  {prof.specialties.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
              <Badge variant="outline">{prof.commission_pct}%</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{prof.phone}</div>
                <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{prof.email}</div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEditing(prof); setDialogOpen(true); }}
                >
                  <Pencil className="h-3 w-3 mr-1" />Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-3 w-3 mr-1" />Remover
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover profissional?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {prof.name} será desativado do sistema. Agendamentos existentes serão mantidos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(prof.id)}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
