import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee, WorkRecord, CompanySettings } from '../types';

const DEFAULT_COMPANY: CompanySettings = {
  company_name: 'Confecciones Quirúrgicas',
  address: '', phone: '', nit: '', email: '', logo_url: '',
};

export const generatePayslip = (
  employee: Employee,
  records: WorkRecord[],
  dateRange: { start: string; end: string },
  company?: CompanySettings
) => {
  const doc = new jsPDF();
  const co = company || DEFAULT_COMPANY;

  const TEAL: [number, number, number] = [20, 184, 166];
  const DARK: [number, number, number] = [15, 23, 42];
  const GRAY: [number, number, number] = [100, 116, 139];

  // Header
  doc.setFillColor(20, 184, 166);
  doc.rect(0, 0, 210, 25, 'F');
  doc.setFillColor(6, 182, 212);
  doc.rect(0, 0, 210, 3, 'F');

  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(co.company_name.toUpperCase(), 105, 12, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('RECIBO DE NÓMINA MENSUAL', 105, 18, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 195, 22, { align: 'right' });

  // Company info line
  if (co.nit || co.address || co.phone) {
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);
    const infoLine = [co.nit ? `NIT: ${co.nit}` : '', co.address, co.phone].filter(Boolean).join(' | ');
    doc.text(infoLine, 105, 24, { align: 'center' });
  }

  // Employee Info Box
  const infoY = 30;
  doc.setDrawColor(20, 184, 166);
  doc.setLineWidth(0.5);
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(10, infoY, 190, 20, 2, 2, 'FD');

  doc.setFontSize(7);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLEADO:', 14, infoY + 5);
  doc.text('DOCUMENTO:', 14, infoY + 10);
  doc.text('CARGO:', 14, infoY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.setFontSize(8);
  doc.text(employee.full_name, 35, infoY + 5);
  doc.text(`${employee.document_type} ${employee.document_id}`, 35, infoY + 10);
  doc.text(employee.position || 'Operario de Confección', 35, infoY + 15);

  doc.setFontSize(7);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('PERIODO:', 120, infoY + 5);
  doc.text('DESDE:', 120, infoY + 10);
  doc.text('HASTA:', 120, infoY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.setFontSize(8);
  doc.text(`${dateRange.start} - ${dateRange.end}`, 140, infoY + 5);
  doc.text(dateRange.start, 140, infoY + 10);
  doc.text(dateRange.end, 140, infoY + 15);

  doc.setDrawColor(20, 184, 166);
  doc.setLineWidth(0.3);
  doc.line(10, 52, 200, 52);

  // Table
  let totalAmount = 0;
  const tableData = records.map((record) => {
    const total = record.quantity * record.snapshot_unit_price;
    totalAmount += total;
    const date = new Date(record.date + 'T00:00:00');
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    return [
      formattedDate,
      record.snapshot_operation_name,
      record.quantity.toString(),
      `$${record.snapshot_unit_price.toLocaleString('es-CO')}`,
      `$${total.toLocaleString('es-CO')}`,
    ];
  });

  autoTable(doc, {
    startY: 55,
    head: [['FECHA', 'OPERACIÓN', 'CANT.', 'VALOR UNIT.', 'TOTAL']],
    body: tableData,
    foot: [['', '', '', 'TOTAL A PAGAR:', `$${totalAmount.toLocaleString('es-CO')}`]],
    theme: 'plain',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', cellPadding: 2, halign: 'center', lineWidth: { bottom: 0.5 }, lineColor: [20, 184, 166] },
    bodyStyles: { fontSize: 6.5, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 }, textColor: DARK, lineWidth: 0.1, lineColor: [226, 232, 240] },
    footStyles: { fillColor: [20, 184, 166], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'right', fontSize: 9, cellPadding: 3, lineWidth: 0 },
    columnStyles: {
      0: { cellWidth: 16, halign: 'center', fontSize: 6.5, fontStyle: 'bold' },
      1: { cellWidth: 'auto', halign: 'left', fontSize: 6.5 },
      2: { cellWidth: 14, halign: 'center', fontStyle: 'bold', fontSize: 7, fillColor: [240, 253, 250] },
      3: { cellWidth: 24, halign: 'right', font: 'courier', fontSize: 6.5 },
      4: { cellWidth: 26, halign: 'right', font: 'courier', fontStyle: 'bold', fontSize: 7.5, textColor: TEAL },
    },
    margin: { top: 8, bottom: 22, left: 10, right: 10 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.section === 'body') data.cell.styles.fontStyle = 'bold';
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  // Signatures
  const sigY = finalY + 12;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.3);
  doc.line(15, sigY, 70, sigY);
  doc.line(140, sigY, 195, sigY);
  doc.setFontSize(7);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.text('Firma del Empleado', 15, sigY + 4);
  doc.text('Firma del Empleador', 140, sigY + 4);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.text(employee.full_name, 15, sigY + 8);
  doc.text(co.company_name, 140, sigY + 8);

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 12, 210, 12, 'F');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Documento generado el ${new Date().toLocaleDateString('es-CO')} • ${co.company_name}`,
    105, pageHeight - 6, { align: 'center' }
  );
  doc.setDrawColor(20, 184, 166);
  doc.setLineWidth(1);
  doc.line(0, pageHeight - 12, 210, pageHeight - 12);

  doc.save(`Nomina_${employee.full_name.replace(/\s+/g, '_')}_${dateRange.start}_${dateRange.end}.pdf`);
};

export const generateConsolidatedPayroll = (
  employees: Employee[],
  records: WorkRecord[],
  dateRange: { start: string; end: string },
  company?: CompanySettings
) => {
  const doc = new jsPDF();
  const co = company || DEFAULT_COMPANY;

  // Header
  doc.setFillColor(20, 184, 166);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setFillColor(6, 182, 212);
  doc.rect(0, 0, 210, 3, 'F');

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(co.company_name.toUpperCase(), 105, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('NÓMINA GENERAL CONSOLIDADA', 105, 18, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`Periodo: ${dateRange.start} a ${dateRange.end}`, 105, 24, { align: 'center' });

  // Build summary per employee
  const empSummary: { name: string; income: number; deductions: number; net: number; recordCount: number }[] = [];
  const empIds = [...new Set(records.map((r) => r.employee_id))];

  empIds.forEach((empId) => {
    const emp = employees.find((e) => e.id === empId);
    const empRecords = records.filter((r) => r.employee_id === empId);
    let income = 0, deductions = 0;
    empRecords.forEach((r) => {
      const total = r.quantity * r.snapshot_unit_price;
      if (total >= 0) income += total;
      else deductions += Math.abs(total);
    });
    empSummary.push({
      name: emp?.full_name || 'Desconocido',
      income,
      deductions,
      net: income - deductions,
      recordCount: empRecords.length,
    });
  });

  empSummary.sort((a, b) => b.net - a.net);

  const totals = empSummary.reduce(
    (acc, e) => ({ income: acc.income + e.income, deductions: acc.deductions + e.deductions, net: acc.net + e.net }),
    { income: 0, deductions: 0, net: 0 }
  );

  const tableData = empSummary.map((e) => [
    e.name,
    e.recordCount.toString(),
    `$${e.income.toLocaleString('es-CO')}`,
    `$${e.deductions.toLocaleString('es-CO')}`,
    `$${e.net.toLocaleString('es-CO')}`,
  ]);

  autoTable(doc, {
    startY: 34,
    head: [['EMPLEADO', 'REGISTROS', 'INGRESOS', 'DESCUENTOS', 'NETO A PAGAR']],
    body: tableData,
    foot: [['TOTALES', '', `$${totals.income.toLocaleString('es-CO')}`, `$${totals.deductions.toLocaleString('es-CO')}`, `$${totals.net.toLocaleString('es-CO')}`]],
    theme: 'plain',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold', cellPadding: 3, halign: 'center' },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.5, textColor: [15, 23, 42], lineWidth: 0.1, lineColor: [226, 232, 240] },
    footStyles: { fillColor: [20, 184, 166], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      1: { halign: 'center', cellWidth: 22 },
      2: { halign: 'right', cellWidth: 30, font: 'courier' },
      3: { halign: 'right', cellWidth: 30, font: 'courier', textColor: [239, 68, 68] },
      4: { halign: 'right', cellWidth: 35, font: 'courier', fontStyle: 'bold', textColor: [20, 184, 166] },
    },
    margin: { top: 8, bottom: 22, left: 10, right: 10 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 12, 210, 12, 'F');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'italic');
  doc.text(`Nómina consolidada generada el ${new Date().toLocaleDateString('es-CO')} • ${co.company_name}`, 105, pageHeight - 6, { align: 'center' });
  doc.setDrawColor(20, 184, 166);
  doc.setLineWidth(1);
  doc.line(0, pageHeight - 12, 210, pageHeight - 12);

  doc.save(`Nomina_General_${dateRange.start}_${dateRange.end}.pdf`);
};
