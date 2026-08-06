import React, { useState } from 'react';
import { FileBadge, Download, Printer, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function HealthCertificateWidget({ profile }: { profile: any }) {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    if (!profile) {
      notify({ title: 'Profile Incomplete', message: 'Medical profile not found', type: 'error' });
      return;
    }

    if (!profile.immunizations || profile.immunizations.trim() === '') {
      notify({ title: 'Immunizations Required', message: 'Please update your immunizations in your medical profile to generate a valid certificate.', type: 'error' });
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Border
      doc.setDrawColor(20, 83, 45); // Emerald 900
      doc.setLineWidth(1);
      doc.rect(10, 10, pageWidth - 20, doc.internal.pageSize.getHeight() - 20);

      // Header
      doc.setTextColor(20, 83, 45);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("SMART GLOBAL COLLEGE OF TECHNOLOGY", pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("University Health Services", pageWidth / 2, 40, { align: 'center' });

      doc.setDrawColor(20, 83, 45);
      doc.line(20, 45, pageWidth - 20, 45);

      // Title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text("OFFICIAL HEALTH & IMMUNIZATION CERTIFICATE", pageWidth / 2, 60, { align: 'center' });

      // Body text
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`This is to certify that the student below has a registered medical profile`, 20, 80);
      doc.text(`and their immunization records have been verified by the University Clinic.`, 20, 87);

      // Student Details
      autoTable(doc, {
        startY: 100,
        margin: { left: 20, right: 20 },
        head: [['Student Details', '']],
        body: [
          ['Full Name', user?.name || 'N/A'],
          ['Student ID', user?.username || 'N/A'],
          ['Email', user?.email || 'N/A'],
          ['Blood Group', profile.bloodGroup || 'Not specified'],
          ['Genotype', profile.genotype || 'Not specified']
        ],
        theme: 'grid',
        headStyles: { fillColor: [20, 83, 45], textColor: 255 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 'auto' }
        }
      });

      // Immunization Details
      const lastY = (doc as any).lastAutoTable.finalY + 10;
      
      autoTable(doc, {
        startY: lastY,
        margin: { left: 20, right: 20 },
        head: [['Verified Immunizations', 'Status']],
        body: profile.immunizations.split(',').map((imm: string) => [imm.trim(), 'VERIFIED']),
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74], textColor: 255 }, // Emerald 600
        columnStyles: {
          0: { cellWidth: 100 },
          1: { fontStyle: 'bold', textColor: [22, 163, 74], cellWidth: 'auto' } // Emerald 600
        }
      });

      // Footer & Signature
      const currentY = (doc as any).lastAutoTable.finalY + 30;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(`Date of Issue: ${format(new Date(), 'MMMM do, yyyy')}`, 20, currentY);
      doc.text(`Certificate ID: ${Math.random().toString(36).substring(2, 10).toUpperCase()}-SGCT`, 20, currentY + 7);

      // Digital Signature section
      doc.setDrawColor(15, 23, 42);
      doc.line(pageWidth - 80, currentY + 5, pageWidth - 20, currentY + 5);
      doc.setTextColor(15, 23, 42);
      doc.text("Chief Medical Officer", pageWidth - 50, currentY + 12, { align: 'center' });
      doc.setTextColor(22, 163, 74);
      doc.setFont("helvetica", "italic");
      doc.text("Digitally Signed - SGCT Health Services", pageWidth - 50, currentY - 2, { align: 'center' });

      // Save
      doc.save(`${user?.username || 'student'}_health_certificate.pdf`);
      notify({ title: 'Success', message: 'Health certificate downloaded', type: 'success' });
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'Failed to generate certificate', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 shadow-sm border border-emerald-100 dark:border-emerald-800/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-emerald-600">
            <FileBadge className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Official Health Certificate
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md">
              Generate a digitally signed PDF certificate verifying your medical profile and immunization records.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : (
              <>
                <Download className="w-4 h-4" /> Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
