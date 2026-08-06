const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

const replacement = `
        await EmailService.sendEmail(appRecord.email, subject, body);

        // Add real-time notification
        if (appRecord.applicantId) {
          try {
            const { notifications } = await import('./src/db/schema');
            await db.insert(notifications).values({
              userId: appRecord.applicantId,
              title: subject,
              message: \`Your application status has been updated to \${status}\`,
              type: status === 'admitted' ? 'success' : status === 'rejected' ? 'error' : 'info'
            });
          } catch (err) {
            console.error('Failed to insert application notification:', err);
          }
        }
      }
`;

serverCode = serverCode.replace(`        await EmailService.sendEmail(appRecord.email, subject, body);
      }`, replacement);

fs.writeFileSync('server.ts', serverCode);
