/**
 * PDF Export Utilities
 *
 * Functions to export reports to PDF format using browser's print functionality
 * This is a lightweight approach that doesn't require heavy libraries like jsPDF
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
 * Format datetime for display
 */
function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('es-MX');
}

/**
 * Generate PDF HTML content for daily report
 */
export function generateDailyReportPDF(report: DailyReportData): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte Diario - ${formatDate(report.date)}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #333;
      margin: 20px;
    }
    h1 {
      color: #1a1a1a;
      font-size: 20px;
      margin-bottom: 5px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .summary {
      display: flex;
      gap: 30px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .summary-item {
      flex: 1;
    }
    .summary-label {
      color: #666;
      font-size: 11px;
      text-transform: uppercase;
    }
    .summary-value {
      color: #1a1a1a;
      font-size: 24px;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #1a1a1a;
      color: white;
      padding: 10px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .status-pendiente { background: #fef3c7; color: #92400e; }
    .status-confirmado { background: #dbeafe; color: #1e40af; }
    .status-en_preparacion { background: #e0e7ff; color: #3730a3; }
    .status-listo { background: #d1fae5; color: #065f46; }
    .status-entregado { background: #dcfce7; color: #166534; }
    .status-cancelado { background: #fee2e2; color: #991b1b; }
    .total-row {
      background: #1a1a1a !important;
      color: white !important;
      font-weight: bold;
    }
    .section {
      margin-top: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 10px;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 5px;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>Reporte Diario de Pedidos</h1>
  <div class="subtitle">${formatDate(report.date)}</div>

  <div class="summary">
    <div class="summary-item">
      <div class="summary-label">Total Pedidos</div>
      <div class="summary-value">${report.orderCount}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Importe Total</div>
      <div class="summary-value">${formatCurrency(report.totalAmount)}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Ticket Promedio</div>
      <div class="summary-value">${report.orderCount > 0 ? formatCurrency(report.totalAmount / report.orderCount) : '$0.00'}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Pedidos del Día</div>
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Hora</th>
          <th>Empresa</th>
          <th>Empleado</th>
          <th>Estado</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${report.orders.map(order => `
          <tr>
            <td>${order.order_code}</td>
            <td>${formatDateTime(order.created_at).split(' ')[1]}</td>
            <td>${(order.company as any)?.name || 'N/A'}</td>
            <td>${(order.user as any)?.full_name || 'N/A'}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${formatCurrency(order.total_amount)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="4"></td>
          <td>TOTAL</td>
          <td>${formatCurrency(report.totalAmount)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${report.companyBreakdown.length > 0 ? `
  <div class="section">
    <div class="section-title">Resumen por Empresa</div>
    <table>
      <thead>
        <tr>
          <th>Empresa</th>
          <th>Pedidos</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${report.companyBreakdown.map(company => `
          <tr>
            <td>${company.company.name}</td>
            <td>${company.orderCount}</td>
            <td>${formatCurrency(company.totalAmount)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 30px; font-size: 14px; cursor: pointer;">Imprimir / Guardar PDF</button>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Generate PDF HTML content for weekly report
 */
export function generateWeeklyReportPDF(report: WeeklyReportData): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte Semanal - ${formatDate(report.startDate)} a ${formatDate(report.endDate)}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #333;
      margin: 20px;
    }
    h1 {
      color: #1a1a1a;
      font-size: 20px;
      margin-bottom: 5px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .summary {
      display: flex;
      gap: 30px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .summary-item {
      flex: 1;
    }
    .summary-label {
      color: #666;
      font-size: 11px;
      text-transform: uppercase;
    }
    .summary-value {
      color: #1a1a1a;
      font-size: 24px;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #1a1a1a;
      color: white;
      padding: 10px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    .section {
      margin-top: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 10px;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 5px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .total-row {
      background: #1a1a1a !important;
      color: white !important;
      font-weight: bold;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
      .grid-2 { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>Reporte Semanal de Pedidos</h1>
  <div class="subtitle">${formatDate(report.startDate)} - ${formatDate(report.endDate)}</div>

  <div class="summary">
    <div class="summary-item">
      <div class="summary-label">Total Pedidos</div>
      <div class="summary-value">${report.orderCount}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Importe Total</div>
      <div class="summary-value">${formatCurrency(report.totalAmount)}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Promedio Diario</div>
      <div class="summary-value">${report.dailyBreakdown.length > 0 ? formatCurrency(report.totalAmount / report.dailyBreakdown.length) : '$0.00'}</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="section">
      <div class="section-title">Resumen Diario</div>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Pedidos</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${report.dailyBreakdown.map(day => `
            <tr>
              <td>${formatDate(day.date)}</td>
              <td>${day.orderCount}</td>
              <td>${formatCurrency(day.totalAmount)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td>TOTAL</td>
            <td>${report.orderCount}</td>
            <td>${formatCurrency(report.totalAmount)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Resumen por Empresa</div>
      <table>
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Pedidos</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${report.companyBreakdown.map(company => `
            <tr>
              <td>${company.company.name}</td>
              <td>${company.orderCount}</td>
              <td>${formatCurrency(company.totalAmount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Top 10 Platillos Más Pedidos</div>
    <table>
      <thead>
        <tr>
          <th>Platillo</th>
          <th>Cantidad</th>
          <th>Importe Total</th>
        </tr>
      </thead>
      <tbody>
        ${report.topDishes.map(dish => `
          <tr>
            <td>${dish.dishName}</td>
            <td>${dish.quantity}</td>
            <td>${formatCurrency(dish.totalAmount)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Detalle de Pedidos</div>
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Fecha/Hora</th>
          <th>Empresa</th>
          <th>Empleado</th>
          <th>Estado</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${report.orders.map(order => `
          <tr>
            <td>${order.order_code}</td>
            <td>${formatDateTime(order.created_at)}</td>
            <td>${(order.company as any)?.name || 'N/A'}</td>
            <td>${(order.user as any)?.full_name || 'N/A'}</td>
            <td>${order.status}</td>
            <td>${formatCurrency(order.total_amount)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="5"></td>
          <td>${formatCurrency(report.totalAmount)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 30px; font-size: 14px; cursor: pointer;">Imprimir / Guardar PDF</button>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Generate PDF HTML content for company report
 */
export function generateCompanyReportPDF(report: CompanyReportData): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte Empresa - ${report.company.name}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #333;
      margin: 20px;
    }
    h1 {
      color: #1a1a1a;
      font-size: 20px;
      margin-bottom: 5px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .summary {
      display: flex;
      gap: 30px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .summary-item {
      flex: 1;
    }
    .summary-label {
      color: #666;
      font-size: 11px;
      text-transform: uppercase;
    }
    .summary-value {
      color: #1a1a1a;
      font-size: 24px;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #1a1a1a;
      color: white;
      padding: 10px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    .section {
      margin-top: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 10px;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 5px;
    }
    .total-row {
      background: #1a1a1a !important;
      color: white !important;
      font-weight: bold;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>Reporte por Empresa</h1>
  <div class="subtitle">${report.company.name}</div>
  <div class="subtitle">${formatDate(report.startDate)} - ${formatDate(report.endDate)}</div>

  <div class="summary">
    <div class="summary-item">
      <div class="summary-label">Total Pedidos</div>
      <div class="summary-value">${report.orderCount}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Importe Total</div>
      <div class="summary-value">${formatCurrency(report.totalAmount)}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Ticket Promedio</div>
      <div class="summary-value">${formatCurrency(report.averageOrderAmount)}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Resumen por Empleado</div>
    <table>
      <thead>
        <tr>
          <th>Empleado</th>
          <th>Pedidos</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${report.employeeBreakdown.map(emp => `
          <tr>
            <td>${emp.employee.full_name || 'N/A'}</td>
            <td>${emp.orderCount}</td>
            <td>${formatCurrency(emp.totalAmount)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td>TOTAL</td>
          <td>${report.orderCount}</td>
          <td>${formatCurrency(report.totalAmount)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Detalle de Pedidos</div>
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Fecha/Hora</th>
          <th>Empleado</th>
          <th>Estado</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${report.orders.map(order => `
          <tr>
            <td>${order.order_code}</td>
            <td>${formatDateTime(order.created_at)}</td>
            <td>${(order.user as any)?.full_name || 'N/A'}</td>
            <td>${order.status}</td>
            <td>${formatCurrency(order.total_amount)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="4"></td>
          <td>${formatCurrency(report.totalAmount)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 30px; font-size: 14px; cursor: pointer;">Imprimir / Guardar PDF</button>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Generate PDF HTML content for employee report
 */
export function generateEmployeeReportPDF(report: EmployeeReportData): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte Empleado - ${report.employee.full_name || 'N/A'}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #333;
      margin: 20px;
    }
    h1 {
      color: #1a1a1a;
      font-size: 20px;
      margin-bottom: 5px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .summary {
      display: flex;
      gap: 30px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .summary-item {
      flex: 1;
    }
    .summary-label {
      color: #666;
      font-size: 11px;
      text-transform: uppercase;
    }
    .summary-value {
      color: #1a1a1a;
      font-size: 24px;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #1a1a1a;
      color: white;
      padding: 10px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    .section {
      margin-top: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 10px;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 5px;
    }
    .total-row {
      background: #1a1a1a !important;
      color: white !important;
      font-weight: bold;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>Reporte Personal de Pedidos</h1>
  <div class="subtitle">${report.employee.full_name || 'N/A'}</div>
  <div class="subtitle">${formatDate(report.startDate)} - ${formatDate(report.endDate)}</div>

  <div class="summary">
    <div class="summary-item">
      <div class="summary-label">Total Pedidos</div>
      <div class="summary-value">${report.orderCount}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Importe Total</div>
      <div class="summary-value">${formatCurrency(report.totalAmount)}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Ticket Promedio</div>
      <div class="summary-value">${formatCurrency(report.averageOrderAmount)}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Platillos Favoritos</div>
    <table>
      <thead>
        <tr>
          <th>Platillo</th>
          <th>Cantidad</th>
        </tr>
      </thead>
      <tbody>
        ${report.favoriteDishes.map(dish => `
          <tr>
            <td>${dish.dishName}</td>
            <td>${dish.quantity}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Detalle de Pedidos</div>
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Fecha/Hora</th>
          <th>Estado</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${report.orders.map(order => `
          <tr>
            <td>${order.order_code}</td>
            <td>${formatDateTime(order.created_at)}</td>
            <td>${order.status}</td>
            <td>${formatCurrency(order.total_amount)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="3"></td>
          <td>${formatCurrency(report.totalAmount)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 30px; font-size: 14px; cursor: pointer;">Imprimir / Guardar PDF</button>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Open report in new window for printing/PDF
 */
export function openReportPDF(htmlContent: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

/**
 * Generate filename for PDF report
 */
export function generatePDFFilename(
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

  return `reporte-${typeMap[type]}-${dateStr}_${timeStr}.pdf`;
}
