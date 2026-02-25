'use client';

/**
 * Admin Reports Page
 *
 * Dashboard for generating and viewing reports (daily, weekly, by company, by employee)
 */

import { useState, useEffect } from 'react';
import { ReportFilters, type ReportFilters as ReportFiltersType } from '@/components/reports/report-filters';
import { ExportButtons } from '@/components/reports/export-buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Calendar, TrendingUp, Users, Building2 } from 'lucide-react';
import type { DailyReportData, WeeklyReportData, CompanyReportData, EmployeeReportData } from '@/lib/reports/actions';
import {
  getDailyReport,
  getWeeklyReport,
  getCompanyReport,
  getEmployeeReport,
  getAllCompanies,
  getAllUsers,
} from '@/lib/reports/actions';
import {
  exportDailyReportToCSV,
  exportWeeklyReportToCSV,
  exportCompanyReportToCSV,
  exportEmployeeReportToCSV,
  downloadCSV,
  generateReportFilename,
} from '@/lib/reports/csv-export';
import {
  generateDailyReportPDF,
  generateWeeklyReportPDF,
  generateCompanyReportPDF,
  generateEmployeeReportPDF,
  openReportPDF,
  generatePDFFilename,
} from '@/lib/reports/pdf-export';

type ReportData = DailyReportData | WeeklyReportData | CompanyReportData | EmployeeReportData;

