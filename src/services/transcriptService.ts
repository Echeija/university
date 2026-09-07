import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface OfficialTranscriptData {
  profile: any;
  transcriptData: {
    results: any[];
    semesters: any[];
    cumulative: any;
  };
}

import QRCode from 'qrcode';

export const transcriptService = {
  groupResultsBySemester: (results: any[]) => {
    const grouped = results.reduce((acc, curr) => {
      const key = `${curr.academicSession} - ${curr.semester}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {} as Record<string, any[]>);

    // Sort keys descending (newest first for display usually, but for transcript we want chronological)
    return Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(key => ({
      label: key,
      results: grouped[key]
    }));
  },

  generateOfficialTranscriptPDF: async (data: OfficialTranscriptData, token?: string): Promise<jsPDF> => {
    const { profile, transcriptData } = data;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL ACADEMIC TRANSCRIPT', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('SMART GLOBAL COLLEGE OF TECHNOLOGY', pageWidth / 2, 28, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(14, 32, pageWidth - 14, 32);

    // Student Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Details', 14, 42);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${profile.user.name}`, 14, 48);
    doc.text(`Matric No: ${profile.user.matricNo}`, 14, 54);
    doc.text(`Faculty: ${profile.user.faculty}`, 14, 60);
    doc.text(`Department: ${profile.user.department}`, 14, 66);
    
    doc.text(`Degree Classification: ${profile.degreeClassification}`, 120, 48);
    doc.text(`Academic Standing: ${profile.academicStanding}`, 120, 54);
    doc.setFont('helvetica', 'bold');
    doc.text(`Final CGPA: ${profile.cgpa ? profile.cgpa.toFixed(2) : '0.00'}`, 120, 60);
    doc.text(`Total Credits: ${profile.totalCreditUnits || 0}`, 120, 66);

    let startY = 76;

    // Results tables per semester
    const grouped = transcriptService.groupResultsBySemester(transcriptData.results);
    // Sort ascending for transcript chronological order
    const chronological = [...grouped].reverse();

    chronological.forEach((group: any) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(group.label, 14, startY);
      
      const [session, semester] = group.label.split(' - ');
      const semesterStats = transcriptData.semesters.find((s: any) => s.academicSession === session && s.semester === semester);

      const tableData = group.results.map((r: any) => [
        r.courseCode,
        r.courseTitle,
        (r.credits || 0).toString(),
        r.grade,
        (r.gradePoint || 0).toString(),
        (r.qualityPoint || 0).toString()
      ]);

      autoTable(doc, {
        startY: startY + 4,
        head: [['Code', 'Title', 'CU', 'Grade', 'GP', 'QP']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [4, 120, 87] }, // emerald-700
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 25 },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 15, halign: 'center' },
          5: { cellWidth: 15, halign: 'center' }
        },
      });

      startY = (doc as any).lastAutoTable.finalY;

      if (semesterStats) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(`Semester GPA: ${semesterStats.gpa.toFixed(2)}  |  Credits: ${semesterStats.totalCreditUnits}  |  Quality Points: ${semesterStats.totalQualityPoints.toFixed(2)}`, 14, startY + 6);
        startY += 16;
      } else {
        startY += 12;
      }
    });

    // Footer signature line
    if (startY > 250) {
      doc.addPage();
      startY = 20;
    }
    
    doc.setLineWidth(0.2);
    doc.line(pageWidth - 80, startY + 30, pageWidth - 20, startY + 30);
    doc.setFont('helvetica', 'normal');
    doc.text('Registrar Signature', pageWidth - 50, startY + 36, { align: 'center' });
    
    
    
    let verificationCode = data.profile.user.matricNo; // fallback
    if (token) {
        try {
            const res = await fetch('/api/student/transcripts/generate', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const resData = await res.json();
                if (resData.verificationCode) verificationCode = resData.verificationCode;
            }
        } catch(e) {
            console.error('Failed to register transcript', e);
        }
    }
    const verificationUrl = `${window.location.origin}/verify-transcript/${verificationCode}`;

    try {
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 80 });
      doc.addImage(qrDataUrl, 'PNG', 14, 250, 25, 25);
      doc.setFontSize(8);
      doc.text('Scan to Verify', 26.5, 278, { align: 'center' });
    } catch (e) {
      console.error('Failed to generate QR code', e);
    }

    doc.text('This is an electronically generated official transcript.', pageWidth / 2, 280, { align: 'center' });


    return doc;
  },

  downloadOfficialTranscript: async (data: OfficialTranscriptData, token?: string, filename?: string) => {
    const doc = await transcriptService.generateOfficialTranscriptPDF(data, token);
    doc.save(filename || `${data.profile.user.matricNo}_Transcript.pdf`);
  }
};
