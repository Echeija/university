const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

// Find the payment verification route
const paymentLogicStart = `        // Fully paid
        const [updated] = await db.update(payments)
          .set({ status: 'successful' })
          .where(eq(payments.id, existingPayment.id))
          .returning();
        updatedPayment = updated;
      }`;

const newPaymentLogic = `        // Fully paid
        const [updated] = await db.update(payments)
          .set({ status: 'successful' })
          .where(eq(payments.id, existingPayment.id))
          .returning();
        updatedPayment = updated;
      }
      
      // Generate and save digital receipt
      try {
        const { jsPDF } = await import('jspdf');
        const fs = await import('fs');
        const path = await import('path');
        const { users } = await import('./src/db/schema');
        const [student] = await db.select().from(users).where(eq(users.id, userId));
        
        const receiptsDir = path.join(process.cwd(), 'uploads', 'receipts');
        if (!fs.existsSync(receiptsDir)) {
          fs.mkdirSync(receiptsDir, { recursive: true });
        }
        
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('OFFICIAL PAYMENT RECEIPT', pageWidth / 2, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('UNIVERSITY OF EXCELLENCE', pageWidth / 2, 28, { align: 'center' });

        doc.setLineWidth(0.5);
        doc.line(14, 32, pageWidth - 14, 32);

        doc.setFontSize(11);
        doc.text(\`Date: \${new Date().toLocaleDateString()}\`, 14, 45);
        doc.text(\`Receipt No: \${reference}\`, 14, 52);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Student Details', 14, 65);
        doc.setFont('helvetica', 'normal');
        doc.text(\`Name: \${student?.name || 'Student'}\`, 14, 72);
        doc.text(\`Matric No: \${student?.username || 'N/A'}\`, 14, 79);
        doc.text(\`Department: \${student?.department || 'N/A'}\`, 14, 86);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Details', 14, 100);
        doc.setFont('helvetica', 'normal');
        doc.text(\`Purpose: \${existingPayment.purpose}\`, 14, 107);
        doc.text(\`Academic Session: \${existingPayment.session || 'N/A'}\`, 14, 114);
        doc.text(\`Semester: \${existingPayment.semester || 'N/A'}\`, 14, 121);
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(\`Amount Paid: NGN \${actualAmountPaid.toLocaleString()}\`, 14, 135);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('This is an electronically generated receipt.', pageWidth / 2, 250, { align: 'center' });
        
        const pdfPath = path.join(receiptsDir, \`\${reference}.pdf\`);
        fs.writeFileSync(pdfPath, doc.output());
      } catch (receiptError) {
        console.error('Failed to generate receipt:', receiptError);
      }`;

if (server.includes(paymentLogicStart)) {
  server = server.replace(paymentLogicStart, newPaymentLogic);
  fs.writeFileSync('server.ts', server);
  console.log('Payment verification logic updated with digital receipt generation.');
} else {
  console.log('Could not find the target string in server.ts.');
}
