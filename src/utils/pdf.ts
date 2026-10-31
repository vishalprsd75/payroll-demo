// ─── Meridian – PDF Payslip Generator ────────────────────────────────────────
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Payslip } from '../types';
import { formatCurrency, getMonthName } from './format';

export function generatePayslipPDF(payslip: Payslip): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ─── Company Header ──────────────────────────────────────────────
  doc.setFillColor(13, 148, 136); // teal-500
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MERIDIAN', margin, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Precision Payroll, Simplified.', margin, 25);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYSLIP', pageWidth - margin, 18, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${getMonthName(payslip.month)} ${payslip.year}`, pageWidth - margin, 26, { align: 'right' });

  y = 50;
  doc.setTextColor(28, 25, 23); // stone-900

  // ─── Employee Info Box ───────────────────────────────────────────
  doc.setFillColor(250, 250, 249); // stone-50
  doc.setDrawColor(214, 211, 209); // stone-300
  doc.roundedRect(margin, y, contentWidth, 36, 2, 2, 'FD');

  const col1 = margin + 5;
  const col2 = margin + contentWidth / 2 + 5;
  const lh = 7;

  y += 7;
  doc.setFontSize(8);
  doc.setTextColor(120, 113, 108); // stone-500
  doc.text('Employee Name', col1, y);
  doc.text('Employee ID', col2, y);
  y += 4.5;
  doc.setFontSize(10);
  doc.setTextColor(28, 25, 23);
  doc.setFont('helvetica', 'bold');
  doc.text(payslip.employee.name, col1, y);
  doc.text(payslip.employee.employeeId, col2, y);

  y += lh;
  doc.setFontSize(8);
  doc.setTextColor(120, 113, 108);
  doc.setFont('helvetica', 'normal');
  doc.text('Designation', col1, y);
  doc.text('Department', col2, y);
  y += 4.5;
  doc.setFontSize(10);
  doc.setTextColor(28, 25, 23);
  doc.setFont('helvetica', 'bold');
  doc.text(payslip.employee.designation, col1, y);
  doc.text(payslip.employee.department, col2, y);

  y += lh + 4;

  // ─── Payment Info ────────────────────────────────────────────────
  doc.setFillColor(250, 250, 249);
  doc.setDrawColor(214, 211, 209);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');
  const pi_y = y + 5;
  doc.setFontSize(8);
  doc.setTextColor(120, 113, 108);
  doc.setFont('helvetica', 'normal');
  const labels = ['PAN Number', 'UAN Number', 'Bank', 'Paid Days / LOP Days'];
  const values = [
    payslip.employee.panNumber,
    payslip.employee.uanNumber || '—',
    payslip.employee.bankName,
    `${payslip.paidDays} / ${payslip.lopDays}`,
  ];
  const colW = contentWidth / 4;
  labels.forEach((lbl, i) => {
    const x = margin + 5 + i * colW;
    doc.text(lbl, x, pi_y);
    doc.setFontSize(9);
    doc.setTextColor(28, 25, 23);
    doc.setFont('helvetica', 'bold');
    doc.text(values[i], x, pi_y + 5.5);
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 108);
    doc.setFont('helvetica', 'normal');
  });

  y += 24;

  // ─── Earnings & Deductions Table ─────────────────────────────────
  const maxRows = Math.max(payslip.earnings.length, payslip.deductions.length);
  const tableData: string[][] = [];

  for (let i = 0; i < maxRows; i++) {
    const earn = payslip.earnings[i];
    const ded = payslip.deductions[i];
    tableData.push([
      earn?.name || '',
      earn ? formatCurrency(earn.amount) : '',
      ded?.name || '',
      ded ? formatCurrency(ded.amount) : '',
    ]);
  }

  // Add totals row
  tableData.push([
    'Gross Earnings',
    formatCurrency(payslip.grossSalary),
    'Total Deductions',
    formatCurrency(payslip.totalDeductions),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Earnings', 'Amount (₹)', 'Deductions', 'Amount (₹)']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [13, 148, 136],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [28, 25, 23],
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.30 },
      1: { cellWidth: contentWidth * 0.20, halign: 'right' },
      2: { cellWidth: contentWidth * 0.30 },
      3: { cellWidth: contentWidth * 0.20, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [245, 245, 244]; // stone-100
      }
    },
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  y = doc.lastAutoTable.finalY + 10;

  // ─── Net Salary Box ──────────────────────────────────────────────
  doc.setFillColor(13, 148, 136);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('NET SALARY', margin + 8, y + 11);
  doc.setFontSize(16);
  doc.text(formatCurrency(payslip.netSalary), pageWidth - margin - 8, y + 12, { align: 'right' });

  y += 28;

  // ─── Footer ──────────────────────────────────────────────────────
  doc.setTextColor(120, 113, 108);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a system-generated payslip and does not require a physical signature.', pageWidth / 2, y, { align: 'center' });
  doc.text(`Generated by Meridian Payroll System  •  ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, y + 4, { align: 'center' });

  return doc;
}

export function downloadPayslipPDF(payslip: Payslip): void {
  const doc = generatePayslipPDF(payslip);
  doc.save(`Payslip_${payslip.employee.employeeId}_${getMonthName(payslip.month)}_${payslip.year}.pdf`);
}