export default function ReportsPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load companies and users on mount
  useEffect(() => {
    const loadFiltersData = async () => {
      const [companiesData, usersData] = await Promise.all([
        getAllCompanies(),
        getAllUsers(),
      ]);
      setCompanies(companiesData);
      setUsers(usersData);
    };
    loadFiltersData();
  }, []);

  const handleGenerate = async (filters: ReportFiltersType) => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      let data: ReportData;

      switch (filters.type) {
        case 'daily':
          data = await getDailyReport(filters.startDate);
          break;
        case 'weekly':
          data = await getWeeklyReport(filters.startDate, filters.endDate);
          break;
        case 'company': {
          const companyReport = await getCompanyReport(filters.companyId!, filters.startDate, filters.endDate);
          if (!companyReport) {
            throw new Error('Empresa no encontrada');
          }
          data = companyReport;
          break;
        }
        case 'employee': {
          const employeeReport = await getEmployeeReport(filters.userId!, filters.startDate, filters.endDate);
          if (!employeeReport) {
            throw new Error('Empleado no encontrado');
          }
          data = employeeReport;
          break;
        }
        default:
          throw new Error('Tipo de reporte inválido');
      }

      if (!data) {
        throw new Error('No se pudieron obtener los datos del reporte');
      }

      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!report) return;

    let csvContent: string;
    let filename: string;

    if ('date' in report) {
      // Daily report
      csvContent = exportDailyReportToCSV(report as DailyReportData);
      filename = generateReportFilename('daily');
    } else if ('startDate' in report && 'dailyBreakdown' in report) {
      // Weekly report
      csvContent = exportWeeklyReportToCSV(report as WeeklyReportData);
      filename = generateReportFilename('weekly');
    } else if ('company' in report) {
      // Company report
      csvContent = exportCompanyReportToCSV(report as CompanyReportData);
      filename = generateReportFilename('company', (report as CompanyReportData).company.name);
    } else if ('employee' in report) {
      // Employee report
      csvContent = exportEmployeeReportToCSV(report as EmployeeReportData);
      filename = generateReportFilename('employee', (report as EmployeeReportData).employee.full_name || undefined);
    } else {
      return;
    }

    downloadCSV(csvContent, filename);
  };

  const handleExportPDF = () => {
    if (!report) return;

    let htmlContent: string;

    if ('date' in report) {
      // Daily report
      htmlContent = generateDailyReportPDF(report as DailyReportData);
    } else if ('startDate' in report && 'dailyBreakdown' in report) {
      // Weekly report
      htmlContent = generateWeeklyReportPDF(report as WeeklyReportData);
    } else if ('company' in report) {
      // Company report
      htmlContent = generateCompanyReportPDF(report as CompanyReportData);
    } else if ('employee' in report) {
      // Employee report
      htmlContent = generateEmployeeReportPDF(report as EmployeeReportData);
    } else {
      return;
    }

    openReportPDF(htmlContent);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-blue-100 text-blue-800',
      en_preparacion: 'bg-indigo-100 text-indigo-800',
      listo: 'bg-green-100 text-green-800',
      entregado: 'bg-emerald-100 text-emerald-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderSummaryCards = () => {
    if (!report) return null;

    let cards: Array<{ title: string; value: string; icon: React.ReactNode }> = [];

    if ('date' in report) {
      // Daily report
      const dailyReport = report as DailyReportData;
      cards = [
        {
          title: 'Fecha',
          value: new Date(dailyReport.date).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          title: 'Total Pedidos',
          value: String(dailyReport.orderCount),
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          title: 'Importe Total',
          value: `$${dailyReport.totalAmount.toFixed(2)}`,
          icon: <TrendingUp className="h-4 w-4" />,
        },
      ];
    } else if ('startDate' in report && 'dailyBreakdown' in report) {
      // Weekly report
      const weeklyReport = report as WeeklyReportData;
      cards = [
        {
          title: 'Período',
          value: `${new Date(weeklyReport.startDate).toLocaleDateString('es-MX')} - ${new Date(weeklyReport.endDate).toLocaleDateString('es-MX')}`,
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          title: 'Total Pedidos',
          value: String(weeklyReport.orderCount),
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          title: 'Importe Total',
          value: `$${weeklyReport.totalAmount.toFixed(2)}`,
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          title: 'Promedio Diario',
          value: `$${(weeklyReport.totalAmount / Math.max(weeklyReport.dailyBreakdown.length, 1)).toFixed(2)}`,
          icon: <TrendingUp className="h-4 w-4" />,
        },
      ];
    } else if ('company' in report) {
      // Company report
      const companyReport = report as CompanyReportData;
      cards = [
        {
          title: 'Empresa',
          value: companyReport.company.name,
          icon: <Building2 className="h-4 w-4" />,
        },
        {
          title: 'Total Pedidos',
          value: String(companyReport.orderCount),
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          title: 'Importe Total',
          value: `$${companyReport.totalAmount.toFixed(2)}`,
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          title: 'Ticket Promedio',
          value: `$${companyReport.averageOrderAmount.toFixed(2)}`,
          icon: <TrendingUp className="h-4 w-4" />,
        },
      ];
    } else if ('employee' in report) {
      // Employee report
      const employeeReport = report as EmployeeReportData;
      cards = [
        {
          title: 'Empleado',
          value: employeeReport.employee.full_name || 'N/A',
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: 'Total Pedidos',
          value: String(employeeReport.orderCount),
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          title: 'Importe Total',
          value: `$${employeeReport.totalAmount.toFixed(2)}`,
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          title: 'Ticket Promedio',
          value: `$${employeeReport.averageOrderAmount.toFixed(2)}`,
          icon: <TrendingUp className="h-4 w-4" />,
        },
      ];
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderReportContent = () => {
    if (!report) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Selecciona los filtros y genera un reporte para ver los resultados
            </p>
          </CardContent>
        </Card>
      );
    }

    const orders = 'orders' in report ? report.orders : [];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Detalle de Pedidos</CardTitle>
              <CardDescription>{orders.length} pedidos encontrados</CardDescription>
            </div>
            <ExportButtons
              onExportCSV={handleExportCSV}
              onExportPDF={handleExportPDF}
              disabled={orders.length === 0}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>
                  {'company' in report ? 'Empleado' : 'Empresa'}
                </TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No hay pedidos para mostrar
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_code}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleString('es-MX')}</TableCell>
                    <TableCell>
                      {'company' in report ? (
                        (order.user as any)?.full_name || 'N/A'
                      ) : (
                        (order.company as any)?.name || 'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${order.total_amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">
          Genera reportes de pedidos por diferentes criterios
        </p>
      </div>

      <ReportFilters
        onGenerate={handleGenerate}
        companies={companies}
        users={users}
        isLoading={isLoading}
      />

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-6 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {renderSummaryCards()}
          {renderReportContent()}
        </>
      )}
    </div>
  );
}
