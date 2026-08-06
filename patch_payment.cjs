const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

const updatedCode = `
      const [updatedPayment] = await db.update(payments)
        .set({ status: 'successful' })
        .where(and(eq(payments.id, parseInt(id)), eq(payments.studentId, userId)))
        .returning();
        
      if (!updatedPayment) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      // Add notification for successful payment
      try {
        const { notifications } = await import('./src/db/schema');
        await db.insert(notifications).values({
          userId,
          title: 'Payment Successful',
          message: \`Your payment for \${updatedPayment.purpose} has been received and processed.\`,
          type: 'success'
        });
      } catch (e) {
        console.error('Failed to create payment notification', e);
      }
      
      res.json({ success: true, payment: updatedPayment });
`;

serverCode = serverCode.replace(`      const [updatedPayment] = await db.update(payments)
        .set({ status: 'successful' })
        .where(and(eq(payments.id, parseInt(id)), eq(payments.studentId, userId)))
        .returning();
        
      if (!updatedPayment) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      res.json({ success: true, payment: updatedPayment });`, updatedCode);

fs.writeFileSync('server.ts', serverCode);
