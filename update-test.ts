import fs from 'fs';

let content = fs.readFileSync('src/tests/academic-workflow.test.ts', 'utf8');
content = content.replace(/await t\.test\('Transcript Generation'[\s\S]*?await t\.test\('Authorization'/g, `await t.test('Transcript Generation', async () => {
    const tr = await db.insert(schema.transcriptRequests).values({
      studentId: sId,
      destination: 'Test University',
      purpose: 'Further Studies',
      status: 'Processing',
    }).returning();
    
    assert.strictEqual(tr[0].status, 'Processing');
  });

  await t.test('Transcript Verification', async () => {
    // Generate an official transcript record
    const transcript = await db.insert(schema.transcripts).values({
      studentId: sId,
      generatedById: sId,
      verificationCode: \`TRN-\${Date.now()}\`,
      status: 'valid',
    }).returning();
    
    // Verify it exists and is valid
    const verificationCheck = await db.select().from(schema.transcripts).where(eq(schema.transcripts.verificationCode, transcript[0].verificationCode));
    assert.strictEqual(verificationCheck.length, 1);
    assert.strictEqual(verificationCheck[0].status, 'valid');
  });

  await t.test('Authorization'`);

// Add the delete for transcripts and transcript requests before users
content = content.replace(/await db\.delete\(schema\.users\)\.where\(eq\(schema\.users\.id, sId\)\);/g, `await db.delete(schema.transcripts).where(eq(schema.transcripts.studentId, sId));
  await db.delete(schema.transcriptRequests).where(eq(schema.transcriptRequests.studentId, sId));
  await db.delete(schema.resultAmendments).where(eq(schema.resultAmendments.resultId, resultId));
  await db.delete(schema.results).where(eq(schema.results.studentId, sId));
  await db.delete(schema.users).where(eq(schema.users.id, sId));`);

fs.writeFileSync('src/tests/academic-workflow.test.ts', content);
