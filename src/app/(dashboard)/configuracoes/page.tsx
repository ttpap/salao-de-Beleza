"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Calendar, CheckCircle, AlertCircle } from "lucide-react";

type Professional = {
  id: string;
  name: string;
  email: string;
  google_calendar_id: string | null;
};

export default function ConfiguracoesPage() {
  const [masterCalendarId, setMasterCalendarId] = useState("");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [calendarIds, setCalendarIds] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serviceAccountConfigured, setServiceAccountConfigured] = useState<boolean | null>(null);

  const loadData = useCallback(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((settings) => {
        setMasterCalendarId(settings.master_calendar_id || "");
      });

    fetch("/api/professionals")
      .then((r) => r.json())
      .then((profs: Professional[]) => {
        setProfessionals(profs);
        const ids: Record<string, string> = {};
        for (const p of profs) {
          ids[p.id] = p.google_calendar_id || "";
        }
        setCalendarIds(ids);
      });

    fetch("/api/settings/check-google")
      .then((r) => r.json())
      .then((d) => setServiceAccountConfigured(d.configured))
      .catch(() => setServiceAccountConfigured(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ master_calendar_id: masterCalendarId }),
    });

    for (const [profId, calId] of Object.entries(calendarIds)) {
      await fetch(`/api/professionals/${profId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ google_calendar_id: calId || null }),
      });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
          <CheckCircle className="h-4 w-4" />
          Configurações salvas com sucesso!
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
          </CardTitle>
          <CardDescription>
            Sincronize agendamentos com Google Calendar do salão e dos profissionais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Account Status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="font-medium text-sm">Conta de Serviço Google</div>
              <div className="text-xs text-muted-foreground">
                Variável GOOGLE_SERVICE_ACCOUNT_KEY no Vercel
              </div>
            </div>
            {serviceAccountConfigured === null ? (
              <Badge variant="outline">Verificando...</Badge>
            ) : serviceAccountConfigured ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configurada
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Não configurada
              </Badge>
            )}
          </div>

          {/* Master Calendar */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Calendário Master (Administrador)
            </Label>
            <Input
              placeholder="email@gmail.com ou ID do calendário"
              value={masterCalendarId}
              onChange={(e) => setMasterCalendarId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Todos os agendamentos serão criados neste calendário.
              O calendário deve estar compartilhado com a conta de serviço.
            </p>
          </div>

          {/* Professional Calendars */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Calendários dos Profissionais
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Cada profissional recebe os agendamentos no seu próprio Google Calendar.
              Deixe em branco para não sincronizar.
            </p>
            {professionals.map((prof) => (
              <div key={prof.id} className="flex items-center gap-3">
                <span className="text-sm font-medium min-w-[120px]">{prof.name}</span>
                <Input
                  placeholder={prof.email || "email@gmail.com"}
                  value={calendarIds[prof.id] || ""}
                  onChange={(e) =>
                    setCalendarIds((prev) => ({ ...prev, [prof.id]: e.target.value }))
                  }
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Como Configurar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Crie um projeto no{" "}
              <span className="font-medium text-foreground">Google Cloud Console</span>{" "}
              e ative a API do Google Calendar.
            </li>
            <li>
              Crie uma{" "}
              <span className="font-medium text-foreground">Conta de Serviço</span>{" "}
              (Service Account) e gere uma chave JSON.
            </li>
            <li>
              Adicione a variável{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">GOOGLE_SERVICE_ACCOUNT_KEY</code>{" "}
              no Vercel com o conteúdo do JSON.
            </li>
            <li>
              No Google Calendar de cada pessoa, compartilhe o calendário com o email da conta de serviço{" "}
              (terminado em <code className="bg-muted px-1 py-0.5 rounded text-xs">@*.iam.gserviceaccount.com</code>){" "}
              com permissão <span className="font-medium text-foreground">"Fazer alterações nos eventos"</span>.
            </li>
            <li>
              Preencha os IDs dos calendários acima (geralmente o email do Gmail) e salve.
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sobre o Sistema</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>Sistema de Gestão para Salão de Beleza v1.0</p>
          <p>Agendamentos, profissionais, clientes, serviços e comissões.</p>
        </CardContent>
      </Card>
    </div>
  );
}
