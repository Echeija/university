import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface TranscriptData {
  studentName: string;
  studentId: string;
  program: string;
  cgpa: string;
  session: string;
  dateGenerated: string;
  grades: {
    courseCode: string;
    courseTitle: string;
    credits: number;
    grade: string;
    points: number;
  }[];
}

export const transcriptService = {
  generateTranscriptPDF: (data: TranscriptData): jsPDF => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('Smart Global College of Technology', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('Official Academic Transcript', 105, 30, { align: 'center' });
    
    // Add horizontal line
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Add student details
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    
    // Left column
    doc.setFont('helvetica', 'bold');
    doc.text('Student Name:', 20, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(data.studentName, 55, 45);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Student ID:', 20, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(data.studentId, 55, 52);
    
    // Right column
    doc.setFont('helvetica', 'bold');
    doc.text('Program:', 120, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(data.program, 150, 45);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Session:', 120, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(data.session, 150, 52);
    
    // CGPA
    doc.setFont('helvetica', 'bold');
    doc.text('Current CGPA:', 20, 59);
    doc.setFont('helvetica', 'normal');
    doc.text(data.cgpa, 55, 59);
    
    // Academic Record Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Academic Record', 20, 70);
    
    const tableData = data.grades.map(g => [
      g.courseCode,
      g.courseTitle,
      g.credits.toString(),
      g.grade,
      g.points.toString()
    ]);
    
    autoTable(doc, {
      startY: 75,
      head: [['Course Code', 'Course Title', 'Credits', 'Grade', 'Points']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 5
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // slate-50
      }
    });
    
    // Add footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184); // slate-400
      
      const footerY = doc.internal.pageSize.height - 15;
      
      doc.text('This is a secure, computer-generated document and does not require a physical signature.', 105, footerY, { align: 'center' });
      doc.text(`Generated on ${data.dateGenerated}`, 105, footerY + 5, { align: 'center' });
      doc.text(`Page ${i} of ${pageCount}`, 190, footerY + 5, { align: 'right' });
    }
    
    return doc;
  },

  downloadTranscript: (data: TranscriptData, filename = 'academic_transcript.pdf') => {
    const doc = transcriptService.generateTranscriptPDF(data);
    doc.save(filename);
  }
};
