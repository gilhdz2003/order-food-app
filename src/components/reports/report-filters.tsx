'use client';

/**
 * Report Filters Component
 *
 * Filters for report generation (type, date range, company, employee)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Company, User } from '@/types';

export interface ReportFilters {
  type: 'daily' | 'weekly' | 'company' | 'employee';
  period: 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  companyId?: string;
  userId?: string;
}

export interface ReportFiltersProps {
  onGenerate: (filters: ReportFilters) => void;
  companies: Company[];
  users: User[];
  isLoading?: boolean;
}

export function ReportFilters({ onGenerate, companies, users, isLoading }: ReportFiltersProps) {
  const [type, setType] = useState<ReportFilters['type']>('weekly');
  const [period, setPeriod] = useState<ReportFilters['period']>('week');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [companyId, setCompanyId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const handleGenerate = () => {
    onGenerate({
      type,
      period,
      startDate: period === 'custom' ? startDate : undefined,
      endDate: period === 'custom' ? endDate : undefined,
      companyId: type === 'company' ? companyId : undefined,
      userId: type === 'employee' ? userId : undefined,
    });
  };

  const handleTypeChange = (value: ReportFilters['type']) => {
    setType(value);
    // Reset dependent filters
    if (value !== 'company') setCompanyId('');
    if (value !== 'employee') setUserId('');
  };

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Report Type */}
        <div className="space-y-2">
          <Label htmlFor="report-type">Tipo de Reporte</Label>
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger id="report-type">
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diario</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="company">Por Empresa</SelectItem>
              <SelectItem value="employee">Por Empleado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Period */}
        {type !== 'daily' && (
          <div className="space-y-2">
            <Label htmlFor="period">Período</Label>
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger id="period">
                <SelectValue placeholder="Selecciona el período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Custom Date Range */}
        {period === 'custom' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="start-date">Fecha Inicio</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Fecha Fin</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Company Filter */}
        {type === 'company' && (
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger id="company">
                <SelectValue placeholder="Selecciona empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Employee Filter */}
        {type === 'employee' && (
          <div className="space-y-2">
            <Label htmlFor="employee">Empleado</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger id="employee">
                <SelectValue placeholder="Selecciona empleado" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleGenerate}
          disabled={isLoading || (type === 'company' && !companyId) || (type === 'employee' && !userId)}
        >
          {isLoading ? 'Generando...' : 'Generar Reporte'}
        </Button>
      </div>
    </div>
  );
}
