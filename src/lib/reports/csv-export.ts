/**
 * CSV Export Utilities
 *
 * Functions to export reports to CSV format for accounting and analysis
 */

import type { DailyReportData, WeeklyReportData, CompanyReportData, EmployeeReportData } from './actions';

/**
 * Format currency as MXN
 */
function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Format date for display (DD/MM/YYYY)
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX');
}

/**
 * Convert array of objects to CSV string
 */
function objectsToCSV(data: any[], headers: string[]): string {
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma or quote
      if (value === null || value === undefined) {
        return '""';
      }
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Export daily report to CSV
 */
export function exportDailyReportToCSV(report: DailyReportData): string {
  const rows: Record<string, string>[] = report.orders.map(order => ({
    'Código Pedido': order.order_code,
    'Fecha': new Date(order.created_at).toLocaleString('es-MX'),
    'Empresa': (order.company as any)?.name || 'N/A',
    'Empleado': (order.user as any)?.full_name || 'N/A',
    'Email': (order.user as any)?.email || 'N/A',
    'Estado': order.status,
    'Total': formatCurrency(order.total_amount),
    'Items': order.items?.map(i => `${i.quantity}x ${(i.dish as any)?.name}`).join('; ') || '',
  }));

  // Add summary rows at the end
  rows.push({
    'Código Pedido': '---',
    'Fecha': '---',
    'Empresa': '---',
    'Empleado': 'TOTAL',
    'Email': '---',
    'Estado': '---',
    'Total': formatCurrency(report.totalAmount),
    'Items': `${report.orderCount} pedidos`,
  });

  return objectsToCSV(rows, [
    'Código Pedido',
    'Fecha',
    'Empresa',
    'Empleado',
    'Email',
    'Estado',
    'Total',
    'Items',
  ]);
}

/**
 * Export weekly report to CSV (accounting format)
 */
export function exportWeeklyReportToCSV(report: WeeklyReportData): string {
  const rows: Record<string, any>[] = [];

  // Header row
  rows.push({
    'Fecha': formatDate(report.startDate),
    'Reporte': 'REPORTE SEMANAL',
    'Periodo': `${formatDate(report.startDate)} - ${formatDate(report.endDate)}`,
    'Total Pedidos': String(report.orderCount),
    'Importe Total': formatCurrency(report.totalAmount),
  });

  // Empty row
  rows.push({});

  // Daily breakdown header
  rows.push({
    'Fecha': 'RESUMEN DIARIO',
    'Pedidos': 'Cantidad',
    'Importe': 'Total',
  });

  // Daily breakdown rows
  report.dailyBreakdown.forEach(day => {
    rows.push({
      'Fecha': formatDate(day.date),
      'Pedidos': day.orderCount,
      'Importe': formatCurrency(day.totalAmount),
    });
  });

  // Empty row
  rows.push({});

  // Company breakdown header
  rows.push({
    'Empresa': 'RESUMEN POR EMPRESA',
    'Pedidos': 'Cantidad',
    'Importe': 'Total',
  });

  // Company breakdown rows
  report.companyBreakdown.forEach(company => {
    rows.push({
      'Empresa': company.company.name,
      'Pedidos': company.orderCount,
      'Importe': formatCurrency(company.totalAmount),
    });
  });

  // Empty row
  rows.push({});

  // Top dishes header
  rows.push({
    'Platillo': 'PLATILLOS MÁS PEDIDOS',
    'Cantidad': 'Veces',
    'Importe': 'Total',
  });

  // Top dishes rows
  report.topDishes.forEach(dish => {
    rows.push({
      'Platillo': dish.dishName,
      'Cantidad': dish.quantity,
      'Importe': formatCurrency(dish.totalAmount),
    });
  });

  // Empty row
  rows.push({});

  // Detail rows header
  rows.push({
    'Código': 'DETALLE DE PEDIDOS',
    'Fecha': 'Fecha/Hora',
    'Empresa': 'Empresa',
    'Empleado': 'Empleado',
    'Estado': 'Estado',
    'Total': 'Importe',
  });

  // Detail rows
  report.orders.forEach(order => {
    rows.push({
      'Código': order.order_code,
      'Fecha': new Date(order.created_at).toLocaleString('es-MX'),
      'Empresa': (order.company as any)?.name || 'N/A',
      'Empleado': (order.user as any)?.full_name || 'N/A',
      'Estado': order.status,
      'Total': formatCurrency(order.total_amount),
    });
  });

  return objectsToCSV(rows, [
    'Fecha',
    'Reporte',
    'Periodo',
    'Total Pedidos',
    'Importe Total',
  ]);
}

/**
 * Export company report to CSV
 */
export function exportCompanyReportToCSV(report: CompanyReportData): string {
  const rows: Record<string, any>[] = [];

  // Header row
  rows.push({
    'Empresa': report.company.name,
    'Reporte': 'REPORTE POR EMPRESA',
    'Periodo': `${formatDate(report.startDate)} - ${formatDate(report.endDate)}`,
    'Total Pedidos': report.orderCount,
    'Importe Total': formatCurrency(report.totalAmount),
    'Promedio': formatCurrency(report.averageOrderAmount),
  });

  // Empty row
  rows.push({});

  // Employee breakdown header
  rows.push({
    'Empleado': 'RESUMEN POR EMPLEADO',
    'Pedidos': 'Cantidad',
    'Importe': 'Total',
  });

  // Employee breakdown rows
  report.employeeBreakdown.forEach(emp => {
    rows.push({
      'Empleado': emp.employee.full_name || 'N/A',
      'Pedidos': emp.orderCount,
      'Importe': formatCurrency(emp.totalAmount),
    });
  });

  // Empty row
  rows.push({});

  // Detail rows header
  rows.push({
    'Código': 'DETALLE DE PEDIDOS',
    'Fecha': 'Fecha/Hora',
    'Empleado': 'Empleado',
    'Estado': 'Estado',
    'Total': 'Importe',
    'Items': 'Items',
  });

  // Detail rows
  report.orders.forEach(order => {
    rows.push({
      'Código': order.order_code,
      'Fecha': new Date(order.created_at).toLocaleString('es-MX'),
      'Empleado': (order.user as any)?.full_name || 'N/A',
      'Estado': order.status,
      'Total': formatCurrency(order.total_amount),
      'Items': order.items?.map(i => `${i.quantity}x ${(i.dish as any)?.name}`).join('; ') || '',
    });
  });

  return objectsToCSV(rows, [
    'Empresa',
    'Reporte',
    'Periodo',
    'Total Pedidos',
    'Importe Total',
    'Promedio',
  ]);
}

/**
 * Export employee report to CSV
 */
export function exportEmployeeReportToCSV(report: EmployeeReportData): string {
  const rows: Record<string, any>[] = [];

  // Header row
  rows.push({
    'Empleado': report.employee.full_name || 'N/A',
    'Email': report.employee.email,
    'Reporte': 'REPORTE PERSONAL',
    'Periodo': `${formatDate(report.startDate)} - ${formatDate(report.endDate)}`,
    'Total Pedidos': report.orderCount,
    'Importe Total': formatCurrency(report.totalAmount),
    'Promedio': formatCurrency(report.averageOrderAmount),
  });

  // Empty row
  rows.push({});

  // Favorite dishes header
  rows.push({
    'Platillo': 'PLATILLOS FAVORITOS',
    'Veces': 'Cantidad',
  });

  // Favorite dishes rows
  report.favoriteDishes.forEach(dish => {
    rows.push({
      'Platillo': dish.dishName,
      'Veces': dish.quantity,
    });
  });

  // Empty row
  rows.push({});

  // Detail rows header
  rows.push({
    'Código': 'DETALLE DE PEDIDOS',
    'Fecha': 'Fecha/Hora',
    'Estado': 'Estado',
    'Total': 'Importe',
    'Items': 'Items',
  });

  // Detail rows
  report.orders.forEach(order => {
    rows.push({
      'Código': order.order_code,
      'Fecha': new Date(order.created_at).toLocaleString('es-MX'),
      'Estado': order.status,
      'Total': formatCurrency(order.total_amount),
      'Items': order.items?.map(i => `${i.quantity}x ${(i.dish as any)?.name}`).join('; ') || '',
    });
  });

  return objectsToCSV(rows, [
    'Empleado',
    'Email',
    'Reporte',
    'Periodo',
    'Total Pedidos',
    'Importe Total',
    'Promedio',
  ]);
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for UTF-8 (Excel compatibility)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename for report
 */
export function generateReportFilename(
  type: 'daily' | 'weekly' | 'company' | 'employee',
  identifier?: string
): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');

  const typeMap = {
    daily: 'diario',
    weekly: 'semanal',
    company: `empresa-${identifier || 'todas'}`,
    employee: `empleado-${identifier || 'todos'}`,
  };

  return `reporte-${typeMap[type]}-${dateStr}_${timeStr}.csv`;
}
