"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle>Google Calendar</CardTitle>
          <CardDescription>
            Sincronize o calendário do salão e dos profissionais com Google Calendar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="font-medium text-sm">Calendário do Salão</div>
              <div className="text-xs text-muted-foreground">
                Sincronização com conta Google do gestor
              </div>
            </div>
            <Badge variant="outline">Não conectado</Badge>
          </div>
          <Button variant="outline" disabled>
            <ExternalLink className="h-4 w-4 mr-2" />
            Conectar Google Calendar
          </Button>
          <p className="text-xs text-muted-foreground">
            Configure as variáveis GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET para habilitar a integração.
          </p>
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
