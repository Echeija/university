const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `  app.post("/api/student/payments/:id/pay", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { reference } = req.body;
      const { payments } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq, and } = await import('drizzle-orm');
      
      // Verify payment with Paystack API
      const secret = process.env.PAYSTACK_SECRET_KEY;
      if (secret && secret !== 'YOUR_PAYSTACK_SECRET_KEY') {
        const verifyResponse = await fetch(\`https://api.paystack.co/transaction/verify/\${reference}\`, {
          headers: { Authorization: \`Bearer \${secret}\` }
        });
        const verifyData = await verifyResponse.json();
        
        if (!verifyData.status || verifyData.data.status !== 'success') {
          return res.status(400).json({ error: 'Payment verification failed' });
        }
      }
      
      const [updatedPayment] = await db.update(payments)
        .set({ status: 'successful' })
        .where(and(eq(payments.id, parseInt(id)), eq(payments.studentId, userId)))
        .returning();
        
      res.json(updatedPayment);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  });`;

const newCode = `  app.post("/api/student/payments/:id/pay", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { reference, amountPaid } = req.body;
      const { payments } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq, and } = await import('drizzle-orm');
      
      // Verify payment with Paystack API
      const secret = process.env.PAYSTACK_SECRET_KEY;
      if (secret && secret !== 'YOUR_PAYSTACK_SECRET_KEY') {
        const verifyResponse = await fetch(\`https://api.paystack.co/transaction/verify/\${reference}\`, {
          headers: { Authorization: \`Bearer \${secret}\` }
        });
        const verifyData = await verifyResponse.json();
        
        if (!verifyData.status || verifyData.data.status !== 'success') {
          return res.status(400).json({ error: 'Payment verification failed' });
        }
      }
      
      const currentPayments = await db.select().from(payments).where(and(eq(payments.id, parseInt(id)), eq(payments.studentId, userId)));
      if (currentPayments.length === 0) {
         return res.status(404).json({ error: 'Payment not found' });
      }
      const currentPayment = currentPayments[0];

      if (amountPaid && amountPaid < currentPayment.amount) {
         await db.insert(payments).values({
           studentId: currentPayment.studentId,
           amount: currentPayment.amount - amountPaid,
           purpose: currentPayment.purpose + ' (Balance)',
           userId: currentPayment.userId,
           session: currentPayment.session,
           semester: currentPayment.semester,
           reference: 'REF-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
           status: 'pending',
           createdAt: new Date(),
         });
         
         await db.update(payments)
          .set({ status: 'successful', amount: amountPaid })
          .where(and(eq(payments.id, parseInt(id)), eq(payments.studentId, userId)));
      } else {
        await db.update(payments)
          .set({ status: 'successful' })
          .where(and(eq(payments.id, parseInt(id)), eq(payments.studentId, userId)));
      }
        
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  });`;

if (code.includes('const { reference } = req.body;')) {
    code = code.replace(oldCode, newCode);
    fs.writeFileSync('server.ts', code);
    console.log("Updated server.ts successfully");
} else {
    console.log("Failed to find block in server.ts");
}
