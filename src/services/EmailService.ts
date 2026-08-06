export class EmailService {
  static async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // In a real application, you would use a service like SendGrid, AWS SES, or Nodemailer here.
    // For this simulation, we will just log it to the console.
    console.log(`\n================= EMAIL TRIGGERED =================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`---------------------------------------------------`);
    console.log(`${body}`);
    console.log(`===================================================\n`);
  }
}
