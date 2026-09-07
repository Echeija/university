import crypto from 'crypto';
import { db } from './src/db/index.js';
import * as schema from './src/db/schema.js';
import { eq, and, desc, inArray, sql } from 'drizzle-orm';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import express from "express";
import multer from "multer";
import fs from "fs";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

interface ExtendedWebSocket extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

const userSockets = new Map<number, Set<ExtendedWebSocket>>();

function notifyUser(userId: number, payload: any) {
  const sockets = userSockets.get(userId);
  if (sockets) {
    const data = JSON.stringify(payload);
    sockets.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }
}

function broadcastUserStatus(userId: number, online: boolean) {
  const payload = JSON.stringify({ type: 'presence', userId, online });
  userSockets.forEach((sockets) => {
    sockets.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  });
}

// Ensure uploads directory exists
import os from 'os';
const uploadDir = path.join(os.tmpdir(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'))
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

import path from "path";
import { createServer as createViteServer } from "vite";
import { authRouter, requireAuth, requireRole } from "./src/server/auth";

async function startServer() {
  
  const app = express();

  // Enable trust proxy so rate limit works behind reverse proxy
  app.set('trust proxy', 1);

  
  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for local dev / iframe rendering compatibility
    crossOriginEmbedderPolicy: false
  }));
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });
  app.use('/api', limiter);

const verificationCodes = new Map<string, { code: string; expiresAt: number }>();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));


async function processMentions(db, users, notifications, content, authorId, link) {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentions = [...content.matchAll(mentionRegex)].map(m => m[1]);
  if (mentions.length > 0) {
    
    const allUsers = await db.select({ id: users.id, name: users.name }).from(users);
    const mentionedUsers = allUsers.filter(u => mentions.includes(u.name.replace(/\s+/g, '_')));
    
    if (mentionedUsers.length > 0) {
      const [author] = await db.select({ name: users.name }).from(users).where(eq(users.id, authorId));
      const authorName = author ? author.name : 'Someone';
      
      await db.insert(notifications).values(mentionedUsers.map(u => ({
        userId: u.id,
        title: 'You were mentioned',
        message: `${authorName} mentioned you in a discussion.`,
        type: 'info',
        isRead: 'false',
        createdAt: new Date()
      })));
    }
  }
}

  // --- API Routes ---

  app.post("/api/discussions/:discussionId/poll/vote", requireAuth, async (req, res) => {
    try {
      const { discussionId } = req.params;
      const { optionId } = req.body;
      const userId = (req as any).user.id;
      const { courseDiscussionPollVotes } = await import('./src/db/schema');
      
      
      
      // Delete existing vote
      await db.delete(courseDiscussionPollVotes)
        .where(and(
          eq(courseDiscussionPollVotes.discussionId, parseInt(discussionId)),
          eq(courseDiscussionPollVotes.userId, userId)
        ));
      
      // Insert new vote
      await db.insert(courseDiscussionPollVotes).values({
        discussionId: parseInt(discussionId),
        optionId: parseInt(optionId),
        userId
      });
      
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to vote' });
    }
  });

  app.delete("/api/discussions/:discussionId/poll/vote", requireAuth, async (req, res) => {
    try {
      const { discussionId } = req.params;
      const userId = (req as any).user.id;
      const { courseDiscussionPollVotes } = await import('./src/db/schema');
      
      
      
      await db.delete(courseDiscussionPollVotes)
        .where(and(
          eq(courseDiscussionPollVotes.discussionId, parseInt(discussionId)),
          eq(courseDiscussionPollVotes.userId, userId)
        ));
      
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to unvote' });
    }
  });



  app.get("/api/cms/media", requireAuth, (req, res) => {
    try {
      const files = fs.readdirSync(uploadDir);
      const images = files
        .filter(f => f.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))
        .map(f => ({ url: `/uploads/${f}`, name: f }));
      res.json(images);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to read media' });
    }
  });

  app.post("/api/upload", requireAuth, upload.single('document'), (req, res) => {
    if (!(req as any).file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${(req as any).file.filename}`;
    res.json({ fileUrl });
  });

  app.post("/api/upload/base64", requireAuth, (req, res) => {
    try {
      const { filename, base64Data, mimeType } = req.body;
      if (!base64Data) return res.status(400).json({ error: 'No data' });
      
      const base64DataStripped = base64Data.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const safeFilename = uniqueSuffix + '-' + filename.replace(/\s+/g, '_');
      const filepath = path.join(uploadDir, safeFilename);
      
      fs.writeFileSync(filepath, base64DataStripped, 'base64');
      res.json({ fileUrl: `/uploads/${safeFilename}` });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to upload' });
    }
  });


  app.post("/api/clinic/chat", requireAuth, async (req, res) => {
    try {
      const { message, history } = req.body;
      const { GoogleGenAI } = await import("@google/genai");
      
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const contents = Array.isArray(history) ? history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })) : [];
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents,
        config: {
          systemInstruction: "You are a helpful and empathetic AI triage assistant for a university student clinic. Your role is to answer common health inquiries, provide general wellness advice, and help triage non-emergency medical symptoms. Always include a disclaimer that you are an AI and not a substitute for professional medical advice. For severe symptoms (e.g., chest pain, difficulty breathing, severe bleeding), urge the user to seek immediate emergency medical care."
        }
      });

      res.json({ text: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to generate clinic response' });
    }
  });
  app.post("/api/gemini/assistant", requireAuth, async (req, res) => {
    try {
      const { message, history } = req.body;
      const { GoogleGenAI } = await import("@google/genai");
      
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const contents = Array.isArray(history) ? history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })) : [];
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: "You are a helpful AI-powered student assistant for the Smart Global College of Technology (SGCT) portal. You answer frequently asked questions about university policies, campus maps, administrative procedures, schedules, and resources. Be polite, concise, and helpful."
        }
      });

      res.json({ text: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  });
  // Submit inquiry
  app.post("/api/inquiries", async (req, res) => {
    try {
      const { inquiries } = await import('./src/db/schema');
      
      
      const { name, email, phone, courseOfStudy, message } = req.body;
      
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
      }
      
      await db.insert(inquiries).values({
        name,
        email,
        phone,
        courseOfStudy,
        message,
        createdAt: new Date(),
      });
      
      res.json({ success: true, message: 'Inquiry submitted successfully' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to submit inquiry' });
    }
  });

  // Get all inquiries for admin
  app.get("/api/admin/inquiries", requireAuth, requireRole(['Administrator', 'Registrar', 'ICT Admin', 'Admission Officer']), async (req, res) => {
    try {
      const { inquiries } = await import('./src/db/schema');
      
      const allInquiries = await db.select().from(inquiries);
      res.json(allInquiries);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
  });

  
// --- Admission Letter Template API ---
const templatePath = path.join(os.tmpdir(), 'admission_template.json');
app.get('/api/registrar/admission-template', requireAuth, (req, res) => {
  if ((req as any).user.role !== 'Registrar' && (req as any).user.role !== 'Applicant') return res.status(403).json({ error: 'Forbidden' });
  try {
    if (fs.existsSync(templatePath)) {
      const data = fs.readFileSync(templatePath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json({ content: 'We are pleased to inform you that you have been offered provisional admission to the University of Excellence to pursue a degree in **[PROGRAM]**.\n\nThis offer is subject to the verification of your qualifications and payment of the required acceptance fees. Please log in to your portal to complete the necessary registration processes.\n\nCongratulations on your admission, and we look forward to welcoming you to our campus.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read template' });
  }
});

app.post('/api/registrar/admission-template', requireAuth, (req, res) => {
  if ((req as any).user.role !== 'Registrar') return res.status(403).json({ error: 'Forbidden' });
  try {
    const { content } = req.body;
    fs.writeFileSync(templatePath, JSON.stringify({ content }));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save template' });
  }
});
// ------------------------------------

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Auth Routes
  app.use("/api/auth", authRouter);

  // General Audit Route
  app.post("/api/audit", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { action, details } = req.body;
      const { AuditLogger } = await import('./src/services/AuditLogger');
      await AuditLogger.log(userId, action, details);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to log audit event' });
    }
  });

  // --- Student Endpoints ---

  // Get all courses
  
  app.get("/api/alumni/spotlight", async (req, res) => {
    try {
      // Mocked data for Alumni Spotlight
      const spotlights = [
        {
          id: 1,
          name: "Dr. Elena Rodriguez",
          graduationYear: 2018,
          degree: "Computer Science",
          currentRole: "Lead AI Researcher at TechCorp",
          quote: "Smart Global gave me the technical foundation and critical thinking skills to push the boundaries of machine learning.",
          imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200"
        },
        {
          id: 2,
          name: "James Chen",
          graduationYear: 2021,
          degree: "Software Engineering",
          currentRole: "Founder & CEO, Innovate Startup",
          quote: "The entrepreneurial ecosystem and mentorship at the college were instrumental in launching my own company.",
          imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200"
        },
        {
          id: 3,
          name: "Sarah Jenkins",
          graduationYear: 2015,
          degree: "Information Technology",
          currentRole: "Cybersecurity Director, Global Bank",
          quote: "The rigorous coursework prepared me for the real-world challenges I face every day in securing enterprise networks.",
          imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200"
        }
      ];
      res.json(spotlights);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch alumni spotlights' });
    }
  });

  
  app.get("/api/course-catalog", async (req, res) => {
    try {
      const { courses, departments, courseAllocations, users } = await import('./src/db/schema');
      
      
      
      const allCourses = await db.select({
        id: courses.id,
        code: courses.code,
        title: courses.title,
        credits: courses.credits,
        semester: courses.semester,
        prerequisites: courses.prerequisites,
        department: departments.name,
      }).from(courses)
        .leftJoin(departments, eq(courses.departmentId, departments.id));

      const allocations = await db.select({
        courseId: courseAllocations.courseId,
        lecturerName: users.name,
      }).from(courseAllocations)
        .leftJoin(users, eq(courseAllocations.lecturerId, users.id));

      const allocationsMap = allocations.reduce((acc, curr) => {
        if (!acc[curr.courseId]) acc[curr.courseId] = [];
        if (curr.lecturerName && !acc[curr.courseId].includes(curr.lecturerName)) {
           acc[curr.courseId].push(curr.lecturerName);
        }
        return acc;
      }, {});

      const result = allCourses.map(c => ({
        ...c,
        instructors: allocationsMap[c.id] || []
      }));
      
      res.json(result);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch course catalog' });
    }
  });

  app.get("/api/courses", async (req, res) => {
    try {
      const { courses } = await import('./src/db/schema');
      
      const allCourses = await db.select().from(courses);
      res.json(allCourses);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  // Get registered courses for student
  app.get("/api/student/courses", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { studentCourses, courses } = await import('./src/db/schema');
      
      
      
      const registered = await db.select({
        id: studentCourses.id,
        course: courses,
        status: studentCourses.status,
      }).from(studentCourses)
        .leftJoin(courses, eq(studentCourses.courseId, courses.id))
        .where(eq(studentCourses.studentId, userId));
        
      res.json(registered);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch registered courses' });
    }
  });

  // Get academic results for student
  
  app.get("/api/student/gradebook", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { results, courses } = await import('./src/db/schema');
      
      
      
      const academicResults = await db.select({
        id: results.id,
        course: courses,
        score: results.score,
        grade: results.grade,
        semester: results.semester,
      }).from(results)
        .leftJoin(courses, eq(results.courseId, courses.id))
        .where(and(eq(results.studentId, userId), eq(results.status, 'published')));
        
      // For demonstration, adding mock feedback and trend data
      const gradebookData = academicResults.map((result, i) => {
        const feedbacks = [
          "Excellent analytical skills shown in the final project.",
          "Good participation, but needs to work on timely submissions.",
          "Outstanding grasp of the core concepts.",
          "Steady improvement throughout the semester."
        ];
        const trends = ["up", "down", "flat", "up"];
        
        return {
          ...result,
          feedback: feedbacks[i % feedbacks.length],
          trend: trends[i % trends.length],
          points: result.grade === 'A' ? 4.0 : result.grade === 'B' ? 3.0 : result.grade === 'C' ? 2.0 : 1.0
        };
      });
      
      res.json(gradebookData);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch gradebook' });
    }
  });

  app.get("/api/student/results", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { results, courses } = await import('./src/db/schema');
      
      

      const academicResults = await db.select({
        id: results.id,
        course: courses,
        score: results.score,
        grade: results.grade,
        semester: results.semester,
      }).from(results)
        .leftJoin(courses, eq(results.courseId, courses.id))
        .where(
          and(
            eq(results.studentId, userId),
            eq(results.status, 'published')
          )
        );

      res.json(academicResults);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch results' });
    }
  });

  // Get payments for student
  app.get("/api/student/payments", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { payments } = await import('./src/db/schema');
      
      

      const studentPayments = await db.select().from(payments)
        .where(eq(payments.studentId, userId))
        .orderBy(desc(payments.createdAt));
      res.json(studentPayments);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  });

  // Get student balance
  app.get("/api/student/balance", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { payments } = await import('./src/db/schema');
      
      

      const studentPayments = await db.select().from(payments).where(eq(payments.studentId, userId));
      const totalPaid = studentPayments
        .filter(p => p.status === 'successful')
        .reduce((sum, p) => sum + p.amount, 0);
        
      const balance = studentPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);
        
      const totalExpected = totalPaid + balance;
      
      res.json({ totalExpected, totalPaid, balance });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  });

  // Generate invoice
  app.post("/api/student/invoices", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { amount, purpose, session, semester } = req.body;
      const { payments } = await import('./src/db/schema');
      

      const reference = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const [newInvoice] = await db.insert(payments).values({
        studentId: userId,
        amount,
        purpose,
        session,
        semester,
        reference,
        status: 'pending',
        createdAt: new Date(),
      }).returning();

      res.json(newInvoice);
    } catch (e) {
      res.status(500).json({ error: 'Failed to generate invoice' });
    }
  });

  // Process mock payment
  
  // Paystack Webhook Endpoint
  app.post("/api/paystack/webhook", express.json({type: 'application/json'}), async (req, res) => {
    try {
      const crypto = await import('crypto');
      const secret = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';
      const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
      
      if (hash === req.headers['x-paystack-signature']) {
        const event = req.body;
        if (event.event === 'charge.success') {
          const reference = event.data.reference;
          const { payments } = await import('./src/db/schema');
          
          
          
          await db.update(payments)
            .set({ status: 'successful' })
            .where(eq(payments.reference, reference));
        }
      }
      res.sendStatus(200);
    } catch (e) {
      console.error('Webhook error:', e);
      res.sendStatus(500);
    }
  });
  app.post("/api/student/payments/:id/pay", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { reference, amountPaid } = req.body;
      const { payments } = await import('./src/db/schema');
      
      
      
      // Verify payment with Paystack API
      const secret = process.env.PAYSTACK_SECRET_KEY;
      if (secret && secret !== 'YOUR_PAYSTACK_SECRET_KEY') {
        const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: { Authorization: `Bearer ${secret}` }
        });
        const verifyData = await verifyResponse.json();
        
        if (!verifyData.status || verifyData.data.status !== 'success') {
          return res.status(400).json({ error: 'Payment verification failed' });
        }
      }
      

      const [existingPayment] = await db.select().from(payments)
        .where(and(eq(payments.id, parseInt(id)), eq(payments.studentId, userId)));

      if (!existingPayment) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      let updatedPayment = existingPayment;
      const actualAmountPaid = amountPaid || existingPayment.amount;

      if (actualAmountPaid < existingPayment.amount) {
        // Create a receipt for the partial payment
        await db.insert(payments).values({
          studentId: userId,
          amount: actualAmountPaid,
          purpose: existingPayment.purpose + ' (Installment)',
          reference: reference, // Paystack ref
          status: 'successful',
          createdAt: new Date(),
          userId: existingPayment.userId,
          session: existingPayment.session,
          semester: existingPayment.semester
        });
        
        // Update existing invoice remaining amount
        const [updated] = await db.update(payments)
          .set({ amount: existingPayment.amount - actualAmountPaid })
          .where(eq(payments.id, existingPayment.id))
          .returning();
        updatedPayment = updated;
      } else {
        // Fully paid
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
        
        const receiptsDir = path.join(uploadDir, 'receipts');
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
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 45);
        doc.text(`Receipt No: ${reference}`, 14, 52);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Student Details', 14, 65);
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${student?.name || 'Student'}`, 14, 72);
        doc.text(`Matric No: ${student?.username || 'N/A'}`, 14, 79);
        doc.text(`Department: ${student?.department || 'N/A'}`, 14, 86);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Details', 14, 100);
        doc.setFont('helvetica', 'normal');
        doc.text(`Purpose: ${existingPayment.purpose}`, 14, 107);
        doc.text(`Academic Session: ${existingPayment.session || 'N/A'}`, 14, 114);
        doc.text(`Semester: ${existingPayment.semester || 'N/A'}`, 14, 121);
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`Amount Paid: NGN ${actualAmountPaid.toLocaleString()}`, 14, 135);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('This is an electronically generated receipt.', pageWidth / 2, 250, { align: 'center' });
        
        const pdfPath = path.join(receiptsDir, `${reference}.pdf`);
        fs.writeFileSync(pdfPath, doc.output());
      } catch (receiptError) {
        console.error('Failed to generate receipt:', receiptError);
      }
        
      if (!updatedPayment) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      // Add notification for successful payment
      try {
        const { notifications } = await import('./src/db/schema');
        await db.insert(notifications).values({
          userId,
          title: 'Payment Successful',
          message: `Your payment of ₦${amountPaid || existingPayment?.amount} for ${updatedPayment.purpose} has been received and processed.`,
          type: 'success'
        });
      } catch (e) {
        console.error('Failed to create payment notification', e);
      }
      
      res.json({ success: true, payment: updatedPayment });

    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Payment processing failed' });
    }
  });

  // Submit anonymous course evaluation
  app.post("/api/student/evaluations", requireAuth, async (req, res) => {
    try {
      const { courseId, rating, feedback, semester } = req.body;
      const { courseEvaluations } = await import("./src/db/schema");
      const { db } = await import("./src/db");

      const [newEval] = await db.insert(courseEvaluations).values({
        courseId,
        rating,
        feedback,
        semester,
        createdAt: new Date(),
      }).returning();

      res.json({ success: true, evaluation: newEval });
    } catch (e) {
      res.status(500).json({ error: "Failed to submit evaluation" });
    }
  });

  
  // Get all course evaluations for reporting
  app.get("/api/admin/evaluations", requireAuth, requireRole(['Administrator', 'Admin', 'ICT Admin', 'Lecturer']), async (req, res) => {
    try {
      const { courseEvaluations, courses } = await import("./src/db/schema");
      const { db } = await import("./src/db");
      const { eq, desc } = await import("drizzle-orm");
      
      const evals = await db.select({
        id: courseEvaluations.id,
        courseId: courseEvaluations.courseId,
        courseCode: courses.code,
        courseTitle: courses.title,
        rating: courseEvaluations.rating,
        feedback: courseEvaluations.feedback,
        semester: courseEvaluations.semester,
        createdAt: courseEvaluations.createdAt,
      }).from(courseEvaluations)
        .innerJoin(courses, eq(courseEvaluations.courseId, courses.id))
        .orderBy(desc(courseEvaluations.createdAt));

      res.json(evals);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch evaluations" });
    }
  });

  // Get courses for evaluation (registered courses)
  app.get("/api/student/evaluations/courses", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { studentCourses, courses } = await import("./src/db/schema");
      const { db } = await import("./src/db");
      const { eq } = await import("drizzle-orm");

      const enrolled = await db.select({
        id: courses.id,
        code: courses.code,
        title: courses.title,
        semester: studentCourses.semester
      }).from(studentCourses)
        .innerJoin(courses, eq(studentCourses.courseId, courses.id))
        .where(eq(studentCourses.studentId, userId));

      res.json(enrolled);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  // Register for a course
  app.post("/api/student/courses", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { courseId, semester } = req.body;
      const { studentCourses } = await import('./src/db/schema');
      
      const { AuditLogger } = await import('./src/services/AuditLogger');
      
      await db.insert(studentCourses).values({
        studentId: userId,
        courseId,
        semester: semester || '1st',
        status: 'draft'
      });
      
      await AuditLogger.log(userId, 'COURSE_REGISTER', `Registered for course ID ${courseId}`);
      
      res.json({ success: true, message: 'Registered successfully' });
    } catch (e) {
      res.status(500).json({ error: 'Failed to register for course' });
    }
  });

  
  app.post("/api/student/courses/submit", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { studentCourses } = await import('./src/db/schema');
      
      
      const { AuditLogger } = await import('./src/services/AuditLogger');
      
      await db.update(studentCourses)
        .set({ status: 'pending_approval' })
        .where(
          and(
            eq(studentCourses.studentId, userId),
            eq(studentCourses.status, 'draft')
          )
        );
        
      await AuditLogger.log(userId, 'COURSE_SUBMIT', `Submitted courses for advisor approval`);
      
      res.json({ success: true, message: 'Courses submitted successfully' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to submit courses' });
    }
  });

  app.delete("/api/student/courses/:courseId", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { courseId } = req.params;
      const { studentCourses } = await import('./src/db/schema');
      
      
      const { AuditLogger } = await import('./src/services/AuditLogger');
      
      await db.delete(studentCourses).where(
        and(
          eq(studentCourses.studentId, userId),
          eq(studentCourses.courseId, parseInt(courseId, 10))
        )
      );
      
      await AuditLogger.log(userId, 'COURSE_DROP', `Dropped course ID ${courseId}`);
      
      res.json({ success: true, message: 'Course dropped successfully' });
    } catch (e) {
      res.status(500).json({ error: 'Failed to drop course' });
    }
  });

  // --- Admin Endpoints ---
  app.get("/api/admin/users", requireAuth, requireRole(['Administrator', 'ICT Admin']), async (req, res) => {
    try {
      const { users } = await import('./src/db/schema');
      
      const allUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      }).from(users);
      res.json(allUsers);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post("/api/admin/users", requireAuth, requireRole(['Administrator', 'ICT Admin']), async (req, res) => {
    try {
      const { name, email, role, password } = req.body;
      const { users } = await import('./src/db/schema');
      const { AuditLogger } = await import('./src/services/AuditLogger');
      
      const actorRole = (req as any).user.role;
      if (actorRole !== 'Administrator' && role === 'Administrator') {
          return res.status(403).json({ error: "Unauthorized: Cannot create Administrator" });
      }

      // simple check
      if (!name || !email || !role || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const [newUser] = await db.insert(users).values({
        name,
        email,
        role,
        password, // In a real app, hash this password
        createdAt: new Date(),
      }).returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

      const userId = (req as any).user.id;
      await AuditLogger.log(userId, 'CREATE_USER', `Created user ${email} with role ${role}`);

      res.json({ success: true, user: newUser });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });
  app.get("/api/admin/fees", requireAuth, requireRole(["Administrator", "ICT Admin"]), async (req, res) => {
    try {
      const { feeSettings } = await import("./src/db/schema");
      const { db } = await import("./src/db");
      const allFees = await db.select().from(feeSettings);
      res.json(allFees);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch fee settings" });
    }
  });

  app.post("/api/admin/fees", requireAuth, requireRole(["Administrator", "ICT Admin"]), async (req, res) => {
    try {
      const { type, amount, description, level, department, programme, indigene, session, semester, deadline } = req.body;
      const { feeSettings } = await import("./src/db/schema");
      const { db } = await import("./src/db");
      const { AuditLogger } = await import("./src/services/AuditLogger");
      const [newFee] = await db.insert(feeSettings).values({
        type,
        amount,
        description,
        level,
        department,
        programme,
        indigene,
        session,
        semester, deadline: deadline ? new Date(deadline) : null, updatedAt: new Date(), }).returning();
      const userId = (req as any).user.id;
      await AuditLogger.log(userId, "CREATE_FEE", `Created fee ${type} for ${amount}`);
      const { eq } = await import("drizzle-orm");
      
      // Notify students
      const { users, notifications } = await import("./src/db/schema");
      const students = await db.select({ id: users.id }).from(users).where(eq(users.role, 'Student'));
      
      if (students.length > 0) {
        const notificationsData = students.map(s => ({
          userId: s.id,
          title: 'New Fee Assigned',
          message: `A new fee: ${type} (₦${amount}) has been assigned.`,
          type: 'warning',
          isRead: 'false',
          createdAt: new Date()
        }));
        await db.insert(notifications).values(notificationsData);
      }


      res.json({ success: true, fee: newFee });
    } catch (e) {
      console.error(e); res.status(500).json({ error: "Failed to create fee setting: " + (e as any).message });
    }
  });

  app.put("/api/admin/fees/:id", requireAuth, requireRole(["Administrator", "ICT Admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { type, amount, description, level, department, programme, indigene, session, semester, deadline } = req.body;
      const { feeSettings } = await import("./src/db/schema");
      const { db } = await import("./src/db");
      const { eq } = await import("drizzle-orm");
      const { AuditLogger } = await import("./src/services/AuditLogger");
      const [updatedFee] = await db.update(feeSettings)
        .set({ type, amount, description, level, department, programme, indigene, session, semester, updatedAt: new Date() })
        .where(eq(feeSettings.id, parseInt(id)))
        .returning();
      const userId = (req as any).user.id;
      await AuditLogger.log(userId, "UPDATE_FEE", `Updated fee ${type}`);
      res.json({ success: true, fee: updatedFee });
    } catch (e) {
      res.status(500).json({ error: "Failed to update fee setting" });
    }
  });

  app.delete("/api/admin/fees/:id", requireAuth, requireRole(["Administrator", "ICT Admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { feeSettings } = await import("./src/db/schema");
      const { db } = await import("./src/db");
      const { eq } = await import("drizzle-orm");
      const { AuditLogger } = await import("./src/services/AuditLogger");
      const [feeToDelete] = await db.select().from(feeSettings).where(eq(feeSettings.id, parseInt(id)));
      if (!feeToDelete) return res.status(404).json({ error: "Fee not found" });
      await db.delete(feeSettings).where(eq(feeSettings.id, parseInt(id)));
      const userId = (req as any).user.id;
      await AuditLogger.log(userId, "DELETE_FEE", `Deleted fee ${feeToDelete.type}`);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete fee setting" });
    }
  });

  app.put("/api/admin/users/:id", requireAuth, requireRole(["Administrator", "ICT Admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role, password } = req.body;
      const { users } = await import("./src/db/schema");
      const { db } = await import("./src/db");
      const { eq } = await import("drizzle-orm");
      const { AuditLogger } = await import("./src/services/AuditLogger");

      const actorRole = (req as any).user.role;
      // Prevent role escalation
      let finalRole = role;
      if (actorRole !== 'Administrator' && role === 'Administrator') {
          return res.status(403).json({ error: "Unauthorized: Cannot escalate to Administrator" });
      }
      
      const updateData: any = { name, email, role: finalRole };
      if (password) updateData.password = password;

      const [updatedUser] = await db.update(users)
        .set(updateData)
        .where(eq(users.id, parseInt(id)))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
        });

      const userId = (req as any).user.id;
      await AuditLogger.log(userId, "UPDATE_USER", `Updated user ${email} with role ${role}`);

      // Send Account Status Notification
      const { notifications } = await import('./src/db/schema');
      await db.insert(notifications).values({
        userId: updatedUser.id,
        title: 'Account Status Update',
        message: `Your account details have been updated by an Administrator.`,
        type: 'info',
        isRead: 'false'
      });

      res.json({ success: true, user: updatedUser });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAuth, requireRole(["Administrator", "ICT Admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { users } = await import("./src/db/schema");
      const { db } = await import("./src/db");
      const { eq } = await import("drizzle-orm");
      const { AuditLogger } = await import("./src/services/AuditLogger");

      // Find user before deleting
      const [userToDelete] = await db.select().from(users).where(eq(users.id, parseInt(id)));
      if (!userToDelete) return res.status(404).json({ error: "User not found" });

      await db.delete(users).where(eq(users.id, parseInt(id)));

      const userId = (req as any).user.id;
      await AuditLogger.log(userId, "DELETE_USER", `Deleted user ${userToDelete.email}`);

      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });



  app.get("/api/admin/result-audit-logs", requireAuth, requireRole(['Administrator', 'Registrar', 'ICT Admin']), async (req, res) => {
    try {
      const { alias } = await import('drizzle-orm/pg-core');
      const studentUsers = alias(schema.users, 'student_users');
      
      const logs = await db.select({
        id: schema.resultAuditLogs.id,
        action: schema.resultAuditLogs.action,
        role: schema.resultAuditLogs.role,
        oldCa: schema.resultAuditLogs.oldCa,
        newCa: schema.resultAuditLogs.newCa,
        oldExam: schema.resultAuditLogs.oldExam,
        newExam: schema.resultAuditLogs.newExam,
        oldGrade: schema.resultAuditLogs.oldGrade,
        newGrade: schema.resultAuditLogs.newGrade,
        reason: schema.resultAuditLogs.reason,
        ipAddress: schema.resultAuditLogs.ipAddress,
        createdAt: schema.resultAuditLogs.createdAt,
        user: {
          name: schema.users.name,
          email: schema.users.email
        },
        student: {
          matricNo: studentUsers.username,
          name: studentUsers.name
        },
        course: {
          code: schema.courses.code
        }
      })
      .from(schema.resultAuditLogs)
      .leftJoin(schema.users, eq(schema.resultAuditLogs.userId, schema.users.id))
      .leftJoin(studentUsers, eq(schema.resultAuditLogs.studentId, studentUsers.id))
      .leftJoin(schema.courses, eq(schema.resultAuditLogs.courseId, schema.courses.id))
      .orderBy(desc(schema.resultAuditLogs.createdAt));

      res.json(logs);
    } catch(e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch result audit logs" });
    }
  });

  app.get("/api/admin/audit", requireAuth, requireRole(['Administrator', 'ICT Admin']), async (req, res) => {
    try {
      const { auditTrails, users } = await import('./src/db/schema');
      
      const { desc, eq } = await import('drizzle-orm');
      const trails = await db.select({
        id: auditTrails.id,
        action: auditTrails.action,
        details: auditTrails.details,
        createdAt: auditTrails.createdAt,
        user: {
          name: users.name,
          email: users.email,
          role: users.role
        }
      }).from(auditTrails)
      .leftJoin(users, eq(auditTrails.userId, users.id))
      .orderBy(desc(auditTrails.createdAt))
      .limit(100);
      res.json(trails);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch audit trails' });
    }
  });

  // --- Lecturer Endpoints ---
  
  // Calendar Events
  
  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const { calendarEvents } = await import('./src/db/schema');
      
      const { gte, asc, and, eq, ilike } = await import('drizzle-orm');
      
      const category = req.query.category as string;
      
      let query = db.select()
        .from(calendarEvents)
        .where(
          and(
            gte(calendarEvents.startTime, new Date()),
            category && category !== 'All' ? eq(calendarEvents.type, category) : undefined
          )
        )
        .orderBy(asc(calendarEvents.startTime))
        .limit(20);
        
      const events = await query;
        
      res.json(events);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch upcoming events' });
    }
  });

  app.get("/api/calendar/events", requireAuth, async (req, res) => {
    try {
      const { calendarEvents } = await import('./src/db/schema');
      
      
      
      const events = await db.select()
        .from(calendarEvents)
        .where(eq(calendarEvents.userId, (req as any).user.id));
        
      res.json(events);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  app.post("/api/calendar/events", requireAuth, async (req, res) => {
    try {
      const { courseId, title, type, startTime, endTime, description } = req.body;
      const { calendarEvents } = await import('./src/db/schema');
      
      
      const [newEvent] = await db.insert(calendarEvents).values({
        courseId: courseId || null,
        userId: (req as any).user.id,
        title,
        type,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        description
      }).returning();
      
      // Notify students if it's related to a course
      if (courseId) {
        const { studentCourses, notifications } = await import('./src/db/schema');
        
        const enrolledStudents = await db.select({ studentId: studentCourses.studentId })
          .from(studentCourses)
          .where(eq(studentCourses.courseId, courseId));
          
        if (enrolledStudents.length > 0) {
          const notificationsData = enrolledStudents.map(s => ({
            userId: s.studentId,
            title: `New ${type}`,
            message: `${title} has been scheduled for ${new Date(startTime).toLocaleString()}.`,
            type: type === 'Assignment Deadline' ? 'warning' : 'info',
            isRead: 'false'
          }));
          await db.insert(notifications).values(notificationsData);
        }
      }
      
      res.json(newEvent);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create event' });
    }
  });


  app.put("/api/calendar/events/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { courseId, title, type, startTime, endTime, description } = req.body;
      const { calendarEvents, studentCourses, notifications } = await import('./src/db/schema');
      
      
      
      const [updatedEvent] = await db.update(calendarEvents).set({
        courseId: courseId || null,
        title,
        type,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        description
      }).where(and(eq(calendarEvents.id, parseInt(id)), eq(calendarEvents.userId, (req as any).user.id))).returning();
      
      // Notify students if it's related to a course
      if (courseId) {
        const enrolledStudents = await db.select({ studentId: studentCourses.studentId })
          .from(studentCourses)
          .where(eq(studentCourses.courseId, courseId));
          
        if (enrolledStudents.length > 0) {
          const notificationsData = enrolledStudents.map(s => ({
            userId: s.studentId,
            title: `${type} Changed`,
            message: `${title} has been updated to ${new Date(startTime).toLocaleString()}.`,
            type: type === 'Assignment Deadline' ? 'warning' : 'info',
            isRead: 'false'
          }));
          await db.insert(notifications).values(notificationsData);
        }
      }
      
      res.json(updatedEvent);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update event' });
    }
  });

  app.delete("/api/calendar/events/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { calendarEvents } = await import('./src/db/schema');
      
      
      
      await db.delete(calendarEvents).where(and(eq(calendarEvents.id, parseInt(id)), eq(calendarEvents.userId, (req as any).user.id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  });

  app.get("/api/lecturer/courses", requireAuth, requireRole(['Lecturer', 'Administrator', 'HOD', 'Dean']), async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      
      const [activeSession] = await db.select().from(schema.academicSessions).where(eq(schema.academicSessions.isActive, true));
      const currentSessionName = activeSession?.name || '2024/2025';

      const whereClause = userRole === 'Lecturer'
         ? and(eq(schema.courseAllocations.lecturerId, userId), eq(schema.courseAllocations.academicYear, currentSessionName))
         : eq(schema.courseAllocations.academicYear, currentSessionName);

      const allCourses = await db.select({
        id: schema.courses.id,
        code: schema.courses.code,
        title: schema.courses.title,
        credits: schema.courses.credits,
        departmentId: schema.courses.departmentId,
        semester: schema.courses.semester,
        studentsCount: sql`count(${schema.studentCourses.studentId})`.mapWith(Number)
      })
      .from(schema.courses)
      .innerJoin(schema.courseAllocations, eq(schema.courses.id, schema.courseAllocations.courseId))
      .leftJoin(schema.studentCourses, and(
          eq(schema.courses.id, schema.studentCourses.courseId),
          eq(schema.studentCourses.status, 'registered')
      ))
      .where(whereClause)
      .groupBy(schema.courses.id, schema.courseAllocations.id);
      
      res.json(allCourses);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch lecturer courses' });
    }
});

  app.get("/api/lecturer/grading/:courseId", requireAuth, requireRole(['Lecturer']), async (req, res) => {
    try {
      const { courseId } = req.params;
      const { studentCourses, users, results, courses } = await import('./src/db/schema');
      
      

      const [course] = await db.select().from(courses).where(eq(courses.id, parseInt(courseId)));

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Get students registered for this course
      const students = await db.select({
        studentId: users.id,
        studentName: users.name,
        matricNo: users.email, // using email as matric for now
        resultId: results.id,
        score: results.score,
        grade: results.grade,
      }).from(studentCourses)
        .innerJoin(users, eq(studentCourses.studentId, users.id))
        .leftJoin(results, and(eq(results.studentId, users.id), eq(results.courseId, parseInt(courseId))))
        .where(eq(studentCourses.courseId, parseInt(courseId)));

      res.json({ course, students });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch grading list' });
    }
  });

  app.post("/api/lecturer/grading/:courseId", requireAuth, requireRole(['Lecturer']), async (req, res) => {
    try {
      const { courseId } = req.params;
      const { grades } = req.body; // Array of { studentId, score, grade, resultId }
      
      const { results, courses } = await import('./src/db/schema');
      
      
      const { AuditLogger } = await import('./src/services/AuditLogger');

      const [course] = await db.select().from(courses).where(eq(courses.id, parseInt(courseId)));
      const semester = course ? course.semester : '1st';

      // Simple implementation: for each grade, insert or update
      for (const g of grades) {
        if (g.score !== null && g.grade) {
          if (g.resultId) {
            await db.update(results)
              .set({ score: g.score, grade: g.grade })
              .where(eq(results.id, g.resultId));
          } else {
            await db.insert(results)
              .values({
                studentId: g.studentId,
                courseId: parseInt(courseId),
                score: g.score,
                grade: g.grade,
                semester: semester
              });
          }
        }
      }

      const userId = (req as any).user.id;
      await AuditLogger.log(userId, 'SUBMIT_GRADES', `Submitted grades for course ID ${courseId}`);

      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to save grades' });
    }
  });

  // --- Applicant Endpoints ---
  app.get("/api/applicant/status", requireAuth, requireRole(['Applicant']), async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { applications } = await import('./src/db/schema');
      
      
      
      const appRecord = await db.select().from(applications).where(eq(applications.userId, userId));
      res.json({ application: appRecord[0] || null });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch application' });
    }
  });

  app.get("/api/applicant/next-reg-no", requireAuth, requireRole(['Applicant', 'Administrator', 'Registrar']), async (req, res) => {
    try {
      const { applications } = await import('./src/db/schema');
      
      const { count, eq } = await import('drizzle-orm');
      const result = await db.select({ value: count() }).from(applications);
      const nextId = (result[0]?.value || 0) + 1;
      const regNo = "SGCT/APP/" + String(nextId).padStart(4, '0');
      res.json({ regNo });
    } catch (e) {
      res.status(500).json({ error: 'Failed to generate registration number' });
    }
  });


  app.post("/api/applicant/verify-code", async (req, res) => {
    try {
      const { email, code } = req.body;
      const record = verificationCodes.get(email);
      
      if (!record) return res.status(400).json({ error: 'No verification code found. Please request a new one.' });
      if (Date.now() > record.expiresAt) {
        verificationCodes.delete(email);
        return res.status(400).json({ error: 'Verification code expired.' });
      }
      if (record.code !== code) return res.status(400).json({ error: 'Invalid verification code.' });
      
      verificationCodes.delete(email);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to verify code' });
    }
  });

  app.post("/api/applicant/submit", requireAuth, requireRole(['Applicant']), async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { 
        passport, firstName, middleName, lastName, regNo, email, dob, address, 
        nationality, indigene, lga, level, department, courseOfStudy, 
        maritalStatus, religion, nextOfKinName, nextOfKinAddress, 
        sponsorName, sponsorAddress, fslcDocument, ssceDocument, birthCertificate, 
        stateOfOriginDocument, otherDocument1, otherDocument2, otherDocument3, otherDocument4, otherDocument5, programOfInterest, session
      } = req.body;
      const { applications } = await import('./src/db/schema');
      
      const { AuditLogger } = await import('./src/services/AuditLogger');
      
      const fullName = `${firstName} ${lastName}`;

      const [newApp] = await db.insert(applications).values({
        userId,
        passport,
        fullName,
        firstName, middleName, lastName, regNo, email, dob, address, 
        nationality, indigene, lga, level, department, courseOfStudy, 
        maritalStatus, religion, nextOfKinName, nextOfKinAddress, 
        sponsorName, sponsorAddress, fslcDocument, ssceDocument, 
        stateOfOriginDocument, otherDocument1, otherDocument2, otherDocument3, otherDocument4, otherDocument5,
        programOfInterest, session, birthCertificate: birthCertificate || '', status: 'pending',
        createdAt: new Date()
      }).returning();
      
      await AuditLogger.log(userId, 'APPLICATION_SUBMIT', `Submitted application for ${programOfInterest}`);
      
      res.json({ success: true, application: newApp });
    } catch (e) {
      res.status(500).json({ error: 'Failed to submit application' });
    }
  });

  // --- Registrar Endpoints ---
  app.get("/api/registrar/applications", requireAuth, requireRole(['Registrar', 'Administrator', 'Admission Officer']), async (req, res) => {
    try {
      const { applications } = await import('./src/db/schema');
      
      
      const allApps = await db.select().from(applications);
      res.json(allApps);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  });

  app.post("/api/registrar/applications/:id/status", requireAuth, requireRole(['Registrar', 'Administrator', 'Admission Officer']), async (req, res) => {
    try {
      const { id } = req.params;
      const { status, screeningNotes, interviewDate } = req.body;
      const { applications } = await import('./src/db/schema');
      
      
      const { AuditLogger } = await import('./src/services/AuditLogger');
      const { EmailService } = await import('./src/services/EmailService');
      
      const [appRecord] = await db.select().from(applications).where(eq(applications.id, parseInt(id)));

      await db.update(applications)
        .set({ status, screeningNotes: screeningNotes || null })
        .where(eq(applications.id, parseInt(id)));
        
      if (appRecord && appRecord.email && status !== appRecord.status) {
        let subject = 'Application Status Update';
        let body = `Dear ${appRecord.fullName || 'Applicant'},

Your admission application status has been updated to: ${status.toUpperCase()}.

Log into your portal for more details.`;

        if (status === 'admitted') {
          subject = 'Congratulations! You have been offered Admission';
          body = `Dear ${appRecord.fullName || 'Applicant'},

We are pleased to inform you that you have been offered provisional admission.

Please log into the admission portal to view and print your admission letter, and proceed with your acceptance fee payment.

Best regards,
University Admissions Board`;
        } else if (status === 'rejected') {
          subject = 'Update on Your Admission Application';
          body = `Dear ${appRecord.fullName || 'Applicant'},

We regret to inform you that your application for admission was not successful at this time.

Thank you for your interest in our institution.

Best regards,
University Admissions Board`;
        } else if (status === 'under review') {
          subject = 'Your Application is Under Review';
          body = `Dear ${appRecord.fullName || 'Applicant'},

Your application is now under review by our admission officers.

We will notify you once a decision has been made or if we need further information.

Best regards,
University Admissions Board`;
        } else if (status === 'interview scheduled') {
          subject = 'Interview Scheduled for Your Application';
          let interviewString = '';
          let icsAttachment = '';
          if (interviewDate) {
            const dateObj = new Date(interviewDate);
            interviewString = `\n\nYour interview is scheduled for: ${dateObj.toLocaleString()}\n`;
            
            // Format for ICS
            const dtStart = dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const endObj = new Date(dateObj.getTime() + 60 * 60 * 1000); // 1 hour later
            const dtEnd = endObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            
            icsAttachment = `
\n\n--- CALENDAR INVITE (interview.ics) ---
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//University of Excellence//Admissions//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Admission Interview - ${appRecord.fullName}
DTSTART:${dtStart}
DTEND:${dtEnd}
DESCRIPTION:Admission interview for ${appRecord.programOfInterest}.
LOCATION:Virtual / Admission Office
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR
---------------------------------------`;
          }

          body = `Dear ${appRecord.fullName || 'Applicant'},\n\nYour application has progressed to the interview stage.${interviewString}\nPlease log into your portal for details regarding your scheduled interview.\n\nBest regards,\nUniversity Admissions Board${icsAttachment}`;
        }


        await EmailService.sendEmail(appRecord.email, subject, body);

        // Add real-time notification
        if (appRecord.userId) {
          try {
            const { notifications } = await import('./src/db/schema');
            await db.insert(notifications).values({
              userId: appRecord.userId,
              title: subject,
              message: `Your application status has been updated to ${status}`,
              type: status === 'admitted' ? 'success' : status === 'rejected' ? 'error' : 'info'
            });
          } catch (err) {
            console.error('Failed to insert application notification:', err);
          }
        }
      }

      
      const userId = (req as any).user.id;
      await AuditLogger.log(userId, 'UPDATE_APPLICATION_STATUS', `Updated application ${id} status to ${status}`);
        
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update application status' });
    }
  });

  // --- Bursary Endpoints ---
  app.get("/api/bursary/payments", requireAuth, requireRole(['Bursary', 'Administrator']), async (req, res) => {
    try {
      const { payments, users } = await import('./src/db/schema');
      
      
      
      const allPayments = await db.select({
        id: payments.id,
        amount: payments.amount,
        purpose: payments.purpose,
        reference: payments.reference,
        status: payments.status,
        createdAt: payments.createdAt,
        studentName: users.name,
        studentEmail: users.email
      }).from(payments)
        .innerJoin(users, eq(payments.studentId, users.id));
        
      res.json(allPayments);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  });

  app.get("/api/departments", async (req, res) => {
    try {
      const { departments } = await import('./src/db/schema');
      
      const depts = await db.select().from(departments);
      res.json(depts);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  });

  app.get("/api/faculties", requireAuth, requireRole(['Administrator']), async (req, res) => {
    try {
      const { faculties, departments, courses, studentCourses } = await import('./src/db/schema');
      
      const { eq, sql } = await import('drizzle-orm');
      
      const allFaculties = await db.select().from(faculties);
      
      // Get department counts
      const deptCounts = await db.select({
        facultyId: departments.facultyId,
        count: sql<number>`cast(count(${departments.id}) as int)`
      }).from(departments).where(sql`faculty_id IS NOT NULL`).groupBy(departments.facultyId);
      
      // Get student counts
      const studentCounts = await db.select({
        facultyId: departments.facultyId,
        count: sql<number>`cast(count(distinct ${studentCourses.studentId}) as int)`
      }).from(studentCourses)
      .leftJoin(courses, eq(studentCourses.courseId, courses.id))
      .leftJoin(departments, eq(courses.departmentId, departments.id))
      .where(sql`faculty_id IS NOT NULL`)
      .groupBy(departments.facultyId);

      const enriched = allFaculties.map(f => {
        const dCount = deptCounts.find(d => d.facultyId === f.id)?.count || 0;
        const sCount = studentCounts.find(s => s.facultyId === f.id)?.count || 0;
        return { ...f, departmentCount: dCount, studentCount: sCount };
      });
      
      res.json(enriched);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch faculties' });
    }
  });

  app.post("/api/faculties", requireAuth, requireRole(['Administrator']), async (req, res) => {
    try {
      const { name, description } = req.body;
      const { faculties } = await import('./src/db/schema');
      
      
      const [newFaculty] = await db.insert(faculties).values({
        name,
        description
      }).returning();
      
      res.json(newFaculty);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create faculty' });
    }
  });

  app.put("/api/faculties/:id", requireAuth, requireRole(['Administrator']), async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const { faculties } = await import('./src/db/schema');
      
      
      
      await db.update(faculties).set({ name, description }).where(eq(faculties.id, parseInt(id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update faculty' });
    }
  });

  app.delete("/api/faculties/:id", requireAuth, requireRole(['Administrator']), async (req, res) => {
    try {
      const { id } = req.params;
      const { faculties } = await import('./src/db/schema');
      
      
      
      await db.delete(faculties).where(eq(faculties.id, parseInt(id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete faculty' });
    }
  });

  app.post("/api/departments/bulk", requireAuth, requireRole(['Administrator']), async (req, res) => {
    try {
      const { departments: deptsData } = req.body;
      if (!Array.isArray(deptsData)) {
        return res.status(400).json({ error: 'Expected an array of departments' });
      }
      const { departments } = await import('./src/db/schema');
      
      
      const newDepts = await db.insert(departments).values(deptsData.map(d => ({
        name: d.name,
        description: d.description || '',
        facultyId: d.facultyId ? parseInt(d.facultyId) : null
      }))).returning();
      
      res.json(newDepts);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create departments' });
    }
  });

  app.post("/api/departments", requireAuth, requireRole(['Administrator']), async (req, res) => {
    try {
      const { name, description, facultyId } = req.body;
      const { departments } = await import('./src/db/schema');
      
      
      const [newDept] = await db.insert(departments).values({
        name,
        description,
        facultyId: facultyId ? parseInt(facultyId) : null
      }).returning();
      
      res.json(newDept);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create department' });
    }
  });

  app.delete("/api/departments/:id", requireAuth, requireRole(['Administrator']), async (req, res) => {
    try {
      const { id } = req.params;
      const { departments } = await import('./src/db/schema');
      
      
      
      await db.delete(departments).where(eq(departments.id, parseInt(id)));
      
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete department' });
    }
  });
  
  app.get("/api/departments/:id/courses", async (req, res) => {
    try {
      const { id } = req.params;
      const { courses } = await import('./src/db/schema');
      
      
      
      const deptCourses = await db.select().from(courses).where(eq(courses.departmentId, parseInt(id)));
      res.json(deptCourses);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  app.put("/api/departments/:id", requireAuth, requireRole(['Administrator']), async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const { departments } = await import('./src/db/schema');
      
      
      
      const [updatedDept] = await db.update(departments).set({ name, description, facultyId: req.body.facultyId ? parseInt(req.body.facultyId) : null }).where(eq(departments.id, parseInt(id))).returning();
      res.json(updatedDept);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update department' });
    }
  });

  app.put("/api/courses/:id", requireAuth, requireRole(['Administrator']), async (req, res) => {
    try {
      const { id } = req.params;
      const { code, title, credits, semester, type, contributesToGpa, contributesToCgpa, contributesToCreditUnits } = req.body;
      const { courses } = await import('./src/db/schema');
      
      
      
      const [updatedCourse] = await db.update(courses).set({
        code,
        title,
        credits: parseInt(credits),
        semester,
        type: type || 'Core',
        contributesToGpa: contributesToGpa !== undefined ? contributesToGpa : true,
        contributesToCgpa: contributesToCgpa !== undefined ? contributesToCgpa : true,
        contributesToCreditUnits: contributesToCreditUnits !== undefined ? contributesToCreditUnits : true,
      }).where(eq(courses.id, parseInt(id))).returning();
      
      res.json(updatedCourse);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update course' });
    }
  });

  app.delete("/api/courses/:id", requireAuth, requireRole(['Administrator']), async (req, res) => {
    try {
      const { id } = req.params;
      const { courses } = await import('./src/db/schema');
      
      
      
      await db.delete(courses).where(eq(courses.id, parseInt(id)));
      
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete course' });
    }
  });

  app.post("/api/courses/bulk", requireAuth, requireRole(['Administrator']), async (req, res) => {
    try {
      const { courses: coursesData } = req.body;
      if (!Array.isArray(coursesData)) {
        return res.status(400).json({ error: 'Expected an array of courses' });
      }
      const { courses } = await import('./src/db/schema');
      
      
      const newCourses = await db.insert(courses).values(coursesData.map(c => ({
        code: c.code,
        title: c.title,
        credits: parseInt(c.credits),
        departmentId: parseInt(c.departmentId),
        semester: c.semester || '1st'
      }))).returning();
      
      res.json(newCourses);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create courses' });
    }
  });

  // Academic Dashboard Routes

  app.get("/api/academic/reports/enrollment", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { studentCourses, courses, users } = await import('./src/db/schema');
      
      const { eq, sql } = await import('drizzle-orm');
      
      const enrollments = await db.select({
        courseCode: courses.code,
        courseTitle: courses.title,
        credits: courses.credits,
        studentName: users.name,
        studentEmail: users.email,
        semester: studentCourses.semester,
        status: studentCourses.status
      })
      .from(studentCourses)
      .innerJoin(courses, eq(studentCourses.courseId, courses.id))
      .innerJoin(users, eq(studentCourses.studentId, users.id));

      res.json(enrollments);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch enrollment report' });
    }
  });

  app.get("/api/academic/reports/performance", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { results, courses, users } = await import('./src/db/schema');
      
      
      
      const performance = await db.select({
        courseCode: courses.code,
        courseTitle: courses.title,
        studentName: users.name,
        studentEmail: users.email,
        semester: results.semester,
        score: results.score,
        grade: results.grade
      })
      .from(results)
      .innerJoin(courses, eq(results.courseId, courses.id))
      .innerJoin(users, eq(results.studentId, users.id));

      res.json(performance);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch performance report' });
    }
  });

  app.get("/api/academic/courses", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { courses } = await import('./src/db/schema');
      
      const allCourses = await db.select().from(courses);
      res.json(allCourses);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  app.get("/api/academic/lecturers", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { users } = await import('./src/db/schema');
      
      
      const lecturers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email
      }).from(users).where(eq(users.role, 'Lecturer'));
      res.json(lecturers);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch lecturers' });
    }
  });

  app.get("/api/academic/timetables", requireAuth, async (req, res) => {
    try {
      const { timetables, courses } = await import('./src/db/schema');
      
      
      
      const tt = await db.select({
        id: timetables.id,
        courseId: timetables.courseId,
        courseCode: courses.code,
        courseTitle: courses.title,
        dayOfWeek: timetables.dayOfWeek,
        startTime: timetables.startTime,
        endTime: timetables.endTime,
        venue: timetables.venue
      })
      .from(timetables)
      .leftJoin(courses, eq(timetables.courseId, courses.id))
      .orderBy(desc(timetables.createdAt));
      
      res.json(tt);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch timetables' });
    }
  });

  app.post("/api/academic/timetables", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { courseId, dayOfWeek, startTime, endTime, venue } = req.body;
      const { timetables, courses } = await import('./src/db/schema');
      
      
      
      // Conflict Detection Logic
      // Check for same day and venue
      const existingEntries = await db.select()
        .from(timetables)
        .where(and(
          eq(timetables.dayOfWeek, dayOfWeek),
          eq(timetables.venue, venue)
        ));
      
      const toMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const newStart = toMinutes(startTime);
      const newEnd = toMinutes(endTime);
      
      let conflict = null;
      for (const entry of existingEntries) {
        const existingStart = toMinutes(entry.startTime);
        const existingEnd = toMinutes(entry.endTime);
        
        // Overlap condition:
        if (Math.max(newStart, existingStart) < Math.min(newEnd, existingEnd)) {
          conflict = entry;
          break;
        }
      }
      
      if (conflict) {
        // Fetch conflicting course name
        const conflictingCourse = await db.select().from(courses).where(eq(courses.id, conflict.courseId)).limit(1);
        const courseName = conflictingCourse.length > 0 ? conflictingCourse[0].code : 'Unknown Course';
        return res.status(409).json({ error: `Scheduling Conflict: Overlaps with ${courseName} (${conflict.startTime} - ${conflict.endTime}) in ${venue}.` });
      }
      
      const [newTt] = await db.insert(timetables).values({
        courseId: parseInt(courseId),
        dayOfWeek,
        startTime,
        endTime,
        venue,
        uploadedById: (req as any).user.id
      }).returning();
      res.json(newTt);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create timetable' });
    }
  });

  app.delete("/api/academic/timetables/:id", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { id } = req.params;
      const { timetables } = await import('./src/db/schema');
      
      
      
      await db.delete(timetables).where(eq(timetables.id, parseInt(id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete timetable' });
    }
  });

  app.get("/api/academic/allocations", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { courseAllocations, courses, users } = await import('./src/db/schema');
      
      
      
      const allocs = await db.select({
        id: courseAllocations.id,
        courseId: courseAllocations.courseId,
        courseCode: courses.code,
        courseTitle: courses.title,
        lecturerId: courseAllocations.lecturerId,
        lecturerName: users.name,
        academicYear: courseAllocations.academicYear,
        semester: courseAllocations.semester
      })
      .from(courseAllocations)
      .leftJoin(courses, eq(courseAllocations.courseId, courses.id))
      .leftJoin(users, eq(courseAllocations.lecturerId, users.id))
      .orderBy(desc(courseAllocations.createdAt));
      
      res.json(allocs);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch allocations' });
    }
  });

  app.post("/api/academic/allocations", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { courseId, lecturerId, academicYear, semester } = req.body;
      const { courseAllocations } = await import('./src/db/schema');
      
      
      const [newAlloc] = await db.insert(courseAllocations).values({
        courseId: parseInt(courseId),
        lecturerId: parseInt(lecturerId),
        academicYear,
        semester,
        allocatedById: (req as any).user.id
      }).returning();
      res.json(newAlloc);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create allocation' });
    }
  });

  app.delete("/api/academic/allocations/:id", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { id } = req.params;
      const { courseAllocations } = await import('./src/db/schema');
      
      
      
      await db.delete(courseAllocations).where(eq(courseAllocations.id, parseInt(id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete allocation' });
    }
  });

  app.get("/api/academic/attendance", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { lecturerAttendance, timetables, courses, users } = await import('./src/db/schema');
      
      
      
      const atts = await db.select({
        id: lecturerAttendance.id,
        lecturerId: lecturerAttendance.lecturerId,
        lecturerName: users.name,
        courseCode: courses.code,
        date: lecturerAttendance.date,
        status: lecturerAttendance.status,
        notes: lecturerAttendance.notes
      })
      .from(lecturerAttendance)
      .leftJoin(users, eq(lecturerAttendance.lecturerId, users.id))
      .leftJoin(courses, eq(lecturerAttendance.courseId, courses.id))
      .orderBy(desc(lecturerAttendance.date));
      
      res.json(atts);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch attendance' });
    }
  });

  app.post("/api/academic/attendance", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { lecturerId, courseId, timetableId, date, status, notes } = req.body;
      const { lecturerAttendance } = await import('./src/db/schema');
      
      
      const [newAtt] = await db.insert(lecturerAttendance).values({
        lecturerId: parseInt(lecturerId),
        courseId: courseId ? parseInt(courseId) : null,
        timetableId: timetableId ? parseInt(timetableId) : null,
        date: new Date(date),
        status,
        notes,
        markedById: (req as any).user.id
      }).returning();
      res.json(newAtt);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to log attendance' });
    }
  });

  // Calendar fallback (since my previous patch might have missed it too)
  app.get("/api/academic/calendar-events", requireAuth, async (req, res) => {
    try {
      const { academicCalendarEvents } = await import('./src/db/schema');
      
      const { asc } = await import('drizzle-orm');
      
      const events = await db.select()
        .from(academicCalendarEvents)
        .orderBy(asc(academicCalendarEvents.startDate));
      res.json(events);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
  });

  // Space Management Routes
  app.get("/api/academic/spaces", requireAuth, async (req, res) => {
    try {
      const { campusSpaces } = await import('./src/db/schema');
      
      const spaces = await db.select().from(campusSpaces);
      spaces.forEach((s: any) => {
        try { s.equipment = JSON.parse(s.equipment || '[]'); } catch(e) { s.equipment = []; }
      });
      res.json(spaces);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch spaces' });
    }
  });

  app.post("/api/academic/spaces", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { name, capacity, type, equipment } = req.body;
      const { campusSpaces } = await import('./src/db/schema');
      
      const eqString = equipment ? JSON.stringify(equipment) : '[]';
      const [newSpace] = await db.insert(campusSpaces).values({ name, capacity, type, equipment: eqString }).returning();
      res.json(newSpace);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create space' });
    }
  });

  app.delete("/api/academic/spaces/:id", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { id } = req.params;
      const { campusSpaces } = await import('./src/db/schema');
      
      
      await db.delete(campusSpaces).where(eq(campusSpaces.id, parseInt(id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete space' });
    }
  });

  app.get("/api/academic/space-bookings", requireAuth, async (req, res) => {
    try {
      const { spaceBookings, campusSpaces, users } = await import('./src/db/schema');
      
      
      const bookings = await db.select({
        id: spaceBookings.id,
        spaceId: spaceBookings.spaceId,
        spaceName: campusSpaces.name,
        purpose: spaceBookings.purpose,
        date: spaceBookings.date,
        startTime: spaceBookings.startTime,
        endTime: spaceBookings.endTime,
        bookedBy: users.name
      })
      .from(spaceBookings)
      .leftJoin(campusSpaces, eq(spaceBookings.spaceId, campusSpaces.id))
      .leftJoin(users, eq(spaceBookings.bookedById, users.id))
      .orderBy(desc(spaceBookings.date));
      res.json(bookings);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch space bookings' });
    }
  });

  app.post("/api/academic/space-bookings", requireAuth, requireRole(['Administrator', 'Academic Officer', 'Student']), async (req, res) => {
    try {
      const { spaceId, purpose, date, startTime, endTime } = req.body;
      const { spaceBookings, campusSpaces } = await import('./src/db/schema');
      
      
      
      const newDate = new Date(date);
      
      const existingBookings = await db.select()
        .from(spaceBookings)
        .where(eq(spaceBookings.spaceId, parseInt(spaceId)));
      
      const toMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const newStart = toMinutes(startTime);
      const newEnd = toMinutes(endTime);
      const newDateStr = newDate.toISOString().split('T')[0];
      
      let conflict = null;
      for (const entry of existingBookings) {
        const existingDateStr = new Date(entry.date).toISOString().split('T')[0];
        if (existingDateStr === newDateStr) {
          const existingStart = toMinutes(entry.startTime);
          const existingEnd = toMinutes(entry.endTime);
          
          if (Math.max(newStart, existingStart) < Math.min(newEnd, existingEnd)) {
            conflict = entry;
            break;
          }
        }
      }
      
      if (conflict) {
        return res.status(409).json({ error: `Scheduling Conflict: Space is already booked for "${conflict.purpose}" from ${conflict.startTime} to ${conflict.endTime}.` });
      }
      
      const [newBooking] = await db.insert(spaceBookings).values({
        spaceId: parseInt(spaceId),
        purpose,
        date: newDate,
        startTime,
        endTime,
        bookedById: (req as any).user.id
      }).returning();
      res.json(newBooking);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  });

  app.delete("/api/academic/space-bookings/:id", requireAuth, requireRole(['Administrator', 'Academic Officer', 'Student']), async (req, res) => {
    try {
      const { id } = req.params;
      const { spaceBookings } = await import('./src/db/schema');
      
      
      await db.delete(spaceBookings).where(eq(spaceBookings.id, parseInt(id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete booking' });
    }
  });

  app.post("/api/academic/calendar-events", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { title, description, startDate, endDate, eventType } = req.body;
      const { academicCalendarEvents } = await import('./src/db/schema');
      
      
      const [newEvent] = await db.insert(academicCalendarEvents).values({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        eventType
      }).returning();
      
      res.json(newEvent);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create calendar event' });
    }
  });

  app.delete("/api/academic/calendar-events/:id", requireAuth, requireRole(['Administrator', 'Academic Officer']), async (req, res) => {
    try {
      const { id } = req.params;
      const { academicCalendarEvents } = await import('./src/db/schema');
      
      
      
      await db.delete(academicCalendarEvents).where(eq(academicCalendarEvents.id, parseInt(id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete calendar event' });
    }
  });

  app.post("/api/courses", requireAuth, requireRole(['Administrator']), async (req, res) => {
    try {
      const { code, title, credits, departmentId, semester, type, contributesToGpa, contributesToCgpa, contributesToCreditUnits } = req.body;
      const { courses } = await import('./src/db/schema');
      
      
      const [newCourse] = await db.insert(courses).values({
        code,
        title,
        credits: parseInt(credits),
        departmentId: parseInt(departmentId),
        semester,
        type: type || 'Core',
        contributesToGpa: contributesToGpa !== undefined ? contributesToGpa : true,
        contributesToCgpa: contributesToCgpa !== undefined ? contributesToCgpa : true,
        contributesToCreditUnits: contributesToCreditUnits !== undefined ? contributesToCreditUnits : true,
      }).returning();
      
      res.json(newCourse);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create course' });
    }
  });


  // --- AI Chat Assistant Endpoint ---
  app.post("/api/chat", requireAuth, async (req, res) => {
    try {
      const { message, courseContext } = req.body;
      const { GoogleGenAI } = await import('@google/genai');
      
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      let contextStr = "You are a helpful AI assistant for the School Management System's Learning Management System (LMS). ";
      if (courseContext) {
        contextStr += `You are currently helping a user in the course ${courseContext.code}: ${courseContext.title}. `;
      }
      contextStr += "Answer questions regarding course materials, assignments, the Resource Library, and general school queries briefly and accurately.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction: contextStr,
        }
      });

      res.json({ reply: response.text });
    } catch (e) {
      console.error('Chat error:', e);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  });

  // -- (Moved Vite Middleware to the bottom) --
  
  app.post("/api/messages/:id/read", requireAuth, (req, res) => res.json({ success: true }));



  app.get("/api/student/favorite-documents", requireAuth, async (req, res) => {
    try {
      const { favoriteDocuments, documents, courses } = await import('./src/db/schema');
      
      
      
      const userId = (req as any).user.id;
      
      const favorites = await db.select({
        id: documents.id,
        title: documents.title,
        category: documents.category,
        fileSize: documents.fileSize,
        createdAt: documents.createdAt,
        courseCode: courses.code,
        fileUrl: documents.fileUrl,
        favoriteId: favoriteDocuments.id
      })
      .from(favoriteDocuments)
      .innerJoin(documents, eq(favoriteDocuments.documentId, documents.id))
      .leftJoin(courses, eq(documents.courseId, courses.id))
      .where(eq(favoriteDocuments.userId, userId))
      .orderBy(desc(favoriteDocuments.createdAt));
      
      res.json(favorites);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch favorite documents' });
    }
  });

  app.post("/api/student/favorite-documents/:documentId", requireAuth, async (req, res) => {
    try {
      const { documentId } = req.params;
      const { favoriteDocuments } = await import('./src/db/schema');
      
      const { and, eq } = await import('drizzle-orm');
      
      const userId = (req as any).user.id;
      const docId = parseInt(documentId);
      
      // Check if already favorited
      const existing = await db.select().from(favoriteDocuments).where(
        and(eq(favoriteDocuments.userId, userId), eq(favoriteDocuments.documentId, docId))
      );
      
      if (existing.length > 0) {
        // Remove from favorites
        await db.delete(favoriteDocuments).where(eq(favoriteDocuments.id, existing[0].id));
        return res.json({ success: true, favorited: false });
      } else {
        // Add to favorites
        await db.insert(favoriteDocuments).values({
          userId,
          documentId: docId
        });
        return res.json({ success: true, favorited: true });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to toggle favorite status' });
    }
  });



  app.get("/api/library/books", requireAuth, async (req, res) => {
    try {
      const { books } = await import('./src/db/schema');
      
      
      const allBooks = await db.select().from(books);
      res.json(allBooks);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  });


  app.post("/api/library/books", requireAuth, requireRole(['Administrator', 'Admin', 'ICT Admin', 'Library']), async (req, res) => {
    try {
      const { title, author, category, coverColor, fileUrl, fileType, fileSize } = req.body;
      const { books } = await import('./src/db/schema');
      
      
      const [newBook] = await db.insert(books).values({
        title,
        author,
        category,
        coverColor: coverColor || 'bg-slate-200'
      , fileUrl, fileType, fileSize}).returning();
      
      res.json(newBook);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create book' });
    }
  });

  app.put("/api/library/books/:id", requireAuth, requireRole(['Administrator', 'Admin', 'ICT Admin', 'Library']), async (req, res) => {
    try {
      const { id } = req.params;
      const { title, author, category, coverColor, available, fileUrl, fileType, fileSize } = req.body;
      const { books } = await import('./src/db/schema');
      
      
      
      const [updatedBook] = await db.update(books).set({
        title,
        author,
        category,
        coverColor: coverColor || 'bg-slate-200',
        available: available !== undefined ? available : true
      , fileUrl, fileType, fileSize})
      .where(eq(books.id, parseInt(id)))
      .returning();
      
      res.json(updatedBook);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update book' });
    }
  });

  app.delete("/api/library/books/:id", requireAuth, requireRole(['Administrator', 'Admin', 'ICT Admin', 'Library']), async (req, res) => {
    try {
      const { id } = req.params;
      const { books } = await import('./src/db/schema');
      
      
      
      await db.delete(books).where(eq(books.id, parseInt(id)));
      
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete book' });
    }
  });

  app.get("/api/student/loans", requireAuth, async (req, res) => {
    try {
      const { bookLoans, books } = await import('./src/db/schema');
      
      
      
      const userId = (req as any).user.id;
      
      const loans = await db.select({
        id: bookLoans.id,
        bookId: bookLoans.bookId,
        bookTitle: books.title,
        borrowedDate: bookLoans.borrowedDate,
        dueDate: bookLoans.dueDate,
        status: bookLoans.status
      })
      .from(bookLoans)
      .innerJoin(books, eq(bookLoans.bookId, books.id))
      .where(eq(bookLoans.studentId, userId))
      .orderBy(desc(bookLoans.borrowedDate));
      
      res.json(loans);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch book loans' });
    }
  });

  app.post("/api/student/loans/:bookId", requireAuth, async (req, res) => {
    try {
      const { bookId } = req.params;
      const { bookLoans, books } = await import('./src/db/schema');
      
      
      
      const userId = (req as any).user.id;
      const bId = parseInt(bookId);
      
      const bookRecords = await db.select().from(books).where(eq(books.id, bId));
      if (bookRecords.length === 0 || !bookRecords[0].available) {
        return res.status(400).json({ error: 'Book is not available' });
      }
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 2 weeks loan
      
      // Update book to unavailable
      await db.update(books).set({ available: false }).where(eq(books.id, bId));
      
      // Create loan
      await db.insert(bookLoans).values({
        studentId: userId,
        bookId: bId,
        dueDate
      });
      
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to borrow book' });
    }
  });

  app.post("/api/student/loans/:loanId/return", requireAuth, async (req, res) => {
    try {
      const { loanId } = req.params;
      const { bookLoans, books } = await import('./src/db/schema');
      
      
      
      const userId = (req as any).user.id;
      const lId = parseInt(loanId);
      
      const loanRecords = await db.select().from(bookLoans).where(and(eq(bookLoans.id, lId), eq(bookLoans.studentId, userId)));
      if (loanRecords.length === 0 || loanRecords[0].status === 'returned') {
        return res.status(400).json({ error: 'Invalid loan record' });
      }
      
      // Mark loan returned
      await db.update(bookLoans).set({ status: 'returned' }).where(eq(bookLoans.id, lId));
      
      // Mark book available
      await db.update(books).set({ available: true }).where(eq(books.id, loanRecords[0].bookId));
      
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to return book' });
    }
  });

  app.get("/api/student/mandatory-documents", requireAuth, async (req, res) => {
    try {
      const { studentMandatoryDocuments, users } = await import('./src/db/schema');
      
      const { desc, eq } = await import('drizzle-orm');
      
      const userId = (req as any).user.id;
      
      const userDocs = await db.select({
        id: studentMandatoryDocuments.id,
        studentId: studentMandatoryDocuments.studentId,
        documentType: studentMandatoryDocuments.documentType,
        title: studentMandatoryDocuments.title,
        fileUrl: studentMandatoryDocuments.fileUrl,
        fileType: studentMandatoryDocuments.fileType,
        fileSize: studentMandatoryDocuments.fileSize,
        status: studentMandatoryDocuments.status,
        adminFeedback: studentMandatoryDocuments.adminFeedback,
        reviewedById: studentMandatoryDocuments.reviewedById,
        reviewedAt: studentMandatoryDocuments.reviewedAt,
        uploadedAt: studentMandatoryDocuments.uploadedAt,
      })
      .from(studentMandatoryDocuments)
      .where(eq(studentMandatoryDocuments.studentId, userId))
      .orderBy(desc(studentMandatoryDocuments.uploadedAt));
      
      res.json(userDocs);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch mandatory documents' });
    }
  });

  app.post("/api/student/mandatory-documents", requireAuth, async (req, res) => {
    try {
      const { studentMandatoryDocuments, notifications } = await import('./src/db/schema');
      
      const userId = (req as any).user.id;
      const { documentType, title, fileUrl, fileSize, fileType } = req.body;

      if (!documentType || !fileUrl) {
        return res.status(400).json({ error: 'Document type and file are required' });
      }

      const [inserted] = await db.insert(studentMandatoryDocuments).values({
        studentId: userId,
        documentType,
        title: title || `${documentType} Upload`,
        fileUrl,
        fileType: fileType || 'application/pdf',
        fileSize: Number(fileSize) || 1024 * 500,
        status: 'Pending',
        uploadedAt: new Date()
      }).returning();

      // Create notification for student confirmation
      try {
        await db.insert(notifications).values({
          userId: userId,
          title: 'Document Submitted for Verification',
          message: `Your ${documentType} has been successfully uploaded and is pending administrative review.`,
          type: 'info',
          isRead: 'false'
        });
      } catch (notifErr) {
        console.error('Notification creation failed:', notifErr);
      }

      res.json(inserted);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to upload mandatory document' });
    }
  });

  app.delete("/api/student/mandatory-documents/:id", requireAuth, async (req, res) => {
    try {
      const { studentMandatoryDocuments } = await import('./src/db/schema');
      
      
      const userId = (req as any).user.id;
      const docId = Number(req.params.id);

      await db.delete(studentMandatoryDocuments)
        .where(and(eq(studentMandatoryDocuments.id, docId), eq(studentMandatoryDocuments.studentId, userId)));

      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  });

  app.get("/api/admin/mandatory-documents", requireAuth, async (req, res) => {
    try {
      const { studentMandatoryDocuments, users } = await import('./src/db/schema');
      
      const { desc, eq } = await import('drizzle-orm');
      const { alias } = await import('drizzle-orm/pg-core');

      const reviewer = alias(users, 'reviewer');

      const allDocs = await db.select({
        id: studentMandatoryDocuments.id,
        studentId: studentMandatoryDocuments.studentId,
        documentType: studentMandatoryDocuments.documentType,
        title: studentMandatoryDocuments.title,
        fileUrl: studentMandatoryDocuments.fileUrl,
        fileType: studentMandatoryDocuments.fileType,
        fileSize: studentMandatoryDocuments.fileSize,
        status: studentMandatoryDocuments.status,
        adminFeedback: studentMandatoryDocuments.adminFeedback,
        reviewedAt: studentMandatoryDocuments.reviewedAt,
        uploadedAt: studentMandatoryDocuments.uploadedAt,
        student: {
          id: users.id,
          name: users.name,
          email: users.email,
          username: users.username,
          department: users.department,
          profilePicture: users.profilePicture
        },
        reviewer: {
          id: reviewer.id,
          name: reviewer.name,
          role: reviewer.role
        }
      })
      .from(studentMandatoryDocuments)
      .innerJoin(users, eq(studentMandatoryDocuments.studentId, users.id))
      .leftJoin(reviewer, eq(studentMandatoryDocuments.reviewedById, reviewer.id))
      .orderBy(desc(studentMandatoryDocuments.uploadedAt));

      res.json(allDocs);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch admin mandatory documents' });
    }
  });

  app.put("/api/admin/mandatory-documents/:id/review", requireAuth, async (req, res) => {
    try {
      const { studentMandatoryDocuments, notifications } = await import('./src/db/schema');
      
      
      const adminUserId = (req as any).user.id;
      const docId = Number(req.params.id);
      const { status, adminFeedback } = req.body;

      if (!status || !['Approved', 'Rejected', 'Pending'].includes(status)) {
        return res.status(400).json({ error: 'Valid status is required' });
      }

      const [updated] = await db.update(studentMandatoryDocuments)
        .set({
          status,
          adminFeedback: adminFeedback || null,
          reviewedById: adminUserId,
          reviewedAt: new Date()
        })
        .where(eq(studentMandatoryDocuments.id, docId))
        .returning();

      if (updated) {
        // Send notification to the student
        try {
          await db.insert(notifications).values({
            userId: updated.studentId,
            title: `Document Review: ${status}`,
            message: status === 'Approved'
              ? `Your ${updated.documentType} has been approved by the Administration.`
              : `Action required for your ${updated.documentType}: ${adminFeedback || 'Please re-upload a clear copy.'}`,
            type: status === 'Approved' ? 'info' : 'alert',
            isRead: 'false'
          });
        } catch (notifErr) {
          console.error('Failed notification log:', notifErr);
        }
      }

      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update document review status' });
    }
  });

  app.get("/api/student/documents", requireAuth, async (req, res) => {
    try {
      const { documents, courses, studentCourses, favoriteDocuments } = await import('./src/db/schema');
      
      const { desc, eq, inArray, and } = await import('drizzle-orm');
      
      const userId = (req as any).user.id;
      
      const enrolled = await db.select({ courseId: studentCourses.courseId }).from(studentCourses).where(eq(studentCourses.studentId, userId));
      const courseIds = enrolled.map(e => e.courseId);
      
      if (courseIds.length === 0) {
         return res.json([]);
      }
      
      // Get all documents for enrolled courses
      const docs = await db.select({
        id: documents.id,
        title: documents.title,
        category: documents.category,
        fileSize: documents.fileSize,
        createdAt: documents.createdAt,
        courseCode: courses.code,
        fileUrl: documents.fileUrl,
      })
      .from(documents)
      .leftJoin(courses, eq(documents.courseId, courses.id))
      .where(inArray(documents.courseId, courseIds))
      .orderBy(desc(documents.createdAt));
      
      // Get favorites
      const favorites = await db.select({ documentId: favoriteDocuments.documentId }).from(favoriteDocuments).where(eq(favoriteDocuments.userId, userId));
      const favoriteDocIds = new Set(favorites.map(f => f.documentId));
      
      const enrichedDocs = docs.map(d => ({
        ...d,
        isFavorite: favoriteDocIds.has(d.id)
      }));
      
      res.json(enrichedDocs);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch student documents' });
    }
  });

app.get("/api/student/recent-documents", requireAuth, async (req, res) => {
    try {
      const { documents, courses, studentCourses, favoriteDocuments } = await import('./src/db/schema');
      
      const { desc, eq, inArray } = await import('drizzle-orm');
      
      const userId = (req as any).user.id;
      
      const enrolled = await db.select({ courseId: studentCourses.courseId }).from(studentCourses).where(eq(studentCourses.studentId, userId));
      const courseIds = enrolled.map(e => e.courseId);
      
      if (courseIds.length === 0) {
         return res.json([]);
      }
      
      const recentDocs = await db.select({
        id: documents.id,
        title: documents.title,
        category: documents.category,
        fileSize: documents.fileSize,
        createdAt: documents.createdAt,
        courseCode: courses.code,
        fileUrl: documents.fileUrl
      })
      .from(documents)
      .leftJoin(courses, eq(documents.courseId, courses.id))
      .where(inArray(documents.courseId, courseIds))
      .orderBy(desc(documents.createdAt))
      .limit(5);
      
      const favorites = await db.select({ documentId: favoriteDocuments.documentId }).from(favoriteDocuments).where(eq(favoriteDocuments.userId, userId));
      const favoriteDocIds = new Set(favorites.map(f => f.documentId));
      
      const enrichedDocs = recentDocs.map(d => ({
        ...d,
        isFavorite: favoriteDocIds.has(d.id)
      }));
      
      res.json(enrichedDocs);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch recent documents' });
    }
  });


  app.get("/api/courses/:courseId/discussions", requireAuth, async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = (req as any).user.id;
      const { courseDiscussions, users, courseDiscussionReplies, courseDiscussionLikes } = await import('./src/db/schema');
      
      const { eq, desc, sql, and } = await import('drizzle-orm');
      
      // Need a subquery for whether current user liked it
      
      const discussions = await db.select({
        id: courseDiscussions.id,
        title: courseDiscussions.title,
        content: courseDiscussions.content,
        createdAt: courseDiscussions.createdAt,
        isPinned: courseDiscussions.isPinned,
        authorName: users.name,
        authorId: users.id,
        authorPicture: users.profilePicture,
        replyCount: sql`cast(count(DISTINCT \${courseDiscussionReplies.id}) as integer)`,
        likeCount: sql`cast(count(DISTINCT \${courseDiscussionLikes.id}) as integer)`,
        // Checking if the user liked it is a bit complex in a single query with Drizzle without writing full SQL.
        // We'll map over the result.
      })
      .from(courseDiscussions)
      .leftJoin(users, eq(courseDiscussions.authorId, users.id))
      .leftJoin(courseDiscussionReplies, eq(courseDiscussions.id, courseDiscussionReplies.discussionId))
      .leftJoin(courseDiscussionLikes, eq(courseDiscussions.id, courseDiscussionLikes.discussionId))
      .where(eq(courseDiscussions.courseId, parseInt(courseId)))
      .groupBy(courseDiscussions.id, users.id)
      .orderBy(desc(courseDiscussions.isPinned), desc(courseDiscussions.createdAt));

      // Separate query for user likes to keep it simple and clean
      const userLikes = await db.select({ discussionId: courseDiscussionLikes.discussionId })
        .from(courseDiscussionLikes)
        .where(eq(courseDiscussionLikes.userId, userId));
      const likedDiscussionIds = new Set(userLikes.map(l => l.discussionId));
      
      const { courseDiscussionPollOptions, courseDiscussionPollVotes } = await import('./src/db/schema');
      const { inArray } = await import('drizzle-orm');
      
      const discussionIds = discussions.map(d => d.id);
      let allPollOptions = [];
      let allPollVotes = [];
      if (discussionIds.length > 0) {
        allPollOptions = await db.select().from(courseDiscussionPollOptions).where(inArray(courseDiscussionPollOptions.discussionId, discussionIds));
        allPollVotes = await db.select().from(courseDiscussionPollVotes).where(inArray(courseDiscussionPollVotes.discussionId, discussionIds));
      }
      
      const enrichedDiscussions = discussions.map(d => {
        const options = allPollOptions.filter(o => o.discussionId === d.id);
        const votes = allPollVotes.filter(v => v.discussionId === d.id);
        const myVote = votes.find(v => v.userId === userId);
        
        const poll = options.length > 0 ? {
          options: options.map(opt => ({
            ...opt,
            voteCount: votes.filter(v => v.optionId === opt.id).length
          })),
          totalVotes: votes.length,
          myVoteId: myVote ? myVote.optionId : null
        } : null;

        return {
          ...d,
          likedByMe: likedDiscussionIds.has(d.id),
          poll
        };
      });

      res.json(enrichedDiscussions);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch discussions' });
    }
  });

  app.post("/api/discussions/:discussionId/like", requireAuth, async (req, res) => {
    try {
      const { discussionId } = req.params;
      const userId = (req as any).user.id;
      const { courseDiscussionLikes } = await import('./src/db/schema');
      
      
      
      const existing = await db.select().from(courseDiscussionLikes)
        .where(and(eq(courseDiscussionLikes.discussionId, parseInt(discussionId)), eq(courseDiscussionLikes.userId, userId)));
        
      if (existing.length > 0) {
        await db.delete(courseDiscussionLikes)
          .where(and(eq(courseDiscussionLikes.discussionId, parseInt(discussionId)), eq(courseDiscussionLikes.userId, userId)));
        res.json({ liked: false });
      } else {
        await db.insert(courseDiscussionLikes).values({
          discussionId: parseInt(discussionId),
          userId
        });
        res.json({ liked: true });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to toggle like' });
    }
  });

  app.post("/api/courses/:courseId/discussions", requireAuth, async (req, res) => {
    try {
      const { courseId } = req.params;
      const { title, content } = req.body;
      const userId = (req as any).user.id;
      const { courseDiscussions } = await import('./src/db/schema');
      
      
      const [newDiscussion] = await db.insert(courseDiscussions).values({
        courseId: parseInt(courseId),
        authorId: userId,
        title,
        content,
        attachmentUrl: req.body.attachmentUrl,
        attachmentName: req.body.attachmentName
      }).returning();
      
      const { courseDiscussionPollOptions } = await import('./src/db/schema');
      const { pollOptions } = req.body;
      if (pollOptions && Array.isArray(pollOptions) && pollOptions.length > 0) {
        const validOptions = pollOptions.filter(o => o.trim());
        if (validOptions.length > 0) {
          await db.insert(courseDiscussionPollOptions).values(
            validOptions.map(text => ({
              discussionId: newDiscussion.id,
              text: text.trim()
            }))
          );
        }
      }
      
      const { notifications, users } = await import('./src/db/schema');
      await processMentions(db, users, notifications, content, userId, `/dashboard/academic/course/${courseId}`);
      
      res.json(newDiscussion);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create discussion' });
    }
  });

  app.get("/api/discussions/:discussionId/replies", requireAuth, async (req, res) => {
try {
      const { discussionId } = req.params;
      const userId = (req as any).user.id;
      const { courseDiscussionReplies, users, courseDiscussionReplyLikes } = await import('./src/db/schema');
      
      const { eq, asc, sql } = await import('drizzle-orm');
      
      const replies = await db.select({
        id: courseDiscussionReplies.id,
        content: courseDiscussionReplies.content,
        createdAt: courseDiscussionReplies.createdAt,
        authorName: users.name,
        authorId: users.id,
        authorRole: users.role,
        authorPicture: users.profilePicture,
        likeCount: sql`cast(count(DISTINCT \${courseDiscussionReplyLikes.id}) as integer)`
      })
      .from(courseDiscussionReplies)
      .leftJoin(users, eq(courseDiscussionReplies.authorId, users.id))
      .leftJoin(courseDiscussionReplyLikes, eq(courseDiscussionReplies.id, courseDiscussionReplyLikes.replyId))
      .where(eq(courseDiscussionReplies.discussionId, parseInt(discussionId)))
      .groupBy(courseDiscussionReplies.id, users.id)
      .orderBy(asc(courseDiscussionReplies.createdAt));

      const userLikes = await db.select({ replyId: courseDiscussionReplyLikes.replyId })
        .from(courseDiscussionReplyLikes)
        .where(eq(courseDiscussionReplyLikes.userId, userId));
      const likedReplyIds = new Set(userLikes.map(l => l.replyId));

      const enrichedReplies = replies.map(r => ({
        ...r,
        likedByMe: likedReplyIds.has(r.id)
      }));

      res.json(enrichedReplies);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch replies' });
    }
  });


  app.post("/api/discussions/:discussionId/pin", requireAuth, requireRole(['Administrator', 'Academic Officer', 'Lecturer']), async (req, res) => {
    try {
      const { discussionId } = req.params;
      const { isPinned } = req.body;
      const { courseDiscussions } = await import('./src/db/schema');
      
      
      
      const [updated] = await db.update(courseDiscussions)
        .set({ isPinned: isPinned })
        .where(eq(courseDiscussions.id, parseInt(discussionId)))
        .returning();
        
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update pin status' });
    }
  });

  app.post("/api/discussions/replies/:replyId/like", requireAuth, async (req, res) => {
    try {
      const { replyId } = req.params;
      const userId = (req as any).user.id;
      const { courseDiscussionReplyLikes } = await import('./src/db/schema');
      
      
      
      const existing = await db.select().from(courseDiscussionReplyLikes)
        .where(and(eq(courseDiscussionReplyLikes.replyId, parseInt(replyId)), eq(courseDiscussionReplyLikes.userId, userId)));
        
      if (existing.length > 0) {
        await db.delete(courseDiscussionReplyLikes)
          .where(and(eq(courseDiscussionReplyLikes.replyId, parseInt(replyId)), eq(courseDiscussionReplyLikes.userId, userId)));
        res.json({ liked: false });
      } else {
        await db.insert(courseDiscussionReplyLikes).values({
          replyId: parseInt(replyId),
          userId
        });
        res.json({ liked: true });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to toggle reply like' });
    }
  });

  app.post("/api/discussions/:discussionId/replies", requireAuth, async (req, res) => {
    try {
      const { discussionId } = req.params;
      const { content } = req.body;
      const userId = (req as any).user.id;
      const { courseDiscussionReplies } = await import('./src/db/schema');
      
      
      const [newReply] = await db.insert(courseDiscussionReplies).values({
        discussionId: parseInt(discussionId),
        authorId: userId,
        content,
        attachmentUrl: req.body.attachmentUrl,
        attachmentName: req.body.attachmentName
      }).returning();
      
      const { notifications, users } = await import('./src/db/schema');
      await processMentions(db, users, notifications, content, userId, `/dashboard/academic/discussion/${discussionId}`);
      
      res.json(newReply);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create reply' });
    }
  });

  app.delete("/api/discussions/:discussionId", requireAuth, async (req, res) => {
    try {
      const { discussionId } = req.params;
      const userId = (req as any).user.id;
      const role = (req as any).user.role;
      
      const { courseDiscussions } = await import('./src/db/schema');
      
      
      
      if (role === 'Administrator' || role === 'Lecturer') {
         await db.delete(courseDiscussions).where(eq(courseDiscussions.id, parseInt(discussionId)));
      } else {
         await db.delete(courseDiscussions).where(and(eq(courseDiscussions.id, parseInt(discussionId)), eq(courseDiscussions.authorId, userId)));
      }
      
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete discussion' });
    }
  });

  app.delete("/api/discussions/replies/:replyId", requireAuth, async (req, res) => {
    try {
      const { replyId } = req.params;
      const userId = (req as any).user.id;
      const role = (req as any).user.role;
      
      const { courseDiscussionReplies } = await import('./src/db/schema');
      
      
      
      if (role === 'Administrator' || role === 'Lecturer') {
         await db.delete(courseDiscussionReplies).where(eq(courseDiscussionReplies.id, parseInt(replyId)));
      } else {
         await db.delete(courseDiscussionReplies).where(and(eq(courseDiscussionReplies.id, parseInt(replyId)), eq(courseDiscussionReplies.authorId, userId)));
      }
      
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete reply' });
    }
  });

  app.get("/api/courses/:courseId/documents", requireAuth, async (req, res) => {
    try {
      const { documents } = await import('./src/db/schema');
      
      
      
      const docs = await db.select().from(documents).where(eq(documents.courseId, parseInt(req.params.courseId)));
      res.json(docs);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

    app.get("/api/admin/documents", requireAuth, requireRole(['Administrator', 'ICT Admin', 'Admin']), async (req, res) => {
    try {
      const { documents, courses, users } = await import('./src/db/schema');
      
      const { desc, eq } = await import('drizzle-orm');
      
      const allDocs = await db.select({
        id: documents.id,
        title: documents.title,
        category: documents.category,
        fileSize: documents.fileSize,
        createdAt: documents.createdAt,
        courseCode: courses.code,
        uploaderName: users.name
      })
      .from(documents)
      .leftJoin(courses, eq(documents.courseId, courses.id))
      .leftJoin(users, eq(documents.uploaderId, users.id))
      .orderBy(desc(documents.createdAt));
      
      res.json(allDocs);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  app.get("/api/admin/lms-stats", requireAuth, requireRole(['Administrator', 'ICT Admin', 'Admin']), async (req, res) => {
    try {
      const { documents, courses, users } = await import('./src/db/schema');
      
      const { count, eq } = await import('drizzle-orm');
      
      const docsCount = await db.select({ count: count() }).from(documents);
      const coursesCount = await db.select({ count: count() }).from(courses);
      const studentsCount = await db.select({ count: count() }).from(users).where(eq(users.role, 'Student'));
      const lecturersCount = await db.select({ count: count() }).from(users).where(eq(users.role, 'Lecturer'));
      
      res.json({
        totalDocuments: docsCount[0].count,
        totalCourses: coursesCount[0].count,
        totalStudents: studentsCount[0].count,
        totalLecturers: lecturersCount[0].count
      });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch LMS stats' });
    }
  });

  app.get("/api/documents", requireAuth, async (req, res) => {
    try {
      const { documents, courses, users } = await import('./src/db/schema');
      
      
      
      const allDocs = await db.select({
        id: documents.id,
        title: documents.title,
        description: documents.description,
        fileUrl: documents.fileUrl,
        fileType: documents.fileType,
        fileSize: documents.fileSize,
        category: documents.category,
        isPublic: documents.isPublic,
        createdAt: documents.createdAt,
        courseId: documents.courseId,
        courseCode: courses.code,
        uploaderId: documents.uploaderId,
        uploaderName: users.name
      })
      .from(documents)
      .leftJoin(courses, eq(documents.courseId, courses.id))
      .leftJoin(users, eq(documents.uploaderId, users.id))
      .orderBy(desc(documents.createdAt));
      
      res.json(allDocs);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  app.post("/api/documents", requireAuth, async (req, res) => {
    try {
      const { title, description, courseId, category, fileUrl, fileType, fileSize, isPublic } = req.body;
      
      if (!fileUrl) {
        return res.status(400).json({ error: 'No file URL provided' });
      }

      const { documents } = await import('./src/db/schema');
      
      
      const [newDoc] = await db.insert(documents).values({
        title: title || 'Untitled Document',
        description,
        fileUrl,
        fileType,
        fileSize: parseInt(fileSize) || 0,
        uploaderId: (req as any).user.id,
        courseId: courseId ? parseInt(courseId) : null,
        category: category || 'Course Material',
        isPublic: isPublic === true || isPublic === 'true' ? 'true' : 'false',
        createdAt: new Date(),
      }).returning();
      
      res.json(newDoc);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create document' });
    }
  });

  app.put("/api/documents/:id", requireAuth, requireRole(["Administrator", "Admin", "ICT Admin", "Library", "Lecturer"]), async (req, res) => {
    try {
      const { title, description } = req.body;
      const { documents } = await import('./src/db/schema');
      
      
      
      // Optionally check permissions (uploader or admin)
      
      const [updatedDoc] = await db.update(documents)
        .set({ title, description, category: req.body.category, isPublic: req.body.isPublic, courseId: req.body.courseId ? parseInt(req.body.courseId) : null })
        .where(eq(documents.id, parseInt(req.params.id)))
        .returning();
        
      res.json(updatedDoc);
    } catch (e) {
      res.status(500).json({ error: 'Failed to update document' });
    }
  });

  app.delete("/api/documents/:id", requireAuth, requireRole(["Administrator", "Admin", "ICT Admin", "Library", "Lecturer"]), async (req, res) => {
    try {
      const { documents } = await import('./src/db/schema');
      
      
      
      await db.delete(documents).where(eq(documents.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete document' });
    }
  });


  // --- Attendance API ---
  app.get("/api/attendance/courses/:courseId/students", requireAuth, async (req, res) => {
    try {
      const { courseId } = req.params;
      const { studentCourses, users } = await import('./src/db/schema');
      
      
      
      const enrolledStudents = await db.select({
        id: users.id,
        name: users.name,
        username: users.username,
        profilePicture: users.profilePicture
      })
      .from(studentCourses)
      .innerJoin(users, eq(studentCourses.studentId, users.id))
      .where(eq(studentCourses.courseId, parseInt(courseId)));

      res.json(enrolledStudents);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch enrolled students' });
    }
  });

  app.get("/api/attendance/courses/:courseId/records", requireAuth, async (req, res) => {
    try {
      const { courseId } = req.params;
      const { date } = req.query;
      const { attendance } = await import('./src/db/schema');
      
      

      if (!date) {
        return res.status(400).json({ error: 'Date is required' });
      }

      const parsedDate = new Date(date as string);

      const records = await db.select()
        .from(attendance)
        .where(
          and(
            eq(attendance.courseId, parseInt(courseId)),
            eq(attendance.date, parsedDate)
          )
        );

      res.json(records);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
  });

  app.post("/api/attendance/courses/:courseId", requireAuth, requireRole(['Lecturer', 'Administrator', 'Admin']), async (req, res) => {
    try {
      const { courseId } = req.params;
      const { date, records } = req.body;
      const lecturerId = (req as any).user.id;
      
      const { attendance } = await import('./src/db/schema');
      
      

      const parsedDate = new Date(date as string);

      await db.delete(attendance).where(
        and(
          eq(attendance.courseId, parseInt(courseId)),
          eq(attendance.date, parsedDate)
        )
      );

      if (records && records.length > 0) {
        const values = records.map((r) => ({
          courseId: parseInt(courseId),
          studentId: parseInt(r.studentId),
          date: parsedDate,
          status: r.status,
          lecturerId
        }));

        await db.insert(attendance).values(values);
      }

      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to save attendance' });
    }
  });

  app.get("/api/attendance/student", requireAuth, async (req, res) => {
    try {
      const studentId = (req as any).user.id;
      const { attendance, courses } = await import('./src/db/schema');
      
      

      const records = await db.select({
        id: attendance.id,
        courseId: attendance.courseId,
        courseCode: courses.code,
        courseTitle: courses.title,
        date: attendance.date,
        status: attendance.status
      })
      .from(attendance)
      .innerJoin(courses, eq(attendance.courseId, courses.id))
      .where(eq(attendance.studentId, studentId));

      res.json(records);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch student attendance' });
    }
  });


  
  // --- Facilities API ---
  app.get("/api/facilities", requireAuth, async (req, res) => {
    try {
      const { facilities } = await import('./src/db/schema.js');
      const { db } = await import('./src/db/index.js');
      const allFacilities = await db.select().from(facilities);
      res.json(allFacilities);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch facilities' });
    }
  });

  app.post("/api/facility-bookings", requireAuth, async (req, res) => {
    try {
      const { facilityBookings } = await import('./src/db/schema.js');
      const { db } = await import('./src/db/index.js');
      const { facilityId, startTime, endTime, purpose } = req.body;
      
      const [newBooking] = await db.insert(facilityBookings).values({
        facilityId,
        userId: (req as any).user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        purpose,
        status: 'Pending'
      }).returning();
      
      res.json(newBooking);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to submit booking' });
    }
  });

  app.get("/api/facility-bookings", requireAuth, async (req, res) => {
    try {
      const { facilityBookings, facilities } = await import('./src/db/schema.js');
      const { db } = await import('./src/db/index.js');
      
      const userId = (req as any).user.id;
      
      const bookings = await db
        .select({
          id: facilityBookings.id,
          facilityId: facilityBookings.facilityId,
          facilityName: facilities.name,
          startTime: facilityBookings.startTime,
          endTime: facilityBookings.endTime,
          purpose: facilityBookings.purpose,
          status: facilityBookings.status
        })
        .from(facilityBookings)
        .innerJoin(facilities, eq(facilityBookings.facilityId, facilities.id))
        .where(eq(facilityBookings.userId, userId));
        
      res.json(bookings);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  app.patch("/api/facility-bookings/:id/status", requireAuth, async (req, res) => {
    try {
      const { facilityBookings } = await import('./src/db/schema.js');
      const { db } = await import('./src/db/index.js');
      
      const { id } = req.params;
      const { status } = req.body;
      const userId = (req as any).user.id;
      
      const [updated] = await db
        .update(facilityBookings)
        .set({ status })
        .where(and(eq(facilityBookings.id, parseInt(id)), eq(facilityBookings.userId, userId)))
        .returning();
        
      if (!updated) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update booking' });
    }
  });

// --- Hostels API ---
  app.get("/api/hostels", requireAuth, async (req, res) => {
    try {
      const { hostels } = await import('./src/db/schema');
      
      const allHostels = await db.select().from(hostels);
      res.json(allHostels);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch hostels' });
    }
  });

  app.post("/api/hostels", requireAuth, requireRole(['Administrator', 'Portal']), async (req, res) => {
    try {
      const { name, capacity, gender, description, status } = req.body;
      const { hostels } = await import('./src/db/schema');
      
      const [newHostel] = await db.insert(hostels).values({
        name, capacity, gender, description, status: status || 'Available'
      }).returning();
      res.json(newHostel);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create hostel' });
    }
  });
  
  app.get("/api/hostels/:id/rooms", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { hostelRooms } = await import('./src/db/schema');
      
      
      const rooms = await db.select().from(hostelRooms).where(eq(hostelRooms.hostelId, parseInt(id)));
      res.json(rooms);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch rooms' });
    }
  });
  
  app.post("/api/hostels/:id/rooms", requireAuth, requireRole(['Administrator', 'Portal']), async (req, res) => {
    try {
      const { id } = req.params;
      const { roomNumber, capacity } = req.body;
      const { hostelRooms } = await import('./src/db/schema');
      
      const [newRoom] = await db.insert(hostelRooms).values({
        hostelId: parseInt(id),
        roomNumber,
        capacity,
        occupancy: 0
      }).returning();
      res.json(newRoom);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create room' });
    }
  });

  app.get("/api/hostel-applications", requireAuth, requireRole(['Administrator', 'Portal']), async (req, res) => {
    try {
      const { hostelApplications, users, hostels, hostelRooms } = await import('./src/db/schema');
      
      
      
      const apps = await db.select({
        id: hostelApplications.id,
        status: hostelApplications.status,
        session: hostelApplications.session,
        applicationDate: hostelApplications.applicationDate,
        studentName: users.name,
        studentMatric: users.username,
        hostelName: hostels.name,
        roomNumber: hostelRooms.roomNumber
      })
      .from(hostelApplications)
      .innerJoin(users, eq(hostelApplications.studentId, users.id))
      .leftJoin(hostels, eq(hostelApplications.hostelId, hostels.id))
      .leftJoin(hostelRooms, eq(hostelApplications.roomId, hostelRooms.id));
      
      res.json(apps);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  });
  
  app.post("/api/hostels/apply", requireAuth, requireRole(['Student']), async (req, res) => {
    try {
      const studentId = (req as any).user.id;
      const { session } = req.body;
      const { hostelApplications } = await import('./src/db/schema');
      
      
      const [newApp] = await db.insert(hostelApplications).values({
        studentId,
        session,
        status: 'Pending'
      }).returning();
      
      res.json(newApp);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to apply' });
    }
  });
  
  app.get("/api/student/hostel-application", requireAuth, requireRole(['Student']), async (req, res) => {
    try {
      const studentId = (req as any).user.id;
      const { hostelApplications, hostels, hostelRooms } = await import('./src/db/schema');
      
      
      
      const apps = await db.select({
        id: hostelApplications.id,
        status: hostelApplications.status,
        session: hostelApplications.session,
        applicationDate: hostelApplications.applicationDate,
        hostelName: hostels.name,
        roomNumber: hostelRooms.roomNumber
      })
      .from(hostelApplications)
      .leftJoin(hostels, eq(hostelApplications.hostelId, hostels.id))
      .leftJoin(hostelRooms, eq(hostelApplications.roomId, hostelRooms.id))
      .where(eq(hostelApplications.studentId, studentId))
      .orderBy(desc(hostelApplications.applicationDate))
      .limit(1);
      
      res.json(apps[0] || null);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch application' });
    }
  });
  
  app.put("/api/hostel-applications/:id/status", requireAuth, requireRole(['Administrator', 'Portal']), async (req, res) => {
    try {
      const { id } = req.params;
      const { status, hostelId, roomId } = req.body;
      const { hostelApplications, hostelRooms } = await import('./src/db/schema');
      
      const { eq, sql } = await import('drizzle-orm');
      
      if (status === 'Allocated' && roomId) {
         // Update room occupancy
         await db.update(hostelRooms)
           .set({ occupancy: sql`occupancy + 1` })
           .where(eq(hostelRooms.id, parseInt(roomId)));
      }
      
      const [updated] = await db.update(hostelApplications)
        .set({ status, hostelId: hostelId ? parseInt(hostelId) : null, roomId: roomId ? parseInt(roomId) : null })
        .where(eq(hostelApplications.id, parseInt(id)))
        .returning();
        
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update application' });
    }
  });

  




  app.post("/api/student/study-plan/generate", requireAuth, requireRole(['Student']), async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { studentCourses, courses, timetables, academicCalendarEvents } = await import('./src/db/schema');
      
      
      
      // Get enrolled courses
      const enrolled = await db.select({
        courseCode: courses.code,
        courseTitle: courses.title,
        credits: courses.credits
      })
      .from(studentCourses)
      .innerJoin(courses, eq(studentCourses.courseId, courses.id))
      .where(eq(studentCourses.studentId, userId));

      // Get timetables for enrolled courses
      const enrolledCourseIds = await db.select({ courseId: studentCourses.courseId }).from(studentCourses).where(eq(studentCourses.studentId, userId));
      const courseIds = enrolledCourseIds.map(c => c.courseId);
      
      let scheduleDetails = [];
      if (courseIds.length > 0) {
        scheduleDetails = await db.select({
          courseId: timetables.courseId,
          courseCode: courses.code,
          dayOfWeek: timetables.dayOfWeek,
          startTime: timetables.startTime,
          endTime: timetables.endTime
        })
        .from(timetables)
        .innerJoin(courses, eq(timetables.courseId, courses.id))
        // Filtering in JS for simplicity since we don't import inArray here easily
        .execute();
        
        scheduleDetails = scheduleDetails.filter(t => courseIds.includes(t.courseId));
      }

      // Get calendar events (e.g. exams)
      const events = await db.select().from(academicCalendarEvents);

      // Call Gemini API
      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      const promptData = {
        courses: enrolled,
        weeklySchedule: scheduleDetails,
        upcomingEvents: events
      };

      const promptString = `You are an AI academic advisor. Generate a personalized weekly study schedule and practice topics for a student based on this data:
      ${JSON.stringify(promptData)}
      
      Allocate more study time to courses with higher credits or upcoming exams. Ensure the study schedule does not overlap with their class weeklySchedule. Suggest 3-5 specific, relevant practice topics for each registered course based on standard university curricula for those course titles.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptString,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dailySchedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    focusCourse: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    activities: { 
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  }
                }
              },
              practiceTopics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    courseCode: { type: Type.STRING },
                    courseTitle: { type: Type.STRING },
                    topics: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });

      res.json(JSON.parse(response.text));
    } catch (e) {
      console.error("AI Planner error:", e);
      res.status(500).json({ error: 'Failed to generate study plan' });
    }
  });

  app.get("/api/student/progress", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { studentCourses, courses, results } = await import('./src/db/schema');
      
      const { eq, and, ne } = await import('drizzle-orm');
      
      // Get all registered courses and their credits
      const registered = await db.select({
        courseId: studentCourses.courseId,
        credits: courses.credits
      })
      .from(studentCourses)
      .innerJoin(courses, eq(studentCourses.courseId, courses.id))
      .where(eq(studentCourses.studentId, userId));

      // Get all results for this student
      const studentResults = await db.select({
        courseId: results.courseId,
        grade: results.grade
      })
      .from(results)
      .where(eq(results.studentId, userId));

      let totalRegisteredCredits = 0;
      let earnedCredits = 0;
      let passedSubjects = 0;

      registered.forEach(reg => {
        totalRegisteredCredits += reg.credits;
        
        // Check if student passed this course
        const result = studentResults.find(r => r.courseId === reg.courseId);
        if (result && result.grade !== 'F' && result.grade !== 'Fail') {
          earnedCredits += reg.credits;
          passedSubjects += 1;
        }
      });

      res.json({
        totalRegisteredCredits,
        earnedCredits,
        passedSubjects,
        totalRegisteredSubjects: registered.length
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch progress' });
    }
  });


  
    app.put("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { profilePicture, name, phone, department, faculty } = req.body;
      const { users } = await import('./src/db/schema');
      
      

      const updateData: any = {};
      if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (department !== undefined) updateData.department = department;
      if (faculty !== undefined) updateData.faculty = faculty;

      await db.update(users).set(updateData).where(eq(users.id, userId));
      
      const [updatedUser] = await db.select().from(users).where(eq(users.id, userId));
      
      res.json({ success: true, user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        phone: updatedUser.phone,
        department: updatedUser.department,
        faculty: updatedUser.faculty
      } });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });


// --- Jobs & Internships API ---
  app.get("/api/jobs", requireAuth, async (req, res) => {
    try {
      const { jobs } = await import('./src/db/schema');
      
      const { desc } = await import('drizzle-orm');
      
      const allJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
      res.json(allJobs);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });

  app.post("/api/jobs", requireAuth, requireRole(['Administrator', 'Admin', 'Lecturer']), async (req, res) => {
    try {
      const { jobs } = await import('./src/db/schema');
      
      const userId = (req as any).user.id;
      
      const [newJob] = await db.insert(jobs).values({
        ...req.body,
        postedBy: userId
      }).returning();
      
      res.json(newJob);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create job' });
    }
  });

  app.get("/api/jobs/applications", requireAuth, async (req, res) => {
    try {
      const { jobApplications, jobs } = await import('./src/db/schema');
      
      
      const userId = (req as any).user.id;
      
      const myApplications = await db.select({
        application: jobApplications,
        job: jobs
      })
      .from(jobApplications)
      .leftJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .where(eq(jobApplications.studentId, userId))
      .orderBy(desc(jobApplications.appliedAt));
      
      res.json(myApplications);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch job applications' });
    }
  });

  app.post("/api/jobs/:id/apply", requireAuth, async (req, res) => {
    try {
      const { jobApplications } = await import('./src/db/schema');
      
      const userId = (req as any).user.id;
      const jobId = parseInt(req.params.id);
      
      const [newApp] = await db.insert(jobApplications).values({
        jobId,
        studentId: userId,
        coverLetter: req.body.coverLetter,
        resumeUrl: req.body.resumeUrl
      }).returning();
      
      res.json(newApp);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to apply for job' });
    }
  });


  app.put("/api/users/theme", requireAuth, async (req, res) => {
    try {
      const { users } = await import('./src/db/schema');
      
      
      
      const { theme } = req.body;
      const userId = (req as any).user.id;
      
      await db.update(users).set({ themePreference: theme }).where(eq(users.id, userId));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update theme' });
    }
  });

// --- Notifications API ---
  
app.post('/api/notifications', requireAuth, async (req, res) => {
  try {
    const { title, message, type, userId } = req.body;
    const { notifications } = await import('./src/db/schema');
    
    
    // Only admins or system can create notifications for others
    const reqUserId = (req as any).user.id;
    const role = (req as any).user.role;
    
    if (userId !== reqUserId && role !== 'Admin' && role !== 'Registrar' && role !== 'Bursar') {
       return res.status(403).json({ error: 'Forbidden' });
    }

    const [newNotification] = await db.insert(notifications).values({
      userId,
      title,
      message,
      type
    }).returning();
    
    res.json(newNotification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { notifications } = await import('./src/db/schema');
      
      
      
      const userNotifications = await db.select().from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
        
      res.json(userNotifications);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });


  app.put("/api/notifications/read-all", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { notifications } = await import('./src/db/schema');
      
      
      
      await db.update(notifications)
        .set({ isRead: 'true' })
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 'false')));
        
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  });

  app.put("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { notifications } = await import('./src/db/schema');
      
      
      
      await db.update(notifications)
        .set({ isRead: 'true' })
        .where(and(eq(notifications.id, parseInt(id)), eq(notifications.userId, userId)));
        
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  
  // --- Payment Deadline Cron Job ---
  setInterval(async () => {
    try {
      const { feeSettings, users, notifications } = await import("./src/db/schema");
      const { db } = await import("./src/db");
      const { sql, eq } = await import("drizzle-orm");

      // Find fees with deadlines in the next 7 days
      const upcomingFees = await db.select().from(feeSettings)
        .where(sql`deadline IS NOT NULL AND deadline > NOW() AND deadline < NOW() + INTERVAL '7 days'`);

      if (upcomingFees.length > 0) {
        const students = await db.select({ id: users.id }).from(users).where(eq(users.role, 'Student'));
        if (students.length > 0) {
          const notificationsData = [];
          for (const fee of upcomingFees) {
            for (const student of students) {
              notificationsData.push({
                userId: student.id,
                title: 'Payment Deadline Approaching',
                message: `Reminder: The deadline for ${fee.type} (₦${fee.amount}) is approaching on ${new Date(fee.deadline).toLocaleDateString()}.`,
                type: 'warning',
                isRead: 'false',
                createdAt: new Date()
              });
            }
          }
          if (notificationsData.length > 0) {
            await db.insert(notifications).values(notificationsData);
          }
        }
      }
    } catch (e) {
      console.error("Cron Job Error:", e);
    }
  }, 24 * 60 * 60 * 1000); // Run once every 24 hours

  
  // --- Clinic API ---
  app.get("/api/clinic/records", requireAuth, async (req, res) => {
    try {
      const { clinicRecords, users } = await import('./src/db/schema');
      
      
      
      const records = await db.select({
        id: clinicRecords.id,
        studentId: clinicRecords.studentId,
        staffId: clinicRecords.staffId,
        visitDate: clinicRecords.visitDate,
        symptoms: clinicRecords.symptoms,
        diagnosis: clinicRecords.diagnosis,
        prescription: clinicRecords.prescription,
        prescriptionStatus: clinicRecords.prescriptionStatus,
        status: clinicRecords.status,
        notes: clinicRecords.notes,
        studentName: users.name,
      }).from(clinicRecords)
      .leftJoin(users, eq(clinicRecords.studentId, users.id))
      .orderBy(desc(clinicRecords.visitDate));
      
      res.json(records);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch clinic records' });
    }
  });
  
  
  // Wellness Tracking
  app.get("/api/wellness", requireAuth, async (req, res) => {
    try {
      const { studentWellnessLogs } = await import('./src/db/schema');
      
      
      
      const logs = await db.select()
        .from(studentWellnessLogs)
        .where(eq(studentWellnessLogs.studentId, (req as any).user.id))
        .orderBy(desc(studentWellnessLogs.date))
        .limit(30);
        
      res.json(logs);
    } catch (err) {
      console.error('Error fetching wellness logs:', err);
      res.status(500).json({ error: 'Failed to fetch wellness logs' });
    }
  });

  app.post("/api/wellness", requireAuth, async (req, res) => {
    try {
      const { mood, sleepHours, nutritionQuality, waterIntake, exerciseMinutes, notes } = req.body;
      const { studentWellnessLogs } = await import('./src/db/schema');
      
      
      const [newLog] = await db.insert(studentWellnessLogs).values({
        studentId: (req as any).user.id,
        mood,
        sleepHours,
        nutritionQuality,
        waterIntake,
        exerciseMinutes,
        notes,
      }).returning();
      
      res.json(newLog);
    } catch (err) {
      console.error('Error adding wellness log:', err);
      res.status(500).json({ error: 'Failed to add wellness log' });
    }
  });

  app.get("/api/clinic/records/student/:studentId", requireAuth, async (req, res) => {
    try {
      const { studentId } = req.params;
      const { clinicRecords, users } = await import('./src/db/schema');
      
      
      
      const records = await db.select({
        id: clinicRecords.id,
        studentId: clinicRecords.studentId,
        staffId: clinicRecords.staffId,
        visitDate: clinicRecords.visitDate,
        symptoms: clinicRecords.symptoms,
        diagnosis: clinicRecords.diagnosis,
        prescription: clinicRecords.prescription,
        prescriptionStatus: clinicRecords.prescriptionStatus,
        status: clinicRecords.status,
        notes: clinicRecords.notes,
        staffName: users.name,
      }).from(clinicRecords)
      .leftJoin(users, eq(clinicRecords.staffId, users.id))
      .where(eq(clinicRecords.studentId, parseInt(studentId)))
      .orderBy(desc(clinicRecords.visitDate));
      
      res.json(records);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch student clinic records' });
    }
  });

  app.post("/api/clinic/records", requireAuth, async (req, res) => {
    try {
      const staffId = (req as any).user.id;
      const { studentId, symptoms, diagnosis, prescription, status, notes } = req.body;
      const { clinicRecords } = await import('./src/db/schema');
      
      
      const newRecord = await db.insert(clinicRecords).values({
        studentId: parseInt(studentId),
        staffId,
        symptoms,
        diagnosis,
        prescription,
        status,
        notes
      }).returning();
      
      res.json(newRecord[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create clinic record' });
    }
  });

  

  app.put("/api/clinic/records/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { symptoms, diagnosis, prescription, status, notes } = req.body;
      const { clinicRecords } = await import('./src/db/schema');
      
      
      
      const [updated] = await db.update(clinicRecords).set({
        symptoms,
        diagnosis,
        prescription,
        status,
        notes
      }).where(eq(clinicRecords.id, parseInt(id))).returning();
      
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update record' });
    }
  });
  
  app.delete("/api/clinic/records/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { clinicRecords } = await import('./src/db/schema');
      
      
      
      await db.delete(clinicRecords).where(eq(clinicRecords.id, parseInt(id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete record' });
    }
  });

  app.get("/api/clinic/doctors", requireAuth, async (req, res) => {
    try {
      const { users } = await import('./src/db/schema');
      
      
      const doctors = await db.select({
        id: users.id,
        name: users.name,
        doctorStatus: users.doctorStatus,
      }).from(users).where(eq(users.role, 'Clinic'));
      res.json(doctors);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      res.status(500).json({ error: 'Failed to fetch doctors' });
    }
  });

  app.put("/api/clinic/doctor-status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const { users } = await import('./src/db/schema');
      
      
      
      const [updated] = await db.update(users)
        .set({ doctorStatus: status })
        .where(eq(users.id, (req as any).user.id))
        .returning({ id: users.id, doctorStatus: users.doctorStatus });
        
      res.json(updated);
    } catch (err) {
      console.error('Error updating status:', err);
      res.status(500).json({ error: 'Failed to update status' });
    }
  });

  app.get("/api/clinic/appointments/student/:studentId", requireAuth, async (req, res) => {
    try {
      const { studentId } = req.params;
      const { clinicAppointments, users } = await import('./src/db/schema');
      
      
      
      const appointments = await db.select({
        id: clinicAppointments.id,
        doctorId: clinicAppointments.doctorId,
        doctorName: users.name,
        appointmentDate: clinicAppointments.appointmentDate,
        reason: clinicAppointments.reason,
        status: clinicAppointments.status,
      }).from(clinicAppointments)
      .leftJoin(users, eq(clinicAppointments.doctorId, users.id))
      .where(eq(clinicAppointments.studentId, parseInt(studentId)))
      .orderBy(desc(clinicAppointments.appointmentDate));
      
      res.json(appointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });

  app.post("/api/clinic/appointments", requireAuth, async (req, res) => {
    try {
      const { studentId, doctorId, appointmentDate, reason } = req.body;
      const { clinicAppointments } = await import('./src/db/schema');
      


      const requestedDate = new Date(appointmentDate);
      const { eq, and, ne, gt, lt } = await import('drizzle-orm');
      const thirtyMinsBefore = new Date(requestedDate.getTime() - 30 * 60000);
      const thirtyMinsAfter = new Date(requestedDate.getTime() + 30 * 60000);

      // Check if student is already booked
      const existingStudent = await db.select().from(clinicAppointments).where(
        and(
          eq(clinicAppointments.studentId, parseInt(studentId)),
          ne(clinicAppointments.status, 'Cancelled'),
          gt(clinicAppointments.appointmentDate, thirtyMinsBefore),
          lt(clinicAppointments.appointmentDate, thirtyMinsAfter)
        )
      ).limit(1);

      if (existingStudent.length > 0) {
        return res.status(409).json({ error: 'You already have an appointment scheduled near this time' });
      }
      
      if (doctorId) {
        // Check if doctor is already booked
        const existingDoctor = await db.select().from(clinicAppointments).where(
          and(
            eq(clinicAppointments.doctorId, parseInt(doctorId)),
            ne(clinicAppointments.status, 'Cancelled'),
            gt(clinicAppointments.appointmentDate, thirtyMinsBefore),
            lt(clinicAppointments.appointmentDate, thirtyMinsAfter)
          )
        ).limit(1);
        
        if (existingDoctor.length > 0) {
          return res.status(409).json({ error: 'The selected doctor is already booked for this time slot' });
        }
      }
      
      const [newAppt] = await db.insert(clinicAppointments).values({
        studentId: parseInt(studentId),
        doctorId: doctorId ? parseInt(doctorId) : null,
        appointmentDate: new Date(appointmentDate),
        reason,
        status: 'Scheduled'
      }).returning();
      
      res.json(newAppt);
    } catch (err) {
      console.error('Error creating appointment:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/clinic/appointments/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { clinicAppointments } = await import('./src/db/schema');
      
      
      
      const [updated] = await db.update(clinicAppointments)
        .set({ status })
        .where(eq(clinicAppointments.id, parseInt(id)))
        .returning();
      
      res.json(updated);
    } catch (err) {
      console.error('Error updating appointment:', err);
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  });


  
  app.put("/api/clinic/appointments/:id/reschedule", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { appointmentDate, doctorId } = req.body;
      const { clinicAppointments } = await import('./src/db/schema');
      const { eq, and, ne, gt, lt } = await import('drizzle-orm');
      

      const requestedDate = new Date(appointmentDate);
      const thirtyMinsBefore = new Date(requestedDate.getTime() - 30 * 60000);
      const thirtyMinsAfter = new Date(requestedDate.getTime() + 30 * 60000);
      
      const targetAppt = await db.select().from(clinicAppointments).where(eq(clinicAppointments.id, parseInt(id))).limit(1);
      if (!targetAppt.length) return res.status(404).json({ error: 'Appointment not found' });

      // Check if student is already booked
      const existingStudent = await db.select().from(clinicAppointments).where(
        and(
          eq(clinicAppointments.studentId, targetAppt[0].studentId),
          ne(clinicAppointments.id, parseInt(id)),
          ne(clinicAppointments.status, 'Cancelled'),
          gt(clinicAppointments.appointmentDate, thirtyMinsBefore),
          lt(clinicAppointments.appointmentDate, thirtyMinsAfter)
        )
      ).limit(1);

      if (existingStudent.length > 0) {
        return res.status(409).json({ error: 'You already have an appointment scheduled near this time' });
      }
      
      if (doctorId) {
        // Check if doctor is already booked
        const existingDoctor = await db.select().from(clinicAppointments).where(
          and(
            eq(clinicAppointments.doctorId, parseInt(doctorId)),
            ne(clinicAppointments.id, parseInt(id)),
            ne(clinicAppointments.status, 'Cancelled'),
            gt(clinicAppointments.appointmentDate, thirtyMinsBefore),
            lt(clinicAppointments.appointmentDate, thirtyMinsAfter)
          )
        ).limit(1);
        
        if (existingDoctor.length > 0) {
          return res.status(409).json({ error: 'The selected doctor is already booked for this time slot' });
        }
      }

      const [updated] = await db.update(clinicAppointments)
        .set({ appointmentDate: new Date(appointmentDate), doctorId: doctorId ? parseInt(doctorId) : targetAppt[0].doctorId })
        .where(eq(clinicAppointments.id, parseInt(id)))
        .returning();

      res.json(updated);
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      res.status(500).json({ error: 'Failed to reschedule appointment' });
    }
  });

  
  // Post-Consultation Surveys
  app.post("/api/clinic/surveys", requireAuth, async (req, res) => {
    try {
      const { appointmentId, overallRating, waitTimeRating, cleanlinessRating, staffFriendlinessRating, comments } = req.body;
      const { clinicSurveys } = await import('./src/db/schema');
      
      
      const [newSurvey] = await db.insert(clinicSurveys).values({
        studentId: (req as any).user.id,
        appointmentId,
        overallRating,
        waitTimeRating,
        cleanlinessRating,
        staffFriendlinessRating,
        comments,
      }).returning();
      
      res.json(newSurvey);
    } catch (err) {
      console.error('Error submitting survey:', err);
      res.status(500).json({ error: 'Failed to submit survey' });
    }
  });

  app.get("/api/clinic/surveys", requireAuth, async (req, res) => {
    try {
      const { clinicSurveys, clinicAppointments, users } = await import('./src/db/schema');
      
      
      
      const surveys = await db.select({
        id: clinicSurveys.id,
        overallRating: clinicSurveys.overallRating,
        waitTimeRating: clinicSurveys.waitTimeRating,
        cleanlinessRating: clinicSurveys.cleanlinessRating,
        staffFriendlinessRating: clinicSurveys.staffFriendlinessRating,
        comments: clinicSurveys.comments,
        createdAt: clinicSurveys.createdAt,
        studentName: users.name,
        doctorName: clinicAppointments.doctorId, // We can join to get doctor name, but simplify for now
      })
      .from(clinicSurveys)
      .leftJoin(users, eq(clinicSurveys.studentId, users.id))
      .leftJoin(clinicAppointments, eq(clinicSurveys.appointmentId, clinicAppointments.id))
      .orderBy(desc(clinicSurveys.createdAt))
      .limit(50);
      
      res.json(surveys);
    } catch (err) {
      console.error('Error fetching surveys:', err);
      res.status(500).json({ error: 'Failed to fetch surveys' });
    }
  });

  app.get("/api/clinic/surveys/stats", requireAuth, async (req, res) => {
    try {
      const { clinicSurveys } = await import('./src/db/schema');
      const { sql } = await import('drizzle-orm');
      
      
      const stats = await db.select({
        avgOverall: sql<number>`AVG(overall_rating)`,
        avgWaitTime: sql<number>`AVG(wait_time_rating)`,
        avgCleanliness: sql<number>`AVG(cleanliness_rating)`,
        avgStaff: sql<number>`AVG(staff_friendliness_rating)`,
        totalSurveys: sql<number>`COUNT(id)`
      }).from(clinicSurveys);
      
      res.json(stats[0]);
    } catch (err) {
      console.error('Error fetching survey stats:', err);
      res.status(500).json({ error: 'Failed to fetch survey stats' });
    }
  });

  // Medication Reminders
  app.get("/api/clinic/medications", requireAuth, async (req, res) => {
    try {
      const { medicationReminders } = await import('./src/db/schema');
      
      
      
      const reminders = await db.select()
        .from(medicationReminders)
        .where(eq(medicationReminders.studentId, (req as any).user.id))
        .orderBy(desc(medicationReminders.createdAt));
        
      res.json(reminders);
    } catch (err) {
      console.error('Error fetching medication reminders:', err);
      res.status(500).json({ error: 'Failed to fetch medication reminders' });
    }
  });

  app.post("/api/clinic/medications", requireAuth, async (req, res) => {
    try {
      const { medicationName, dosage, frequency, times, startDate, endDate, notes } = req.body;
      const { medicationReminders } = await import('./src/db/schema');
      
      
      const [newReminder] = await db.insert(medicationReminders).values({
        studentId: (req as any).user.id,
        medicationName,
        dosage,
        frequency,
        times,
        startDate,
        endDate,
        notes,
      }).returning();
      
      res.json(newReminder);
    } catch (err) {
      console.error('Error adding medication reminder:', err);
      res.status(500).json({ error: 'Failed to add medication reminder' });
    }
  });

  app.put("/api/clinic/medications/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const { medicationReminders } = await import('./src/db/schema');
      
      
      
      const [updatedReminder] = await db.update(medicationReminders)
        .set({ isActive })
        .where(and(
          eq(medicationReminders.id, parseInt(id)),
          eq(medicationReminders.studentId, (req as any).user.id)
        ))
        .returning();
        
      if (!updatedReminder) {
        return res.status(404).json({ error: 'Reminder not found' });
      }
      
      res.json(updatedReminder);
    } catch (err) {
      console.error('Error updating medication reminder:', err);
      res.status(500).json({ error: 'Failed to update medication reminder' });
    }
  });

  app.delete("/api/clinic/medications/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { medicationReminders } = await import('./src/db/schema');
      
      
      
      await db.delete(medicationReminders)
        .where(and(
          eq(medicationReminders.id, parseInt(id)),
          eq(medicationReminders.studentId, (req as any).user.id)
        ));
        
      res.json({ success: true });
    } catch (err) {
      console.error('Error deleting medication reminder:', err);
      res.status(500).json({ error: 'Failed to delete medication reminder' });
    }
  });

  // Campus Wellness Feed
  app.get("/api/clinic/wellness-feed", requireAuth, async (req, res) => {
    try {
      const { campusWellnessFeed, users } = await import('./src/db/schema');
      const { eq, desc, and } = await import('drizzle-orm');
      
      
      const feed = await db.select({
        id: campusWellnessFeed.id,
        title: campusWellnessFeed.title,
        content: campusWellnessFeed.content,
        category: campusWellnessFeed.category,
        createdAt: campusWellnessFeed.createdAt,
        authorName: users.name,
      })
      .from(campusWellnessFeed)
      .leftJoin(users, eq(campusWellnessFeed.authorId, users.id))
      .where(eq(campusWellnessFeed.isPublished, true))
      .orderBy(desc(campusWellnessFeed.createdAt))
      .limit(20);
      
      res.json(feed);
    } catch (err) {
      console.error('Error fetching wellness feed:', err);
      res.status(500).json({ error: 'Failed to fetch wellness feed' });
    }
  });

  app.post("/api/clinic/wellness-feed", requireAuth, requireRole(['Administrator', 'Doctor', 'Nurse', 'Pharmacist']), async (req, res) => {
    try {
      const { title, content, category, isPublished } = req.body;
      const { campusWellnessFeed } = await import('./src/db/schema');
      
      
      const [newPost] = await db.insert(campusWellnessFeed).values({
        title,
        content,
        category,
        authorId: (req as any).user.id,
        isPublished: isPublished !== undefined ? isPublished : true,
      }).returning();
      
      res.json(newPost);
    } catch (err) {
      console.error('Error creating wellness post:', err);
      res.status(500).json({ error: 'Failed to create wellness post' });
    }
  });

  app.get("/api/clinic/appointments", requireAuth, async (req, res) => {
    try {
      const { clinicAppointments, users } = await import('./src/db/schema');
      
      
      
      const st = db.select({ id: users.id, name: users.name, username: users.username }).from(users).as('st');
      const dr = db.select({ id: users.id, name: users.name }).from(users).as('dr');
      
      const appointments = await db.select({
        id: clinicAppointments.id,
        studentId: clinicAppointments.studentId,
        studentName: st.name,
        studentUsername: st.username,
        doctorId: clinicAppointments.doctorId,
        doctorName: dr.name,
        appointmentDate: clinicAppointments.appointmentDate,
        reason: clinicAppointments.reason,
        status: clinicAppointments.status,
      }).from(clinicAppointments)
      .leftJoin(st, eq(clinicAppointments.studentId, st.id))
      .leftJoin(dr, eq(clinicAppointments.doctorId, dr.id))
      .orderBy(desc(clinicAppointments.appointmentDate));
      
      res.json(appointments);
    } catch (err) {
      console.error('Error fetching all appointments:', err);
      res.status(500).json({ error: 'Failed to fetch all appointments' });
    }
  });

app.get("/api/clinic/student/search/:query", requireAuth, async (req, res) => {
    try {
      const { query } = req.params;
      const { users } = await import('./src/db/schema');
      
      const { eq, or, ilike } = await import('drizzle-orm');
      
      const student = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
      }).from(users)
      .where(or(
        eq(users.username, query),
        ilike(users.email, `%${query}%`)
      ))
      .limit(1);
      
      if (student.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      res.json(student[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to search student' });
    }
  });

  
  // --- Pharmacy Inventory API ---
  app.get("/api/clinic/inventory", requireAuth, async (req, res) => {
    try {
      const { pharmacyInventory } = await import('./src/db/schema');
      
      
      const inventory = await db.select().from(pharmacyInventory);
      res.json(inventory);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  });

  app.post("/api/clinic/inventory", requireAuth, async (req, res) => {
    try {
      const { name, sku, description, category, unit, stockLevel, reorderThreshold, expiryDate, supplier } = req.body;
      const { pharmacyInventory } = await import('./src/db/schema');
      
      
      const newItem = await db.insert(pharmacyInventory).values({
        name,
        sku,
        description,
        category,
        unit,
        stockLevel: parseInt(stockLevel),
        reorderThreshold: parseInt(reorderThreshold),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        supplier,
        lastUpdated: new Date()
      }).returning();
      
      res.json(newItem[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to add inventory item' });
    }
  });

  app.put("/api/clinic/inventory/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, sku, description, category, unit, stockLevel, reorderThreshold, expiryDate, supplier } = req.body;
      const { pharmacyInventory } = await import('./src/db/schema');
      
      
      
      const updatedItem = await db.update(pharmacyInventory).set({
        name,
        description,
        category,
        unit,
        stockLevel: parseInt(stockLevel),
        reorderThreshold: parseInt(reorderThreshold),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        supplier,
        lastUpdated: new Date()
      }).where(eq(pharmacyInventory.id, parseInt(id))).returning();
      
      if (updatedItem.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      // If stock drops below threshold, we could create a notification here
      if (updatedItem[0].stockLevel <= updatedItem[0].reorderThreshold) {
        const { notifications, users } = await import('./src/db/schema');
      
        const clinicStaff = await db.select({ id: users.id }).from(users).where(eq(users.role, 'Clinic'));
        if (clinicStaff.length > 0) {
          const notifs = clinicStaff.map(staff => ({
            userId: staff.id,
            title: 'Low Stock Alert',
            message: `Medication ${updatedItem[0].name} is low on stock (${updatedItem[0].stockLevel} ${updatedItem[0].unit}s remaining).`,
            type: 'warning',
            isRead: 'false',
            createdAt: new Date()
          }));
          await db.insert(notifications).values(notifs);
        }
      }
      
      res.json(updatedItem[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update inventory item' });
    }
  });

  app.delete("/api/clinic/inventory/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { pharmacyInventory } = await import('./src/db/schema');
      
      
      
      await db.delete(pharmacyInventory).where(eq(pharmacyInventory.id, parseInt(id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete inventory item' });
    }
  });

  
  
  // --- Pharmacy API ---
  app.get("/api/pharmacy/prescriptions", requireAuth, async (req, res) => {
    try {
      const { clinicRecords, users } = await import('./src/db/schema');
      const { eq, isNotNull, desc } = await import('drizzle-orm');
      
      
      const st = db.select({ id: users.id, name: users.name, username: users.username }).from(users).as('st');
      const dr = db.select({ id: users.id, name: users.name }).from(users).as('dr');
      
      const prescriptions = await db.select({
        id: clinicRecords.id,
        studentId: clinicRecords.studentId,
        studentName: st.name,
        studentUsername: st.username,
        doctorId: clinicRecords.staffId,
        doctorName: dr.name,
        visitDate: clinicRecords.visitDate,
        prescription: clinicRecords.prescription,
        prescriptionStatus: clinicRecords.prescriptionStatus,
      }).from(clinicRecords)
      .leftJoin(st, eq(clinicRecords.studentId, st.id))
      .leftJoin(dr, eq(clinicRecords.staffId, dr.id))
      .where(isNotNull(clinicRecords.prescription))
      .orderBy(desc(clinicRecords.visitDate));
      
      res.json(prescriptions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch prescriptions' });
    }
  });

  app.put("/api/pharmacy/prescriptions/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { clinicRecords } = await import('./src/db/schema');
      
      
      
      const updated = await db.update(clinicRecords)
        .set({ prescriptionStatus: status })
        .where(eq(clinicRecords.id, parseInt(id)))
        .returning();
      
      res.json(updated[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update prescription status' });
    }
  });

// --- Medical Profile API ---
  app.get("/api/clinic/student/:studentId/profile", requireAuth, async (req, res) => {
    try {
      const { studentId } = req.params;
      const { studentMedicalProfiles } = await import('./src/db/schema');
      
      
      
      const profile = await db.select().from(studentMedicalProfiles).where(eq(studentMedicalProfiles.studentId, parseInt(studentId))).limit(1);
      
      if (profile.length === 0) {
        // Return empty profile object if none exists yet
        return res.json({
          studentId: parseInt(studentId),
          bloodGroup: '',
          genotype: '',
          allergies: '',
          pastConditions: '',
          currentMedications: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelation: ''
        });
      }
      
      res.json(profile[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch medical profile' });
    }
  });

  app.put("/api/clinic/student/:studentId/profile", requireAuth, async (req, res) => {
    try {
      const { studentId } = req.params;
      const data = req.body;
      const { studentMedicalProfiles } = await import('./src/db/schema');
      
      
      
      // Check if profile exists
      const existing = await db.select().from(studentMedicalProfiles).where(eq(studentMedicalProfiles.studentId, parseInt(studentId))).limit(1);
      
      let profile;
      if (existing.length === 0) {
        // Create
        profile = await db.insert(studentMedicalProfiles).values({
          studentId: parseInt(studentId),
          ...data,
          updatedAt: new Date()
        }).returning();
      } else {
        // Update
        profile = await db.update(studentMedicalProfiles).set({
          ...data,
          updatedAt: new Date()
        }).where(eq(studentMedicalProfiles.studentId, parseInt(studentId))).returning();
      }
      
      res.json(profile[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update medical profile' });
    }
  });
  
  app.post("/api/clinic/student/:studentId/documents", requireAuth, async (req, res) => {
    try {
      const { studentId } = req.params;
      const { title, description, category, fileUrl, fileType, fileSize } = req.body;
      const { documents } = await import('./src/db/schema');
      
      
      const [newDoc] = await db.insert(documents).values({
        title: title || 'Untitled Document',
        description,
        fileUrl,
        fileType,
        fileSize: parseInt(fileSize) || 0,
        uploaderId: parseInt(studentId), // Assign to student
        category: category || 'Medical',
        isPublic: 'false',
        createdAt: new Date(),
      }).returning();
      
      res.json(newDoc);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create document' });
    }
  });
  
  // --- Clinic Forms API ---
  app.get("/api/clinic/forms", requireAuth, async (req, res) => {
    try {
      const { clinicForms } = await import('./src/db/schema');
      
      const { desc } = await import('drizzle-orm');
      
      const forms = await db.select().from(clinicForms).orderBy(desc(clinicForms.createdAt));
      res.json(forms);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch clinic forms' });
    }
  });

  app.post("/api/clinic/forms", requireAuth, async (req, res) => {
    try {
      const { title, description, fields, isActive } = req.body;
      const { clinicForms } = await import('./src/db/schema');
      
      
      const [newForm] = await db.insert(clinicForms).values({
        title,
        description,
        fields,
        createdBy: (req as any).user.id,
        isActive: isActive !== undefined ? isActive : true,
      }).returning();
      
      res.json(newForm);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create clinic form' });
    }
  });
  
  app.put("/api/clinic/forms/:id", requireAuth, async (req, res) => {
    try {
      const { title, description, fields, isActive } = req.body;
      const { clinicForms } = await import('./src/db/schema');
      
      
      
      const [updatedForm] = await db.update(clinicForms)
        .set({ title, description, fields, isActive })
        .where(eq(clinicForms.id, parseInt(req.params.id)))
        .returning();
        
      res.json(updatedForm);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update clinic form' });
    }
  });
  
  app.delete("/api/clinic/forms/:id", requireAuth, async (req, res) => {
    try {
      const { clinicForms } = await import('./src/db/schema');
      
      
      
      await db.delete(clinicForms).where(eq(clinicForms.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete clinic form' });
    }
  });
  
  // --- Clinic Form Submissions API ---
  app.get("/api/clinic/form-submissions", requireAuth, async (req, res) => {
    try {
      const { clinicFormSubmissions, clinicForms, users } = await import('./src/db/schema');
      
      
      
      const submissions = await db.select({
        id: clinicFormSubmissions.id,
        formId: clinicFormSubmissions.formId,
        formTitle: clinicForms.title,
        studentId: clinicFormSubmissions.studentId,
        studentName: users.name,
        data: clinicFormSubmissions.data,
        status: clinicFormSubmissions.status,
        createdAt: clinicFormSubmissions.createdAt,
      }).from(clinicFormSubmissions)
      .leftJoin(clinicForms, eq(clinicFormSubmissions.formId, clinicForms.id))
      .leftJoin(users, eq(clinicFormSubmissions.studentId, users.id))
      .orderBy(desc(clinicFormSubmissions.createdAt));
      
      res.json(submissions);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch form submissions' });
    }
  });

  app.get("/api/clinic/form-submissions/student/:studentId", requireAuth, async (req, res) => {
    try {
      const { studentId } = req.params;
      const { clinicFormSubmissions, clinicForms } = await import('./src/db/schema');
      
      
      
      const submissions = await db.select({
        id: clinicFormSubmissions.id,
        formId: clinicFormSubmissions.formId,
        formTitle: clinicForms.title,
        studentId: clinicFormSubmissions.studentId,
        data: clinicFormSubmissions.data,
        status: clinicFormSubmissions.status,
        createdAt: clinicFormSubmissions.createdAt,
      }).from(clinicFormSubmissions)
      .leftJoin(clinicForms, eq(clinicFormSubmissions.formId, clinicForms.id))
      .where(eq(clinicFormSubmissions.studentId, parseInt(studentId)))
      .orderBy(desc(clinicFormSubmissions.createdAt));
      
      res.json(submissions);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch form submissions for student' });
    }
  });
  
  app.post("/api/clinic/form-submissions", requireAuth, async (req, res) => {
    try {
      const { formId, data } = req.body;
      const { clinicFormSubmissions } = await import('./src/db/schema');
      
      
      const [newSubmission] = await db.insert(clinicFormSubmissions).values({
        formId: parseInt(formId),
        studentId: (req as any).user.id,
        data,
      }).returning();
      
      res.json(newSubmission);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to submit form' });
    }
  });

  app.put("/api/clinic/form-submissions/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const { clinicFormSubmissions } = await import('./src/db/schema');
      
      
      
      const [updatedSubmission] = await db.update(clinicFormSubmissions)
        .set({ status, reviewedBy: (req as any).user.id })
        .where(eq(clinicFormSubmissions.id, parseInt(req.params.id)))
        .returning();
        
      res.json(updatedSubmission);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update form submission status' });
    }
  });

  // --- Clinic Lab Requests API ---
  app.get("/api/clinic/lab-requests", requireAuth, async (req, res) => {
    try {
      const { clinicLabRequests, users } = await import('./src/db/schema');
      
      
      
      // Need aliases for doctor and student
      const { alias } = await import('drizzle-orm/pg-core');
      const studentAlias = alias(users, 'student');
      const doctorAlias = alias(users, 'doctor');
      
      const requests = await db.select({
        id: clinicLabRequests.id,
        studentId: clinicLabRequests.studentId,
        studentName: studentAlias.name,
        doctorId: clinicLabRequests.doctorId,
        doctorName: doctorAlias.name,
        testsRequested: clinicLabRequests.testsRequested,
        notes: clinicLabRequests.notes,
        status: clinicLabRequests.status,
        resultsSummary: clinicLabRequests.resultsSummary,
        createdAt: clinicLabRequests.createdAt,
      }).from(clinicLabRequests)
      .leftJoin(studentAlias, eq(clinicLabRequests.studentId, studentAlias.id))
      .leftJoin(doctorAlias, eq(clinicLabRequests.doctorId, doctorAlias.id))
      .orderBy(desc(clinicLabRequests.createdAt));
      
      res.json(requests);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch lab requests' });
    }
  });

  app.get("/api/clinic/lab-requests/student/:studentId", requireAuth, async (req, res) => {
    try {
      const { studentId } = req.params;
      const { clinicLabRequests, users } = await import('./src/db/schema');
      
      
      
      const { alias } = await import('drizzle-orm/pg-core');
      const doctorAlias = alias(users, 'doctor');
      
      const requests = await db.select({
        id: clinicLabRequests.id,
        studentId: clinicLabRequests.studentId,
        doctorId: clinicLabRequests.doctorId,
        doctorName: doctorAlias.name,
        testsRequested: clinicLabRequests.testsRequested,
        notes: clinicLabRequests.notes,
        status: clinicLabRequests.status,
        resultsSummary: clinicLabRequests.resultsSummary,
        createdAt: clinicLabRequests.createdAt,
      }).from(clinicLabRequests)
      .leftJoin(doctorAlias, eq(clinicLabRequests.doctorId, doctorAlias.id))
      .where(eq(clinicLabRequests.studentId, parseInt(studentId)))
      .orderBy(desc(clinicLabRequests.createdAt));
      
      res.json(requests);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch lab requests for student' });
    }
  });

  app.post("/api/clinic/lab-requests", requireAuth, async (req, res) => {
    try {
      const { studentId, testsRequested, notes } = req.body;
      const { clinicLabRequests, notifications, users } = await import('./src/db/schema');
      
      const { eq, ne, and } = await import('drizzle-orm');
      
      const doctorId = (req as any).user.id;
      
      const [newRequest] = await db.insert(clinicLabRequests).values({
        studentId: parseInt(studentId),
        doctorId,
        testsRequested: JSON.stringify(testsRequested),
        notes,
      }).returning();
      
      // Notify clinic staff / lab technicians
      const clinicStaff = await db.select({ id: users.id }).from(users)
        .where(and(eq(users.role, 'Clinic'), ne(users.id, doctorId)));
        
      if (clinicStaff.length > 0) {
        await db.insert(notifications).values(
          clinicStaff.map(staff => ({
            userId: staff.id,
            title: 'New Lab Request',
            message: `A new lab test order has been submitted by Dr. ${(req as any).user.name}.`,
            type: 'info',
            isRead: 'false',
            createdAt: new Date(),
          }))
        );
      }
      
      res.json(newRequest);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create lab request' });
    }
  });

  app.put("/api/clinic/lab-requests/:id/status", requireAuth, async (req, res) => {
    try {
      const { status, resultsSummary } = req.body;
      const { clinicLabRequests } = await import('./src/db/schema');
      
      
      
      const updateData: any = { status };
      if (resultsSummary !== undefined) updateData.resultsSummary = resultsSummary;
      
      const [updatedRequest] = await db.update(clinicLabRequests)
        .set(updateData)
        .where(eq(clinicLabRequests.id, parseInt(req.params.id)))
        .returning();
        
      res.json(updatedRequest);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update lab request' });
    }
  });

  // --- Health Insurance Records API ---
  app.get("/api/clinic/health-insurance", requireAuth, async (req, res) => {
    try {
      const { healthInsuranceRecords, users } = await import('./src/db/schema');
      
      
      
      const records = await db.select({
        id: healthInsuranceRecords.id,
        studentId: healthInsuranceRecords.studentId,
        studentName: users.name,
        providerName: healthInsuranceRecords.providerName,
        policyNumber: healthInsuranceRecords.policyNumber,
        groupNumber: healthInsuranceRecords.groupNumber,
        coverageStartDate: healthInsuranceRecords.coverageStartDate,
        coverageEndDate: healthInsuranceRecords.coverageEndDate,
        status: healthInsuranceRecords.status,
        verificationNotes: healthInsuranceRecords.verificationNotes,
        createdAt: healthInsuranceRecords.createdAt,
      }).from(healthInsuranceRecords)
      .leftJoin(users, eq(healthInsuranceRecords.studentId, users.id));
      
      res.json(records);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch insurance records' });
    }
  });

  app.get("/api/clinic/health-insurance/student/:studentId", requireAuth, async (req, res) => {
    try {
      const { studentId } = req.params;
      const { healthInsuranceRecords } = await import('./src/db/schema');
      
      
      
      const records = await db.select().from(healthInsuranceRecords).where(eq(healthInsuranceRecords.studentId, parseInt(studentId)));
      res.json(records);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch insurance records' });
    }
  });

  app.post("/api/clinic/health-insurance", requireAuth, async (req, res) => {
    try {
      const { providerName, policyNumber, groupNumber, coverageStartDate, coverageEndDate } = req.body;
      const { healthInsuranceRecords } = await import('./src/db/schema');
      
      
      const [newRecord] = await db.insert(healthInsuranceRecords).values({
        studentId: (req as any).user.id,
        providerName,
        policyNumber,
        groupNumber,
        coverageStartDate,
        coverageEndDate,
      }).returning();
      
      res.json(newRecord);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create insurance record' });
    }
  });

  app.put("/api/clinic/health-insurance/:id", requireAuth, async (req, res) => {
    try {
      const { status, verificationNotes } = req.body;
      const { healthInsuranceRecords } = await import('./src/db/schema');
      
      
      
      const [updatedRecord] = await db.update(healthInsuranceRecords)
        .set({ status, verificationNotes })
        .where(eq(healthInsuranceRecords.id, parseInt(req.params.id)))
        .returning();
        
      res.json(updatedRecord);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update insurance record' });
    }
  });

  app.get("/api/clinic/student/:studentId/documents", requireAuth, async (req, res) => {
    try {
      const { studentId } = req.params;
      const { documents, users } = await import('./src/db/schema');
      
      const { eq, and, desc } = await import('drizzle-orm');
      
      const docs = await db.select({
        id: documents.id,
        title: documents.title,
        description: documents.description,
        fileUrl: documents.fileUrl,
        fileType: documents.fileType,
        fileSize: documents.fileSize,
        category: documents.category,
        uploaderId: documents.uploaderId,
        createdAt: documents.createdAt,
      }).from(documents)
      .where(and(
        eq(documents.uploaderId, parseInt(studentId)),
        eq(documents.category, 'Medical')
      ))
      .orderBy(desc(documents.createdAt));
      
      res.json(docs);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch medical documents' });
    }
  });


  app.post("/api/feedback", requireAuth, async (req, res) => {
    try {
      const { type, message } = req.body;
      const userId = (req as any).user.id;
      const { portalFeedback } = await import('./src/db/schema');
      
      
      await db.insert(portalFeedback).values({
        userId,
        type: type || 'Other',
        message
      });
      
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  });



  app.get("/api/public/calendar-events", async (req, res) => {
    try {
      const { academicCalendarEvents } = await import('./src/db/schema');
      
      const { asc, gte } = await import('drizzle-orm');
      
      const events = await db.select()
        .from(academicCalendarEvents)
        .where(gte(academicCalendarEvents.endDate, new Date()))
        .orderBy(asc(academicCalendarEvents.startDate))
        .limit(10);
        
      res.json(events);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch public calendar events' });
    }
  });

  app.get("/api/public/news", async (req, res) => {
    try {
      const { cmsNewsEvents, users } = await import('./src/db/schema');
      
      const { eq, and, desc } = await import('drizzle-orm');
      
      const news = await db.select({
        id: cmsNewsEvents.id,
        title: cmsNewsEvents.title,
        content: cmsNewsEvents.content,
        category: cmsNewsEvents.type,
        imageUrl: cmsNewsEvents.imageUrl,
        author: users.name,
        createdAt: cmsNewsEvents.createdAt
      })
      .from(cmsNewsEvents)
      .leftJoin(users, eq(cmsNewsEvents.authorId, users.id))
      .where(
        and(
          eq(cmsNewsEvents.type, 'news'),
          eq(cmsNewsEvents.status, 'Published')
        )
      )
      .orderBy(desc(cmsNewsEvents.createdAt))
      .limit(5);
        
      if (news.length === 0) {
        return res.json([
          {
            id: 1,
            title: 'Campus Closure for Upcoming Holiday',
            content: 'Please be informed that the campus will remain closed on Friday for the national holiday. All scheduled classes and administrative activities will resume on Monday.',
            category: 'Announcement',
            author: 'Admin',
            imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            title: 'New Library Hours Extended',
            content: 'In response to student requests, the central library will now remain open until midnight on weekdays. We hope this supports your ongoing research and studies.',
            category: 'Tip',
            author: 'Library',
            imageUrl: null,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 3,
            title: 'Emergency Drill Tomorrow',
            content: 'A routine fire and emergency drill will be conducted tomorrow at 10:00 AM. Please follow all instructions from the safety wardens.',
            category: 'Alert',
            author: 'Safety Office',
            imageUrl: null,
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ]);
      }
      
      res.json(news);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  });


  app.get("/api/library/books", requireAuth, async (req, res) => {
    try {
      const { books } = await import('./src/db/schema');
      
      const { ilike, or } = await import('drizzle-orm');
      
      const search = req.query.search;
      let allBooks;
      if (search) {
        allBooks = await db.select().from(books).where(
          or(
            ilike(books.title, `%${search}%`),
            ilike(books.author, `%${search}%`)
          )
        );
      } else {
        allBooks = await db.select().from(books);
      }
      res.json(allBooks);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  });

  app.post("/api/library/books/:id/hold", requireAuth, async (req, res) => {
    try {
      const studentId = (req as any).user.id;
      const bookId = parseInt(req.params.id);
      
      const { books, bookLoans } = await import('./src/db/schema');
      
      
      
      // Check if book is available
      const bookResult = await db.select().from(books).where(eq(books.id, bookId));
      if (bookResult.length === 0) return res.status(404).json({ error: 'Book not found' });
      if (!bookResult[0].available) return res.status(400).json({ error: 'Book is currently not available' });
      
      // Mark as unavailable
      await db.update(books).set({ available: false }).where(eq(books.id, bookId));
      
      // Create loan/hold record
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 2 weeks hold
      
      await db.insert(bookLoans).values({
        studentId,
        bookId,
        dueDate,
        status: 'reserved'
      });
      
      res.json({ success: true, message: 'Book reserved successfully' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to reserve book' });
    }
  });

  app.get("/api/library/my-holds", requireAuth, async (req, res) => {
    try {
      const studentId = (req as any).user.id;
      
      const { books, bookLoans } = await import('./src/db/schema');
      
      
      
      const holds = await db.select({
        id: bookLoans.id,
        status: bookLoans.status,
        borrowedDate: bookLoans.borrowedDate,
        dueDate: bookLoans.dueDate,
        book: {
          id: books.id,
          title: books.title,
          author: books.author,
          category: books.category,
          coverColor: books.coverColor
        }
      })
      .from(bookLoans)
      .innerJoin(books, eq(bookLoans.bookId, books.id))
      .where(eq(bookLoans.studentId, studentId))
      .orderBy(desc(bookLoans.createdAt));
      
      res.json(holds);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch my holds' });
    }
  });


  app.get("/api/student/profile", requireAuth, async (req, res) => {
    try {
      const studentId = (req as any).user.id;
      const { users, studentMedicalProfiles } = await import('./src/db/schema');
      
      
      
      const userRes = await db.select().from(users).where(eq(users.id, studentId));
      if (!userRes.length) return res.status(404).json({ error: 'User not found' });
      const user = userRes[0];
      
      const medRes = await db.select().from(studentMedicalProfiles).where(eq(studentMedicalProfiles.studentId, studentId));
      const medProfile: any = medRes[0] || {};
      
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        department: user.department || 'Technology & Applied Sciences',
        phone: user.phone || '',
        profilePicture: user.profilePicture || '',
        emergencyContactName: medProfile.emergencyContactName || '',
        emergencyContactPhone: medProfile.emergencyContactPhone || '',
        emergencyContactRelation: medProfile.emergencyContactRelation || '',
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.put("/api/student/profile", requireAuth, async (req, res) => {
    try {
      const studentId = (req as any).user.id;
      const { phone, profilePicture, emergencyContactName, emergencyContactPhone, emergencyContactRelation } = req.body;
      
      const { users, studentMedicalProfiles } = await import('./src/db/schema');
      
      
      
      // Update user
      const userUpdate: any = {};
      if (phone !== undefined) userUpdate.phone = phone;
      if (profilePicture !== undefined) userUpdate.profilePicture = profilePicture;
      
      if (Object.keys(userUpdate).length > 0) {
        await db.update(users).set(userUpdate).where(eq(users.id, studentId));
      }
      
      // Update medical profile for emergency contacts
      if (emergencyContactName !== undefined || emergencyContactPhone !== undefined || emergencyContactRelation !== undefined) {
        const medRes = await db.select().from(studentMedicalProfiles).where(eq(studentMedicalProfiles.studentId, studentId));
        
        if (medRes.length > 0) {
          const medUpdate: any = {};
          if (emergencyContactName !== undefined) medUpdate.emergencyContactName = emergencyContactName;
          if (emergencyContactPhone !== undefined) medUpdate.emergencyContactPhone = emergencyContactPhone;
          if (emergencyContactRelation !== undefined) medUpdate.emergencyContactRelation = emergencyContactRelation;
          
          await db.update(studentMedicalProfiles).set(medUpdate).where(eq(studentMedicalProfiles.studentId, studentId));
        } else {
          await db.insert(studentMedicalProfiles).values({
            studentId,
            emergencyContactName: emergencyContactName || null,
            emergencyContactPhone: emergencyContactPhone || null,
            emergencyContactRelation: emergencyContactRelation || null
          });
        }
      }
      
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // --- Vite Middleware (Development) ---








  // --- CMS Endpoints ---
  app.get("/api/cms/content_blocks", async (req, res) => {
    try {
      const section = req.query.section as string;
      const { contentBlocks } = await import('./src/db/schema');
      
      
      let query = db.select().from(contentBlocks).orderBy(desc(contentBlocks.createdAt));
      if (section) {
        query = db.select().from(contentBlocks).where(eq(contentBlocks.section, section)).orderBy(desc(contentBlocks.createdAt)) as any;
      }
      const data = await query;
      res.json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch content blocks' });
    }
  });

  app.get("/api/cms/content_blocks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { contentBlocks } = await import('./src/db/schema');
      
      
      const [block] = await db.select().from(contentBlocks).where(eq(contentBlocks.id, parseInt(id)));
      if (!block) return res.status(404).json({ error: 'Not found' });
      res.json(block);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch content block' });
    }
  });

  app.post("/api/cms/content_blocks", requireAuth, requireRole(['Administrator', 'Admin', 'Content Manager']), async (req, res) => {
    try {
      const { contentBlocks } = await import('./src/db/schema');
      
      const [newBlock] = await db.insert(contentBlocks).values({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      res.json(newBlock);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create content block' });
    }
  });

  app.put("/api/cms/content_blocks/:id", requireAuth, requireRole(['Administrator', 'Admin', 'Content Manager']), async (req, res) => {
    try {
      const { id } = req.params;
      const { contentBlocks } = await import('./src/db/schema');
      
      
      
      const updateData = { ...req.body };
      if (updateData.createdAt) updateData.createdAt = new Date(updateData.createdAt);
      if (updateData.updatedAt) updateData.updatedAt = new Date(updateData.updatedAt);
      
      const [updated] = await db.update(contentBlocks)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(contentBlocks.id, parseInt(id)))
        .returning();
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update content block' });
    }
  });

  app.delete("/api/cms/content_blocks/:id", requireAuth, requireRole(['Administrator', 'Admin', 'Content Manager']), async (req, res) => {
    try {
      const { id } = req.params;
      const { contentBlocks } = await import('./src/db/schema');
      
      
      await db.delete(contentBlocks).where(eq(contentBlocks.id, parseInt(id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete content block' });
    }
  });

  app.get("/api/cms/news_events", async (req, res) => {
    try {
      const type = req.query.type as string;
      const includeFuture = req.query.includeFuture === 'true';
      const { cmsNewsEvents } = await import('./src/db/schema');
      
      const { eq, desc, and, or, isNull, lte } = await import('drizzle-orm');
      
      let conditions = [];
      if (type) conditions.push(eq(cmsNewsEvents.type, type));
      if (!includeFuture) {
        conditions.push(or(isNull(cmsNewsEvents.publishDate), lte(cmsNewsEvents.publishDate, new Date())));
      }
      
      let query = db.select().from(cmsNewsEvents).orderBy(desc(cmsNewsEvents.date));
      if (conditions.length > 0) {
        query = db.select().from(cmsNewsEvents).where(and(...conditions)).orderBy(desc(cmsNewsEvents.date)) as any;
      }
      
      const data = await query;
      res.json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch news/events' });
    }
  });

  app.get("/api/cms/news_events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { cmsNewsEvents } = await import('./src/db/schema');
      
      
      const [item] = await db.select().from(cmsNewsEvents).where(eq(cmsNewsEvents.id, parseInt(id)));
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch news/event' });
    }
  });

  app.post("/api/cms/news_events", requireAuth, requireRole(['Administrator', 'Admin', 'Content Manager']), async (req, res) => {
    try {
      const { cmsNewsEvents } = await import('./src/db/schema');
      
      
      const insertData = { ...req.body };
      if (insertData.date) insertData.date = new Date(insertData.date);
      if (insertData.publishDate) insertData.publishDate = new Date(insertData.publishDate);
      if (insertData.publish_date) {
        insertData.publishDate = new Date(insertData.publish_date);
        delete insertData.publish_date;
      }
      if (insertData.endDate) insertData.endDate = new Date(insertData.endDate);
      if (insertData.end_date) {
        insertData.endDate = new Date(insertData.end_date);
        delete insertData.end_date;
      }
      
      const [newItem] = await db.insert(cmsNewsEvents).values({
        ...insertData,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      res.json(newItem);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create news/event' });
    }
  });

  app.put("/api/cms/news_events/:id", requireAuth, requireRole(['Administrator', 'Admin', 'Content Manager']), async (req, res) => {
    try {
      const { id } = req.params;
      const { cmsNewsEvents } = await import('./src/db/schema');
      
      
      
      // Fix dates mapping
      const updateData = { ...req.body };
      if (updateData.createdAt) updateData.createdAt = new Date(updateData.createdAt);
      if (updateData.updatedAt) updateData.updatedAt = new Date(updateData.updatedAt);
      if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
      if (updateData.date) updateData.date = new Date(updateData.date);
      if (updateData.publishDate) updateData.publishDate = new Date(updateData.publishDate);
      if (updateData.publish_date) {
        updateData.publishDate = new Date(updateData.publish_date);
        delete updateData.publish_date;
      }
      
      const [updated] = await db.update(cmsNewsEvents)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(cmsNewsEvents.id, parseInt(id)))
        .returning();
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update news/event' });
    }
  });

  app.delete("/api/cms/news_events/:id", requireAuth, requireRole(['Administrator', 'Admin', 'Content Manager']), async (req, res) => {
    try {
      const { id } = req.params;
      const { cmsNewsEvents } = await import('./src/db/schema');
      
      
      await db.delete(cmsNewsEvents).where(eq(cmsNewsEvents.id, parseInt(id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete news/event' });
    }
  });

  app.get("/api/cms/activity", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const { contentBlocks, cmsNewsEvents } = await import('./src/db/schema');
      
      const { desc } = await import('drizzle-orm');
      
      const blocks = await db.select().from(contentBlocks).orderBy(desc(contentBlocks.createdAt)).limit(limit);
      const news = await db.select().from(cmsNewsEvents).orderBy(desc(cmsNewsEvents.createdAt)).limit(limit);
      
      const mappedBlocks = blocks.map(b => ({
        id: `block-${b.id}`,
        originalId: b.id,
        title: b.title,
        type: `Content Block (${b.section})`,
        status: b.status,
        date: b.createdAt,
        action: 'Updated'
      }));
      
      const mappedNews = news.map(n => ({
        id: `news-${n.id}`,
        originalId: n.id,
        title: n.title,
        type: n.type === 'news' ? 'News Article' : 'Event',
        status: n.status,
        date: n.createdAt,
        action: 'Updated'
      }));
      
      const all = [...mappedBlocks, ...mappedNews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      res.json(all.slice(0, limit));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch activity log' });
    }
  });
// --- Messages API ---
app.get("/api/messages", requireAuth, async (req, res) => {
  try {
    const { messages, users, courses } = await import('./src/db/schema');
    
    const { eq, or, desc, and } = await import('drizzle-orm');
    const { alias } = await import('drizzle-orm/pg-core');
    const userId = (req as any).user.id;
    const { courseId } = req.query;
    
    const sender = alias(users, 'sender');
    const receiver = alias(users, 'receiver');

    let conditions = or(eq(messages.senderId, userId), eq(messages.receiverId, userId));
    if (courseId) {
      conditions = and(conditions, eq(messages.courseId, Number(courseId)));
    }

    const allMessages = await db.select({
      message: messages,
      course: {
        id: courses.id,
        code: courses.code,
        title: courses.title
      },
      sender: {
        id: sender.id,
        name: sender.name,
        role: sender.role,
        department: sender.department,
        profilePicture: sender.profilePicture
      },
      receiver: {
        id: receiver.id,
        name: receiver.name,
        role: receiver.role,
        department: receiver.department,
        profilePicture: receiver.profilePicture
      }
    })
    .from(messages)
    .leftJoin(sender, eq(messages.senderId, sender.id))
    .leftJoin(receiver, eq(messages.receiverId, receiver.id))
    .leftJoin(courses, eq(messages.courseId, courses.id))
    .where(conditions)
    .orderBy(desc(messages.createdAt));

    res.json(allMessages);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post("/api/messages", requireAuth, async (req, res) => {
  try {
    const { messages, users, courses } = await import('./src/db/schema');
    
    
    const userId = (req as any).user.id;
    const { receiverId, courseId, subject, content, attachmentUrl, attachmentName } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver and content are required' });
    }

    const [inserted] = await db.insert(messages).values({
      senderId: userId,
      receiverId: Number(receiverId),
      courseId: courseId ? Number(courseId) : null,
      subject: subject || 'Course Inquiry',
      content,
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
      isRead: 'false',
      createdAt: new Date()
    }).returning();
    
    const [senderUser] = await db.select({ id: users.id, name: users.name, role: users.role, profilePicture: users.profilePicture }).from(users).where(eq(users.id, userId));
    const [receiverUser] = await db.select({ id: users.id, name: users.name, role: users.role, profilePicture: users.profilePicture }).from(users).where(eq(users.id, Number(receiverId)));
    let courseData = null;
    if (courseId) {
      const [c] = await db.select({ id: courses.id, code: courses.code, title: courses.title }).from(courses).where(eq(courses.id, Number(courseId)));
      courseData = c || null;
    }

    const fullMessagePayload = {
      message: inserted,
      course: courseData,
      sender: senderUser,
      receiver: receiverUser
    };

    // WebSocket real-time dispatch
    notifyUser(Number(receiverId), { type: 'new_message', data: fullMessagePayload });
    notifyUser(userId, { type: 'new_message', data: fullMessagePayload });

    // Notification table entry for persistent notification badge
    try {
      const { notifications } = await import('./src/db/schema');
      await db.insert(notifications).values({
        userId: Number(receiverId),
        title: `New Message from ${senderUser?.name || 'User'}`,
        message: content.length > 80 ? content.substring(0, 80) + '...' : content,
        type: 'info',
        isRead: 'false'
      });
    } catch (notifErr) {
      console.error('Failed to create notification record:', notifErr);
    }

    res.json(fullMessagePayload);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.post("/api/messages/mark-read", requireAuth, async (req, res) => {
  try {
    const { messages } = await import('./src/db/schema');
    
    
    const userId = (req as any).user.id;
    const { senderId } = req.body;

    if (senderId) {
      await db.update(messages)
        .set({ isRead: 'true' })
        .where(and(eq(messages.receiverId, userId), eq(messages.senderId, Number(senderId))));
      
      notifyUser(Number(senderId), { type: 'messages_read', byUserId: userId });
    }

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

app.get("/api/users/online", requireAuth, (req, res) => {
  res.json(Array.from(userSockets.keys()));
});

app.get("/api/users/directory", requireAuth, async (req, res) => {
  try {
    const { users } = await import('./src/db/schema');
    
    const { ne } = await import('drizzle-orm');
    const userId = (req as any).user.id;
    
    const directoryUsers = await db.select({
      id: users.id,
      name: users.name,
      role: users.role,
      department: users.department,
      profilePicture: users.profilePicture
    })
    .from(users)
    .where(ne(users.id, userId));
    
    res.json(directoryUsers);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch directory' });
  }
});

app.get("/api/courses/my-contacts", requireAuth, async (req, res) => {
  try {
    const { users, studentCourses, courseAllocations, courses } = await import('./src/db/schema');
    
    const { eq, inArray, ne } = await import('drizzle-orm');
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    let userCourses: { id: number; code: string; title: string }[] = [];
    let contactIds = new Set<number>();
    let courseContactMap = new Map<number, { courseId: number; courseCode: string; courseTitle: string }[]>();

    if (userRole === 'Student') {
      const enrolled = await db.select({
        courseId: courses.id,
        code: courses.code,
        title: courses.title
      })
      .from(studentCourses)
      .innerJoin(courses, eq(studentCourses.courseId, courses.id))
      .where(eq(studentCourses.studentId, userId));

      userCourses = enrolled.map(e => ({ id: e.courseId, code: e.code, title: e.title }));

      const courseIds = userCourses.map(c => c.id);
      if (courseIds.length > 0) {
        const lecturers = await db.select({
          lecturerId: courseAllocations.lecturerId,
          courseId: courses.id,
          code: courses.code,
          title: courses.title
        })
        .from(courseAllocations)
        .innerJoin(courses, eq(courseAllocations.courseId, courses.id))
        .where(inArray(courseAllocations.courseId, courseIds));

        lecturers.forEach(l => {
          contactIds.add(l.lecturerId);
          if (!courseContactMap.has(l.lecturerId)) courseContactMap.set(l.lecturerId, []);
          courseContactMap.get(l.lecturerId)!.push({ courseId: l.courseId, courseCode: l.code, courseTitle: l.title });
        });
      }
    } else if (userRole === 'Lecturer' || userRole === 'HOD' || userRole === 'Dean') {
      const allocated = await db.select({
        courseId: courses.id,
        code: courses.code,
        title: courses.title
      })
      .from(courseAllocations)
      .innerJoin(courses, eq(courseAllocations.courseId, courses.id))
      .where(eq(courseAllocations.lecturerId, userId));

      userCourses = allocated.map(a => ({ id: a.courseId, code: a.code, title: a.title }));

      const courseIds = userCourses.map(c => c.id);
      if (courseIds.length > 0) {
        const students = await db.select({
          studentId: studentCourses.studentId,
          courseId: courses.id,
          code: courses.code,
          title: courses.title
        })
        .from(studentCourses)
        .innerJoin(courses, eq(studentCourses.courseId, courses.id))
        .where(inArray(studentCourses.courseId, courseIds));

        students.forEach(s => {
          contactIds.add(s.studentId);
          if (!courseContactMap.has(s.studentId)) courseContactMap.set(s.studentId, []);
          courseContactMap.get(s.studentId)!.push({ courseId: s.courseId, courseCode: s.code, courseTitle: s.title });
        });
      }
    }

    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      role: users.role,
      department: users.department,
      profilePicture: users.profilePicture
    })
    .from(users)
    .where(ne(users.id, userId));

    const contacts = allUsers.map(u => ({
      ...u,
      isDirectCourseContact: contactIds.has(u.id),
      courses: courseContactMap.get(u.id) || []
    }));

    res.json({
      myCourses: userCourses,
      contacts,
      onlineUserIds: Array.from(userSockets.keys())
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch course contacts' });
  }
});
// --- End Messages API ---

  
// --- Transcript API ---
app.get("/api/transcripts", requireAuth, async (req, res) => {
  try {
    const { transcriptRequests } = await import('./src/db/schema');
    
    
    const userId = (req as any).user.id;
    
    const requests = await db.select()
      .from(transcriptRequests)
      .where(eq(transcriptRequests.studentId, userId))
      .orderBy(desc(transcriptRequests.requestDate));
      
    res.json(requests);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch transcript requests' });
  }
});

app.post("/api/transcripts", requireAuth, async (req, res) => {
  try {
    const { transcriptRequests } = await import('./src/db/schema');
    
    const userId = (req as any).user.id;
    
    const [newRequest] = await db.insert(transcriptRequests).values({
      ...req.body,
      studentId: userId
    }).returning();
    
    res.json(newRequest);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create transcript request' });
  }
});
// --- End Transcript API ---

  
// --- Portfolio API ---
app.get("/api/portfolio", requireAuth, async (req, res) => {
  try {
    const { portfolios, portfolioProjects, portfolioExperiences, portfolioCertificates } = await import('./src/db/schema');
    
    
    const userId = (req as any).user.id;
    
    // Get or create portfolio
    let [portfolio] = await db.select().from(portfolios).where(eq(portfolios.userId, userId));
    
    if (!portfolio) {
      [portfolio] = await db.insert(portfolios).values({ userId }).returning();
    }
    
    const projects = await db.select().from(portfolioProjects).where(eq(portfolioProjects.portfolioId, portfolio.id));
    const experiences = await db.select().from(portfolioExperiences).where(eq(portfolioExperiences.portfolioId, portfolio.id));
    const certificates = await db.select().from(portfolioCertificates).where(eq(portfolioCertificates.portfolioId, portfolio.id));
    
    res.json({
      ...portfolio,
      projects,
      experiences,
      certificates
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

app.put("/api/portfolio", requireAuth, async (req, res) => {
  try {
    const { portfolios } = await import('./src/db/schema');
    
    
    const userId = (req as any).user.id;
    
    const { bio, skills, githubUrl, linkedinUrl, websiteUrl, isPublic } = req.body;
    
    const [updated] = await db.update(portfolios)
      .set({ bio, skills, githubUrl, linkedinUrl, websiteUrl, isPublic })
      .where(eq(portfolios.userId, userId))
      .returning();
      
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update portfolio' });
  }
});

// Projects
app.post("/api/portfolio/projects", requireAuth, async (req, res) => {
  try {
    const { portfolios, portfolioProjects } = await import('./src/db/schema');
    
    
    const userId = (req as any).user.id;
    
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.userId, userId));
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });
    
    const [project] = await db.insert(portfolioProjects).values({
      ...req.body,
      portfolioId: portfolio.id
    }).returning();
    
    res.json(project);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.delete("/api/portfolio/projects/:id", requireAuth, async (req, res) => {
  try {
    const { portfolioProjects } = await import('./src/db/schema');
    
    
    
    await db.delete(portfolioProjects).where(eq(portfolioProjects.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Experiences
app.post("/api/portfolio/experiences", requireAuth, async (req, res) => {
  try {
    const { portfolios, portfolioExperiences } = await import('./src/db/schema');
    
    
    const userId = (req as any).user.id;
    
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.userId, userId));
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });
    
    const [experience] = await db.insert(portfolioExperiences).values({
      ...req.body,
      portfolioId: portfolio.id
    }).returning();
    
    res.json(experience);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create experience' });
  }
});

app.delete("/api/portfolio/experiences/:id", requireAuth, async (req, res) => {
  try {
    const { portfolioExperiences } = await import('./src/db/schema');
    
    
    
    await db.delete(portfolioExperiences).where(eq(portfolioExperiences.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

// Certificates
app.post("/api/portfolio/certificates", requireAuth, async (req, res) => {
  try {
    const { portfolios, portfolioCertificates } = await import('./src/db/schema');
    
    
    const userId = (req as any).user.id;
    
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.userId, userId));
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });
    
    const [certificate] = await db.insert(portfolioCertificates).values({
      ...req.body,
      portfolioId: portfolio.id
    }).returning();
    
    res.json(certificate);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

app.delete("/api/portfolio/certificates/:id", requireAuth, async (req, res) => {
  try {
    const { portfolioCertificates } = await import('./src/db/schema');
    
    
    
    await db.delete(portfolioCertificates).where(eq(portfolioCertificates.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

// Public Portfolio View
app.get("/api/portfolio/public/:username", async (req, res) => {
  try {
    const { users, portfolios, portfolioProjects, portfolioExperiences, portfolioCertificates } = await import('./src/db/schema');
    
    
    
    const [user] = await db.select().from(users).where(eq(users.username, req.params.username));
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.userId, user.id));
    if (!portfolio || !portfolio.isPublic) return res.status(404).json({ error: 'Portfolio not found or private' });
    
    const projects = await db.select().from(portfolioProjects).where(eq(portfolioProjects.portfolioId, portfolio.id));
    const experiences = await db.select().from(portfolioExperiences).where(eq(portfolioExperiences.portfolioId, portfolio.id));
    const certificates = await db.select().from(portfolioCertificates).where(eq(portfolioCertificates.portfolioId, portfolio.id));
    
    res.json({
      user: { name: user.name, username: user.username, profilePicture: user.profilePicture, role: user.role },
      portfolio: {
        ...portfolio,
        projects,
        experiences,
        certificates
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch public portfolio' });
  }
});
// --- End Portfolio API ---

  

  // Laboratory Endpoints
  app.get("/api/lab/equipments", requireAuth, async (req, res) => {
    try {
      
      const { labEquipments, users } = await import('./src/db/schema');
      

      const equipments = await db.select({
        id: labEquipments.id,
        name: labEquipments.name,
        description: labEquipments.description,
        category: labEquipments.category,
        quantity: labEquipments.quantity,
        minThreshold: labEquipments.minThreshold,
        status: labEquipments.status,
        lastUpdated: labEquipments.lastUpdated,
        updatedBy: labEquipments.updatedBy,
        updaterName: users.name
      }).from(labEquipments)
      .leftJoin(users, eq(labEquipments.updatedBy, users.id))
      .orderBy(desc(labEquipments.lastUpdated));
      
      res.json(equipments);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to fetch lab equipments" });
    }
  });

  app.get("/api/lab/logs", requireAuth, async (req, res) => {
    try {
      const { equipmentId } = req.query;
      
      const { labEquipmentLogs, users, labEquipments } = await import('./src/db/schema');
      
      
      let query = db.select({
        id: labEquipmentLogs.id,
        equipmentId: labEquipmentLogs.equipmentId,
        equipmentName: labEquipments.name,
        userId: labEquipmentLogs.userId,
        userName: users.name,
        userRole: users.role,
        action: labEquipmentLogs.action,
        quantityChanged: labEquipmentLogs.quantityChanged,
        notes: labEquipmentLogs.notes,
        timestamp: labEquipmentLogs.timestamp,
      }).from(labEquipmentLogs)
      .leftJoin(users, eq(labEquipmentLogs.userId, users.id))
      .leftJoin(labEquipments, eq(labEquipmentLogs.equipmentId, labEquipments.id));
      
      if (equipmentId) {
        query = query.where(eq(labEquipmentLogs.equipmentId, parseInt(equipmentId as string))) as any;
      }
      
      const logs = await query.orderBy(desc(labEquipmentLogs.timestamp));
      res.json(logs);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to fetch lab logs" });
    }
  });



  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages format" });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const systemInstruction = `You are the official University AI Assistant. Your role is to help students, applicants, and visitors with questions regarding university policies, admission requirements, deadlines, campus facilities, and general academic information.
      Be polite, concise, and helpful. Use markdown for formatting lists or highlighting important information. If you don't know specific details, advise the user to contact the admissions office or relevant department directly.`;

      // Convert messages for gemini (ignoring the system one we pass separately)
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedMessages,
        config: {
          systemInstruction: systemInstruction
        }
      });
      
      res.json({ reply: response.text });
    } catch (e: any) {
      console.error("Chat API error:", e);
      res.status(500).json({ error: e.message || "Failed to process chat request" });
    }
  });

  app.post("/api/lab/analyze-inventory", requireAuth, async (req, res) => {
    try {
      const userReq = req as any;
      if (userReq.user.role !== 'Administrator' && userReq.user.role !== 'Laboratory') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      
      const { labEquipments } = await import('./src/db/schema');
      const equipments = await db.select().from(labEquipments);
      
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const prompt = `Analyze this lab equipment inventory and provide short, actionable insights. Format your response with clear headings or bullet points. Highlight items that are low in stock (below their min threshold). Keep it concise and professional.
      
Inventory data:
${JSON.stringify(equipments, null, 2)}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      
      res.json({ analysis: response.text });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to analyze inventory" });
    }
  });

  app.post("/api/lab/equipments/bulk", requireAuth, async (req, res) => {
    try {
      const userReq = req as any;
      if (userReq.user.role !== 'Administrator' && userReq.user.role !== 'Laboratory') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      
      const { labEquipments, labEquipmentLogs } = await import('./src/db/schema');
      
      const { items } = req.body;
      
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Invalid data format. Expected an array of items." });
      }

      let addedCount = 0;
      let updatedCount = 0;

      for (const item of items) {
        if (!item.name || !item.category) continue; // Skip invalid rows
        
        const qty = parseInt(item.quantity) || 0;
        const minThresh = parseInt(item.minThreshold) || parseInt(item['Low Stock Alert Threshold']) || 5;
        const status = item.status || 'Operational';
        
        // Try to match by name
        const existing = await db.select().from(labEquipments).where(eq(labEquipments.name, item.name)).limit(1);
        
        if (existing.length > 0) {
          // Update
          await db.update(labEquipments).set({
            description: item.description || existing[0].description,
            category: item.category || existing[0].category,
            quantity: qty,
            minThreshold: minThresh,
            status: status,
            updatedBy: userReq.user.id,
            lastUpdated: new Date()
          }).where(eq(labEquipments.id, existing[0].id));
          
          await db.insert(labEquipmentLogs).values({
            equipmentId: existing[0].id,
            userId: userReq.user.id,
            action: 'Bulk Update',
            quantityChanged: qty - existing[0].quantity,
            notes: 'Updated via bulk import'
          });
          updatedCount++;
        } else {
          // Insert
          const newItem = await db.insert(labEquipments).values({
            name: item.name,
            description: item.description || '',
            category: item.category,
            quantity: qty,
            minThreshold: minThresh,
            status: status,
            updatedBy: userReq.user.id
          }).returning();
          
          await db.insert(labEquipmentLogs).values({
            equipmentId: newItem[0].id,
            userId: userReq.user.id,
            action: 'Added',
            quantityChanged: qty,
            notes: 'Added via bulk import'
          });
          addedCount++;
        }
      }
      
      res.json({ success: true, added: addedCount, updated: updatedCount });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to process bulk import" });
    }
  });

  app.post("/api/lab/equipments", requireAuth, async (req, res) => {
    try {
      const userReq = req as any;
      if (userReq.user.role !== 'Administrator' && userReq.user.role !== 'Laboratory') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      
      const { labEquipments, labEquipmentLogs } = await import('./src/db/schema');
      const { name, description, category, quantity, minThreshold, status } = req.body;

      const newItem = await db.insert(labEquipments).values({
        name,
        description,
        category,
        quantity: parseInt(quantity),
        minThreshold: parseInt(minThreshold || 5),
        status,
        updatedBy: userReq.user.id
      }).returning();
      
      await db.insert(labEquipmentLogs).values({
        equipmentId: newItem[0].id,
        userId: userReq.user.id,
        action: 'Added',
        quantityChanged: parseInt(quantity),
        notes: 'Initial registration'
      });
      
      res.json(newItem[0]);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to create lab equipment" });
    }
  });

  app.put("/api/lab/equipments/:id", requireAuth, async (req, res) => {
    try {
      const userReq = req as any;
      if (userReq.user.role !== 'Administrator' && userReq.user.role !== 'Laboratory') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      
      const { labEquipments, labEquipmentLogs } = await import('./src/db/schema');
      
      const { name, description, category, quantity, minThreshold, status, action, notes } = req.body;
      
      const currentItem = await db.select().from(labEquipments).where(eq(labEquipments.id, parseInt(id)));
      if (currentItem.length === 0) return res.status(404).json({ error: "Equipment not found" });

      const newQty = parseInt(quantity);
      const newThreshold = parseInt(minThreshold || currentItem[0].minThreshold);

      const updatedItem = await db.update(labEquipments).set({
        name,
        description,
        category,
        quantity: newQty,
        minThreshold: newThreshold,
        status,
        updatedBy: userReq.user.id,
        lastUpdated: new Date()
      }).where(eq(labEquipments.id, parseInt(id))).returning();
      
      const qtyDiff = newQty - currentItem[0].quantity;
      let logAction = action || 'Updated';
      
      // Email Notification Simulation
      if (newQty < newThreshold && currentItem[0].quantity >= currentItem[0].minThreshold) {
        console.log(`[EMAIL NOTIFICATION] Alert: ${name} stock (${newQty}) has fallen below the threshold (${newThreshold}). Notifying lab staff...`);
      }
      
      await db.insert(labEquipmentLogs).values({
        equipmentId: updatedItem[0].id,
        userId: userReq.user.id,
        action: logAction,
        quantityChanged: qtyDiff,
        notes: notes || `Status: ${status}`
      });
      
      res.json(updatedItem[0]);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to update lab equipment" });
    }
  });

  app.delete("/api/lab/equipments/:id", requireAuth, async (req, res) => {
    try {
      const userReq = req as any;
      if (userReq.user.role !== 'Administrator' && userReq.user.role !== 'Laboratory') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      
      const { labEquipments, labEquipmentLogs } = await import('./src/db/schema');
      
      
      await db.insert(labEquipmentLogs).values({
        equipmentId: parseInt(id),
        userId: userReq.user.id,
        action: 'Deleted',
        quantityChanged: 0,
        notes: 'Equipment removed from inventory'
      }).catch(e => console.error("Could not log deletion", e));

      await db.delete(labEquipments).where(eq(labEquipments.id, parseInt(id)));
      
      res.json({ success: true });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to delete lab equipment" });
    }
  });



  // --- News and Events ---
  app.get("/api/news-events", requireAuth, async (req, res) => {
    try {
      const { universityNews, academicCalendarEvents } = await import('./src/db/schema');
      
      const { desc, asc, gte } = await import('drizzle-orm');

      // Fetch news
      const news = await db.select().from(universityNews)
        .orderBy(desc(universityNews.createdAt));

      // Fetch upcoming events
      const events = await db.select().from(academicCalendarEvents)
        .orderBy(asc(academicCalendarEvents.startDate));

      res.json({ news, events });
    } catch (error) {
      console.error('Error fetching news and events:', error);
      res.status(500).json({ error: 'Failed to fetch news and events' });
    }
  });

  // ASSIGNMENTS ROUTES

  // Get assignments for a course (student or lecturer)
  app.get("/api/courses/:courseId/assignments", requireAuth, async (req, res) => {
    try {
      
      const courseId = parseInt(req.params.courseId);
      const courseAssignments = await db.select().from(schema.assignments).where(eq(schema.assignments.courseId, courseId));
      res.json(courseAssignments);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  // Create an assignment (lecturer)
  app.post("/api/courses/:courseId/assignments", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const { title, description, dueDate, totalMarks } = req.body;
      const [newAssignment] = await db.insert(schema.assignments).values({
        courseId,
        lecturerId: (req as any).user.id,
        title,
        description,
        dueDate: new Date(dueDate),
        totalMarks: parseInt(totalMarks),
      }).returning();
      res.status(201).json(newAssignment);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to create assignment" });
    }
  });

  // Submit an assignment (student)
  app.post("/api/assignments/:assignmentId/submit", requireAuth, requireRole(['Student']), async (req, res) => {
    try {
      const assignmentId = parseInt(req.params.assignmentId);
      const { fileUrl, fileName } = req.body;
      const [submission] = await db.insert(schema.assignmentSubmissions).values({
        assignmentId,
        studentId: (req as any).user.id,
        fileUrl,
        fileName,
        status: 'submitted'
      }).returning();
      res.status(201).json(submission);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to submit assignment" });
    }
  });

  // Get submissions for an assignment (lecturer)
  app.get("/api/assignments/:assignmentId/submissions", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      
      const assignmentId = parseInt(req.params.assignmentId);
      
      const submissions = await db.select({
        submission: schema.assignmentSubmissions,
        student: {
          id: schema.users.id,
          name: schema.users.name,
          username: schema.users.username,
        }
      })
      .from(schema.assignmentSubmissions)
      .innerJoin(schema.users, eq(schema.assignmentSubmissions.studentId, schema.users.id))
      .where(eq(schema.assignmentSubmissions.assignmentId, assignmentId));
      
      res.json(submissions.map(s => ({ ...s.submission, student: s.student })));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  // Grade a submission (lecturer)
  app.post("/api/submissions/:submissionId/grade", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      
      const submissionId = parseInt(req.params.submissionId);
      const { marksAwarded, feedback } = req.body;
      const [updated] = await db.update(schema.assignmentSubmissions)
        .set({ marksAwarded: parseInt(marksAwarded), feedback, status: 'graded' })
        .where(eq(schema.assignmentSubmissions.id, submissionId))
        .returning();
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to grade submission" });
    }
  });
  
  // Get student's own submissions
  app.get("/api/student/submissions", requireAuth, requireRole(['Student']), async (req, res) => {
    try {
      const submissions = await db.select({
        submission: schema.assignmentSubmissions,
        assignment: schema.assignments
      })
      .from(schema.assignmentSubmissions)
      .innerJoin(schema.assignments, eq(schema.assignmentSubmissions.assignmentId, schema.assignments.id))
      .where(eq(schema.assignmentSubmissions.studentId, (req as any).user.id));
      
      res.json(submissions.map(s => ({ ...s.submission, assignment: s.assignment })));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch student submissions" });
    }
  });


  // ACADEMIC RESULT MODULE: LECTURER
  
  // Get course students for result entry
  app.get("/api/lecturer/courses/:courseId/students-results", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      
      

      
      const courseId = parseInt(req.params.courseId);
      
      const studentsInCourse = await db.select({
        studentId: schema.users.id,
        name: schema.users.name,
        matricNo: schema.users.username,
        resultId: schema.results.id,
        caScore: schema.results.caScore,
        examScore: schema.results.examScore,
        score: schema.results.score,
        grade: schema.results.grade,
        status: schema.results.status,
      })
      .from(schema.studentCourses)
      .innerJoin(schema.users, eq(schema.studentCourses.studentId, schema.users.id))
      .leftJoin(schema.results, and(
        eq(schema.results.studentId, schema.users.id),
        eq(schema.results.courseId, courseId)
      ))
      .where(and(
        eq(schema.studentCourses.courseId, courseId),
        eq(schema.studentCourses.status, 'registered')
      ));

      res.json(studentsInCourse);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to load students" });
    }
  });


  
  app.get("/api/settings/academic_ca_rules", requireAuth, async (req, res) => {
    res.json({
      caMax: 30,
      examMax: 70,
      components: [
        { id: '1', name: 'Assignment', maxScore: 10 },
        { id: '2', name: 'Test', maxScore: 10 },
        { id: '3', name: 'Quiz', maxScore: 10 }
      ]
    });
  });

  app.get("/api/grading-rules", requireAuth, async (req, res) => {
    try {
      
      

      const rules = await db.select().from(schema.gradingRules).orderBy(schema.gradingRules.minScore);
      res.json(rules);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to load grading rules" });
    }
  });

  // Save/Submit Course Results
  app.post("/api/lecturer/courses/:courseId/results", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      
      

      
      const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
      const courseId = parseInt(req.params.courseId);
      const { students, isSubmit } = req.body; // students array with { studentId, caScore, examScore }, isSubmit boolean
      
      // Get course credit units for QP calculation
      const [course] = await db.select().from(schema.courses).where(eq(schema.courses.id, courseId));
      if (!course) return res.status(404).json({ error: "Course not found" });

      const actorId = (req as any).user.id;
      const actorRole = (req as any).user.role;

      if (actorRole !== 'Administrator') {
          const [allocation] = await db.select()
              .from(schema.courseAllocations)
              .where(
                  and(
                      eq(schema.courseAllocations.courseId, courseId),
                      eq(schema.courseAllocations.lecturerId, actorId)
                  )
              );
          if (!allocation) {
              return res.status(403).json({ error: "Unauthorized: You are not assigned to this course." });
          }
      }

      const targetStatus = isSubmit ? 'submitted' : 'draft';

      let processedCount = 0;

      for (const student of students) {
        // Find existing result to check status
        const [existing] = await db.select().from(schema.results).where(and(
          eq(schema.results.studentId, student.studentId),
          eq(schema.results.courseId, courseId)
        ));

        // Skip if locked or approved
        if (existing && ['submitted', 'hod_approved', 'registrar_approved', 'published', 'locked'].includes(existing.status)) {
          continue;
        }

        const caScore = student.caScore === '' || student.caScore === null ? null : Number(student.caScore);
        const caBreakdown = student.caBreakdown || existing?.caBreakdown || null;
        const examScore = student.examScore === '' || student.examScore === null ? null : Number(student.examScore);
        
        const totalScore = ResultCalculationService.calculateTotalScore(caScore, examScore);
        const { grade, gradePoint, isPass } = await ResultCalculationService.calculateGradeFromDB(totalScore);
        const qualityPoint = ResultCalculationService.calculateQualityPoint(course.credits, gradePoint);

        const resultData = {
          studentId: student.studentId,
          courseId,
          academicSession: '2025/2026', // Ideally from active session setting
          semester: course.semester || '1st',
          caScore,
          caBreakdown,
          examScore,
          score: totalScore,
          grade,
          gradePoint,
          qualityPoint,
          status: targetStatus as any,
          
        };

        if (existing) {
          // Update
          await db.update(schema.results)
            .set(resultData)
            .where(eq(schema.results.id, existing.id));

          // Log Audit
          await db.insert(schema.resultAuditLogs).values({
            userId: actorId,
            role: (req as any).user.role,
            studentId: student.studentId,
            courseId,
            action: isSubmit ? 'Result Submitted' : 'Result Edited',
            oldCa: existing.caScore,
            newCa: caScore,
            oldExam: existing.examScore,
            newExam: examScore,
            oldGrade: existing.grade,
            newGrade: grade,
            ipAddress: req.ip || req.headers['x-forwarded-for']?.toString()
          });
        } else {
          // Insert
          await db.insert(schema.results).values(resultData);
          
          await db.insert(schema.resultAuditLogs).values({
            userId: actorId,
            role: (req as any).user.role,
            studentId: student.studentId,
            courseId,
            action: isSubmit ? 'Result Submitted' : 'Result Created',
            newCa: caScore,
            newExam: examScore,
            newGrade: grade,
            ipAddress: req.ip || req.headers['x-forwarded-for']?.toString()
          });
        }
        processedCount++;
      }

      res.json({ message: `Successfully ${isSubmit ? 'submitted' : 'saved'} ${processedCount} results.` });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to process results" });
    }
  });


  // ACADEMIC RESULT MODULE: HOD APPROVAL
  app.get("/api/hod/results/pending", requireAuth, requireRole(['HOD', 'Administrator']), async (req, res) => {
    try {
      
      

      
      
      let departmentCondition = undefined;
      const actorRole = (req as any).user.role;
      const actorDepartment = (req as any).user.department;
      
      if (actorRole !== 'Administrator' && actorDepartment) {
          const [dept] = await db.select().from(schema.departments).where(eq(schema.departments.name, actorDepartment));
          if (dept) {
              departmentCondition = eq(schema.courses.departmentId, dept.id);
          } else {
              // If HOD has a department string but it doesn't match any department in DB, return empty
              return res.json([]);
          }
      }

      const pendingCourses = await db.select({
        courseId: schema.courses.id,
        courseCode: schema.courses.code,
        courseTitle: schema.courses.title,
        credits: schema.courses.credits,
        semester: schema.courses.semester,
        submittedCount: sql<number>`count(*)`.mapWith(Number),
      })
      .from(schema.results)
      .innerJoin(schema.courses, eq(schema.results.courseId, schema.courses.id))
      .where(
          and(
              eq(schema.results.status, 'submitted'),
              departmentCondition
          )
      )
      .groupBy(schema.courses.id, schema.courses.code, schema.courses.title, schema.courses.credits, schema.courses.semester);

      res.json(pendingCourses);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to load pending results" });
    }
  });

  app.get("/api/hod/results/course/:courseId", requireAuth, requireRole(['HOD', 'Administrator', 'Registrar']), async (req, res) => {
    try {
      
      

      
      const courseId = parseInt(req.params.courseId);
      const statusFilter = req.query.status as string; // 'submitted' or 'hod_approved'
        
      const actorRole = (req as any).user.role;
      const actorDepartment = (req as any).user.department;

      if (actorRole === 'HOD') {
          const [course] = await db.select({ departmentName: schema.departments.name })
              .from(schema.courses)
              .leftJoin(schema.departments, eq(schema.courses.departmentId, schema.departments.id))
              .where(eq(schema.courses.id, courseId));
              
          if (!course || course.departmentName !== actorDepartment) {
              return res.status(403).json({ error: "Unauthorized: Course not in your department." });
          }
      }

      const results = await db.select({
        resultId: schema.results.id,
        studentId: schema.users.id,
        matricNo: schema.users.username,
        name: schema.users.name,
        caScore: schema.results.caScore,
        examScore: schema.results.examScore,
        score: schema.results.score,
        grade: schema.results.grade,
        status: schema.results.status,
      })
      .from(schema.results)
      .innerJoin(schema.users, eq(schema.results.studentId, schema.users.id))
      .where(and(
        eq(schema.results.courseId, courseId),
        statusFilter ? eq(schema.results.status, statusFilter as any) : undefined
      ));

      res.json(results);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to load course results" });
    }
  });

  app.post("/api/hod/results/approve", requireAuth, requireRole(['HOD', 'Administrator']), async (req, res) => {
    try {
      
      

      
      const { resultIds, action, reason } = req.body; // action: 'approve' or 'return'
      const actorId = (req as any).user.id;
      const actorRole = (req as any).user.role;
      const actorDepartment = (req as any).user.department;

      // HOD Authorization Check
      if (actorRole !== 'Administrator') {
          // Check if all results belong to the HOD's department
          const resultsToCheck = await db.select({
              courseDepartmentId: schema.courses.departmentId,
              departmentName: schema.departments.name
          }).from(schema.results)
          .innerJoin(schema.courses, eq(schema.results.courseId, schema.courses.id))
          .leftJoin(schema.departments, eq(schema.courses.departmentId, schema.departments.id))
          .where(inArray(schema.results.id, resultIds));

          for (const resultRow of resultsToCheck) {
              if (resultRow.departmentName !== actorDepartment) {
                  return res.status(403).json({ error: "Unauthorized: You can only review results for your department." });
              }
          }
      }

      const newStatus = action === 'approve' ? 'hod_approved' : 'returned';
      const logAction = action === 'approve' ? 'Result Approved by HOD' : 'Result Returned by HOD';

      await db.update(schema.results)
        .set({ status: newStatus as any, returnReason: reason, approvedByHodId: actorId })
        .where(inArray(schema.results.id, resultIds));

      // Audit logs
      const affectedResults = await db.select({
        id: schema.results.id,
        studentId: schema.results.studentId,
        courseId: schema.results.courseId
      }).from(schema.results).where(inArray(schema.results.id, resultIds));

      const logs = affectedResults.map((r: any) => ({
        userId: actorId,
        role: (req as any).user.role,
        studentId: r.studentId,
        courseId: r.courseId,
        action: logAction,
        reason: reason,
        ipAddress: req.ip || req.headers['x-forwarded-for']?.toString()
      }));
      if (logs.length > 0) await db.insert(schema.resultAuditLogs).values(logs);

      res.json({ message: `Results successfully ${newStatus}` });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to process results" });
    }
  });

  // ACADEMIC RESULT MODULE: REGISTRAR PUBLICATION
  app.get("/api/registrar/results/pending", requireAuth, requireRole(['Registrar', 'Administrator']), async (req, res) => {
    try {
      
      

      const { eq, sql, inArray } = await import('drizzle-orm');
      const pendingCourses = await db.select({
        courseId: schema.courses.id,
        courseCode: schema.courses.code,
        courseTitle: schema.courses.title,
        credits: schema.courses.credits,
        semester: schema.courses.semester,
        status: schema.results.status,
        approvedCount: sql<number>`count(*)`.mapWith(Number),
      })
      .from(schema.results)
      .innerJoin(schema.courses, eq(schema.results.courseId, schema.courses.id))
      .where(inArray(schema.results.status, ['hod_approved', 'registrar_approved', 'published']))
      .groupBy(schema.courses.id, schema.courses.code, schema.courses.title, schema.courses.credits, schema.courses.semester, schema.results.status);

      res.json(pendingCourses);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to load pending publications" });
    }
  });

  app.post("/api/registrar/results/publish", requireAuth, requireRole(['Registrar', 'Administrator']), async (req, res) => {
    try {
      
      

      
      const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
      const { resultIds, courseId, action, reason } = req.body;
      const actorId = (req as any).user.id;

      const affectedResults = await db.select({
        id: schema.results.id,
        studentId: schema.results.studentId,
        courseId: schema.results.courseId
      }).from(schema.results).where(inArray(schema.results.id, resultIds));

      const logAction = async (actionText: string) => {
        const logs = affectedResults.map((r: any) => ({
          userId: actorId,
          role: (req as any).user.role,
          studentId: r.studentId,
          courseId: r.courseId,
          action: actionText,
          reason: reason,
          ipAddress: req.ip || req.headers['x-forwarded-for']?.toString()
        }));
        if (logs.length > 0) await db.insert(schema.resultAuditLogs).values(logs);
      };

      if (action === 'return') {
        await db.update(schema.results)
          .set({ status: 'returned' as any, returnReason: reason })
          .where(inArray(schema.results.id, resultIds));
        await logAction('Result Returned');
        return res.json({ message: 'Results returned to Lecturer' });
      }
      
      if (action === 'approve') {
        await db.update(schema.results)
          .set({ status: 'registrar_approved' as any, approvedByRegistrarId: actorId })
          .where(inArray(schema.results.id, resultIds));
        await logAction('Result Approved');
        return res.json({ message: 'Results approved successfully.' });
      }

      if (action === 'lock') {
        await db.update(schema.results)
          .set({ status: 'locked' as any })
          .where(inArray(schema.results.id, resultIds));
        await logAction('Result Locked');
        return res.json({ message: 'Results locked successfully.' });
      }

      if (action === 'revoke') {
        await db.update(schema.results)
          .set({ status: 'registrar_approved' as any }) // Revert to approved, unpublished state
          .where(inArray(schema.results.id, resultIds));
        await logAction('Result Revoked');
        
        const publishedResults = await db.select({
            studentId: schema.results.studentId,
        }).from(schema.results).where(inArray(schema.results.id, resultIds));
        const uniqueStudents = Array.from(new Set(publishedResults.map(r => r.studentId)));
        for (const studentId of uniqueStudents) {
            await ResultCalculationService.updateStudentGPAAndCGPA(studentId);
        }
        
        return res.json({ message: 'Results revoked successfully' });
      }

      if (action !== 'publish') {
        return res.status(400).json({ error: "Invalid action" });
      }

      // Publish
      await db.update(schema.results)
        .set({ status: 'published' as any, approvedByRegistrarId: actorId })
        .where(inArray(schema.results.id, resultIds));
      await logAction('Result Published');

      // Get affected students to update their GPA/CGPA and notify them
      const publishedResults = await db.select({
        studentId: schema.results.studentId,
        courseCode: schema.courses.code,
        courseTitle: schema.courses.title,
        academicSession: schema.results.academicSession,
        semester: schema.results.semester
      }).from(schema.results)
        .innerJoin(schema.courses, eq(schema.results.courseId, schema.courses.id))
        .where(inArray(schema.results.id, resultIds));

      const uniqueStudents = Array.from(new Set(publishedResults.map(r => r.studentId)));

      for (const studentId of uniqueStudents) {
        await ResultCalculationService.updateStudentGPAAndCGPA(studentId);
        
        // Notify student for each published result
        const studentResults = publishedResults.filter(r => r.studentId === studentId);
        for (const result of studentResults) {
          const semesterName = result.semester === '1st' || result.semester === '1' ? 'First Semester' : 
                               result.semester === '2nd' || result.semester === '2' ? 'Second Semester' : 
                               result.semester;
                               
          await db.insert(schema.notifications).values({
            userId: studentId,
            title: "Result Published",
            message: `Your result for ${result.courseCode} - ${result.courseTitle}\nfor ${result.academicSession} ${semesterName} has been published.\n\nLogin to your student portal to view your result.`,
            type: "academic",
          });
        }
      }

      res.json({ message: `Successfully published ${resultIds.length} results. GPA and CGPA updated automatically.` });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to publish results" });
    }
  });


  // ACADEMIC RESULT MODULE: STUDENT PORTAL
  app.get("/api/student/academic-profile", requireAuth, requireRole(['Student']), async (req, res) => {
    try {
      
      const studentId = (req as any).user.id;
      
      const [cgpaRecord] = await db.select().from(schema.cgpaRecords).where(eq(schema.cgpaRecords.studentId, studentId));
      
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, studentId));

      const publishedResults = await db.select().from(schema.results).where(and(eq(schema.results.studentId, studentId), eq(schema.results.status, 'published')));
      
      const passedCourses = publishedResults.filter(r => r.grade !== 'F').length;
      const failedCourses = publishedResults.filter(r => r.grade === 'F').length;

      res.json({
        cgpa: cgpaRecord ? cgpaRecord.cgpa : 0,
        totalCreditUnits: cgpaRecord ? cgpaRecord.totalCreditUnits : 0,
        totalQualityPoints: cgpaRecord ? cgpaRecord.totalQualityPoints : 0,
        academicStanding: cgpaRecord ? cgpaRecord.academicStanding : 'No Standing Yet',
        degreeClassification: cgpaRecord ? (await import('./src/server/services/ResultCalculationService')).ResultCalculationService.calculateDegreeClassification(cgpaRecord.cgpa) : 'N/A',
        passedCourses,
        failedCourses,
        user: {
          name: user.name,
          matricNo: user.username,
          department: user.department || 'Computer Science',
          faculty: user.faculty || 'Science'
        }
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to load academic profile" });
    }
  });

  app.get("/api/student/transcript", requireAuth, requireRole(['Student', 'Registrar', 'Administrator']), async (req, res) => {
    try {
      
      const studentId = (req as any).user.role === 'Student' ? (req as any).user.id : parseInt(req.query.studentId as string);
      
      if (!studentId) return res.status(400).json({ error: "Student ID required" });

      const publishedResults = await db.select({
        id: schema.results.id,
        courseCode: schema.courses.code,
        courseTitle: schema.courses.title,
        credits: schema.courses.credits,
        caScore: schema.results.caScore,
        examScore: schema.results.examScore,
        score: schema.results.score,
        grade: schema.results.grade,
        gradePoint: schema.results.gradePoint,
        qualityPoint: schema.results.qualityPoint,
        academicSession: schema.results.academicSession,
        semester: schema.results.semester
      })
      .from(schema.results)
      .innerJoin(schema.courses, eq(schema.results.courseId, schema.courses.id))
      .where(and(
        eq(schema.results.studentId, studentId),
        eq(schema.results.status, 'published')
      ));

      const semesterRecords = await db.select().from(schema.semesterGpaRecords).where(eq(schema.semesterGpaRecords.studentId, studentId));
      const [cgpaRecord] = await db.select().from(schema.cgpaRecords).where(eq(schema.cgpaRecords.studentId, studentId));

      res.json({
        results: publishedResults,
        semesters: semesterRecords,
        cumulative: cgpaRecord
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to load transcript data" });
    }
  });

  
  
  app.get("/api/admin/academic-settings", requireAuth, requireRole(['Administrator', 'Registrar', 'Admin']), async (req, res) => {
    try {
        const gradingRulesData = await db.select().from(schema.gradingRules);
        const settings = await db.select().from(schema.systemSettings);
        
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        res.json({
            gradingRules: gradingRulesData,
            caMax: settingsMap['ca_max'] || '30',
            examMax: settingsMap['exam_max'] || '70',
            degreeClassification: settingsMap['degree_classification_rules'] ? JSON.parse(settingsMap['degree_classification_rules']) : [],
            academicStanding: settingsMap['academic_standing_rules'] ? JSON.parse(settingsMap['academic_standing_rules']) : [],
            repeatCoursePolicy: settingsMap['repeat_course_policy'] || 'Best Attempt Counts',
            gpaDecimalPlaces: settingsMap['gpa_decimal_places'] || '2',
            cgpaDecimalPlaces: settingsMap['cgpa_decimal_places'] || '2',
            resultApprovalWorkflow: settingsMap['result_approval_workflow'] || 'HOD -> Registrar',
            transcriptSettings: settingsMap['transcript_settings'] ? JSON.parse(settingsMap['transcript_settings']) : { registrarName: '', registrarSignature: '', customNotes: '' },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get academic settings' });
    }
  });

  app.put("/api/admin/academic-settings", requireAuth, requireRole(['Administrator', 'Registrar', 'Admin']), async (req, res) => {
    try {
        const { 
            gradingRules, caMax, examMax, degreeClassification, academicStanding, 
            repeatCoursePolicy, gpaDecimalPlaces, cgpaDecimalPlaces, 
            resultApprovalWorkflow, transcriptSettings 
        } = req.body;
        
        // 1. Update Grading Rules
        if (gradingRules && Array.isArray(gradingRules)) {
            await db.delete(schema.gradingRules);
            if (gradingRules.length > 0) {
                // Ensure no IDs are passed to insert
                const toInsert = gradingRules.map(r => ({
                    minScore: Number(r.minScore),
                    maxScore: Number(r.maxScore),
                    grade: String(r.grade),
                    gradePoint: Number(r.gradePoint),
                    description: String(r.description),
                    isPass: Boolean(r.isPass)
                }));
                await db.insert(schema.gradingRules).values(toInsert);
            }
        }
        
        // 2. Update System Settings
        const updateSetting = async (key: string, value: string) => {
            const [existing] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, key));
            if (existing) {
                await db.update(schema.systemSettings).set({ value }).where(eq(schema.systemSettings.key, key));
            } else {
                await db.insert(schema.systemSettings).values({ key, value });
            }
        };

        if (caMax !== undefined) await updateSetting('ca_max', caMax.toString());
        if (examMax !== undefined) await updateSetting('exam_max', examMax.toString());
        if (degreeClassification) await updateSetting('degree_classification_rules', JSON.stringify(degreeClassification));
        if (academicStanding) await updateSetting('academic_standing_rules', JSON.stringify(academicStanding));
        if (repeatCoursePolicy) await updateSetting('repeat_course_policy', repeatCoursePolicy);
        if (gpaDecimalPlaces !== undefined) await updateSetting('gpa_decimal_places', gpaDecimalPlaces.toString());
        if (cgpaDecimalPlaces !== undefined) await updateSetting('cgpa_decimal_places', cgpaDecimalPlaces.toString());
        if (resultApprovalWorkflow) await updateSetting('result_approval_workflow', resultApprovalWorkflow);
        if (transcriptSettings) await updateSetting('transcript_settings', JSON.stringify(transcriptSettings));

        // Let's trigger a background recalculation of CGPA if standing or policy changed
        if (academicStanding || repeatCoursePolicy) {
             const studentsWithResults = await db.select({ studentId: schema.results.studentId }).from(schema.results).where(eq(schema.results.status, 'published')).groupBy(schema.results.studentId);
             const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
             for (const record of studentsWithResults) {
                 await ResultCalculationService.updateStudentGPAAndCGPA(record.studentId);
             }
        }

        res.json({ message: 'Academic settings updated successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update academic settings' });
    }
  });


  app.get("/api/admin/settings/academic_standing", requireAuth, requireRole(['Administrator', 'Registrar', 'Admin']), async (req, res) => {
    try {
        const [setting] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'academic_standing_rules'));
        res.json({ rules: setting ? JSON.parse(setting.value) : [] });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get standing rules' });
    }
  });

  app.put("/api/admin/settings/academic_standing", requireAuth, requireRole(['Administrator', 'Registrar', 'Admin']), async (req, res) => {
    try {
        const { rules } = req.body; // rules should be an array of { minCgpa: number, status: string }
        const [existing] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'academic_standing_rules'));
        if (existing) {
            await db.update(schema.systemSettings).set({ value: JSON.stringify(rules) }).where(eq(schema.systemSettings.key, 'academic_standing_rules'));
        } else {
            await db.insert(schema.systemSettings).values({ key: 'academic_standing_rules', value: JSON.stringify(rules) });
        }
        
        // Recalculate CGPA for all students that have published results to reflect the new policy
        const studentsWithResults = await db.select({ studentId: schema.results.studentId }).from(schema.results).where(eq(schema.results.status, 'published')).groupBy(schema.results.studentId);
        const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
        for (const record of studentsWithResults) {
            await ResultCalculationService.updateStudentGPAAndCGPA(record.studentId);
        }

        res.json({ message: 'Rules updated' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update standing rules' });
    }
  });

  app.post("/api/admin/transcripts/generate", requireAuth, requireRole(['Administrator', 'Registrar', 'Admin']), async (req, res) => {
    try {
        const { matricNumber } = req.body;
        if (!matricNumber) {
            return res.status(400).json({ error: 'Matric number is required' });
        }

        const [student] = await db.select().from(schema.users).where(eq(schema.users.username, String(matricNumber)));
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        
        const verificationCode = crypto.randomBytes(16).toString('hex');
        
        const [transcriptRecord] = await db.insert(schema.transcripts).values({
            studentId: student.id,
            generatedById: (req as any).user.id,
            verificationCode: verificationCode,
            status: 'valid'
        }).returning();

        const transcriptNumber = `TR-${new Date().getFullYear()}-${String(transcriptRecord.id).padStart(5, '0')}`;

        const [institutionNameSettings] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'institution_name'));
        const [institutionLogoSettings] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'institution_logo'));

        // Fetch all results for the student
        const studentResults = await db.select({
            id: schema.results.id,
            academicSession: schema.results.academicSession,
            semester: schema.results.semester,
            caScore: schema.results.caScore,
            examScore: schema.results.examScore,
            score: schema.results.score,
            grade: schema.results.grade,
            gradePoint: schema.results.gradePoint,
            qualityPoint: schema.results.qualityPoint,
            courseCode: schema.courses.code,
            courseTitle: schema.courses.title,
            courseCredits: schema.courses.credits,
            courseType: schema.courses.type
        })
        .from(schema.results)
        .innerJoin(schema.courses, eq(schema.results.courseId, schema.courses.id))
        .where(
            and(
                eq(schema.results.studentId, student.id),
                eq(schema.results.status, 'published')
            )
        );

        // Fetch semester GPAs
        const semesterGpas = await db.select().from(schema.semesterGpaRecords).where(eq(schema.semesterGpaRecords.studentId, student.id));
        
        // Group results by session and semester
        const groupedResults = {};
        studentResults.forEach(result => {
            const key = `${result.academicSession} - ${result.semester}`;
            if (!groupedResults[key]) {
                const gpaRecord = semesterGpas.find(g => g.academicSession === result.academicSession && g.semester === result.semester);
                groupedResults[key] = {
                    session: result.academicSession,
                    semester: result.semester,
                    gpa: gpaRecord ? gpaRecord.gpa : 0,
                    totalCreditUnits: gpaRecord ? gpaRecord.totalCreditUnits : 0,
                    totalEarnedCredits: gpaRecord ? gpaRecord.totalEarnedCredits : 0,
                    courses: []
                };
            }
            groupedResults[key].courses.push({
                code: result.courseCode,
                title: result.courseTitle,
                credits: result.courseCredits,
                score: result.score,
                grade: result.grade,
                gradePoint: result.gradePoint,
                qualityPoint: result.qualityPoint,
                type: result.courseType
            });
        });

        const sessionsArray = Object.values(groupedResults).sort((a: any, b: any) => {
            if (a.session === b.session) return a.semester.localeCompare(b.semester);
            return a.session.localeCompare(b.session);
        });

        const [cgpaRecord] = await db.select().from(schema.cgpaRecords).where(eq(schema.cgpaRecords.studentId, student.id));

        const responsePayload = {
            metadata: {
                transcriptNumber,
                verificationCode,
                generatedAt: transcriptRecord.createdAt
            },
            institution: {
                name: institutionNameSettings?.value || '',
                logo: institutionLogoSettings?.value || ''
            },
            student: {
                name: student.name,
                matricNumber: student.username,
                programme: student.department || '',
                department: student.department || '',
                faculty: student.faculty || ''
            },
            sessions: sessionsArray,
            summary: {
                totalEarnedCredits: cgpaRecord ? cgpaRecord.totalEarnedCredits : 0,
                totalCreditUnits: cgpaRecord ? cgpaRecord.totalCreditUnits : 0,
                totalQualityPoints: cgpaRecord ? cgpaRecord.totalQualityPoints : 0,
                cgpa: cgpaRecord ? cgpaRecord.cgpa : 0,
                classification: ''
            }
        };
        
        if (cgpaRecord) {
            const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
            const settingsRows = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'degree_classification_rules'));
            let rules = [];
            if (settingsRows.length > 0) rules = JSON.parse(settingsRows[0].value);
            responsePayload.summary.classification = ResultCalculationService.calculateDegreeClassification(cgpaRecord.cgpa, rules);
        }
        
        res.json(responsePayload);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to generate transcript' });
    }
});


  app.post("/api/student/transcripts/generate", requireAuth, requireRole(['Student']), async (req, res) => {
    try {
        const studentId = (req as any).user.id;
        
        const verificationCode = crypto.randomBytes(16).toString('hex');
        
        const [transcriptRecord] = await db.insert(schema.transcripts).values({
            studentId: studentId,
            generatedById: studentId,
            verificationCode: verificationCode,
            status: 'valid'
        }).returning();

        res.json({ verificationCode });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to register transcript for verification' });
    }
  });

app.get("/api/public/verify-transcript/:code", async (req, res) => {
    try {
        const { code } = req.params;
        const [transcriptRecord] = await db.select().from(schema.transcripts).where(eq(schema.transcripts.verificationCode, code));
        
        if (!transcriptRecord) {
            return res.status(404).json({ error: 'Invalid or missing verification code' });
        }

        if (transcriptRecord.status !== 'valid') {
            return res.status(400).json({ error: 'This transcript has been revoked' });
        }

        const [student] = await db.select().from(schema.users).where(eq(schema.users.id, transcriptRecord.studentId));
        if (!student) {
            return res.status(404).json({ error: 'Student record not found' });
        }

        const transcriptNumber = `TR-${new Date(transcriptRecord.createdAt).getFullYear()}-${String(transcriptRecord.id).padStart(5, '0')}`;

        const [cgpaRecord] = await db.select().from(schema.cgpaRecords).where(eq(schema.cgpaRecords.studentId, student.id));
        let classification = '';
        if (cgpaRecord) {
            const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
            const settingsRows = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'degree_classification_rules'));
            let rules = [];
            if (settingsRows.length > 0) rules = JSON.parse(settingsRows[0].value);
            classification = ResultCalculationService.calculateDegreeClassification(cgpaRecord.cgpa, rules);
        }

        res.json({
            valid: true,
            transcriptNumber,
            generatedAt: transcriptRecord.createdAt,
            student: {
                name: student.name,
                matricNumber: student.username,
                programme: student.department || '',
            },
            summary: {
                cgpa: cgpaRecord ? cgpaRecord.cgpa : 0,
                classification: classification
            }
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Verification failed' });
    }
});

app.get("/api/admin/transcripts/student", requireAuth, requireRole(['Administrator', 'Registrar', 'Admin']), async (req, res) => {
    try {
        const { matricNumber } = req.query;
        if (!matricNumber) {
            return res.status(400).json({ error: 'Matric number is required' });
        }

        const [student] = await db.select().from(schema.users).where(eq(schema.users.username, String(matricNumber)));
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const [institutionNameSettings] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'institution_name'));
        const [institutionLogoSettings] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'institution_logo'));

        // Fetch all results for the student
        const studentResults = await db.select({
            id: schema.results.id,
            academicSession: schema.results.academicSession,
            semester: schema.results.semester,
            caScore: schema.results.caScore,
            examScore: schema.results.examScore,
            score: schema.results.score,
            grade: schema.results.grade,
            gradePoint: schema.results.gradePoint,
            qualityPoint: schema.results.qualityPoint,
            courseCode: schema.courses.code,
            courseTitle: schema.courses.title,
            courseCredits: schema.courses.credits,
            courseType: schema.courses.type
        })
        .from(schema.results)
        .innerJoin(schema.courses, eq(schema.results.courseId, schema.courses.id))
        .where(
            and(
                eq(schema.results.studentId, student.id),
                eq(schema.results.status, 'published')
            )
        );

        // Fetch semester GPAs
        const semesterGpas = await db.select().from(schema.semesterGpaRecords).where(eq(schema.semesterGpaRecords.studentId, student.id));
        
        // Group results by session and semester
        const groupedResults = {};
        studentResults.forEach(result => {
            const key = `${result.academicSession} - ${result.semester}`;
            if (!groupedResults[key]) {
                const gpaRecord = semesterGpas.find(g => g.academicSession === result.academicSession && g.semester === result.semester);
                groupedResults[key] = {
                    session: result.academicSession,
                    semester: result.semester,
                    gpa: gpaRecord ? gpaRecord.gpa : 0,
                    totalCreditUnits: gpaRecord ? gpaRecord.totalCreditUnits : 0,
                    totalEarnedCredits: gpaRecord ? gpaRecord.totalEarnedCredits : 0,
                    courses: []
                };
            }
            groupedResults[key].courses.push({
                code: result.courseCode,
                title: result.courseTitle,
                credits: result.courseCredits,
                score: result.score,
                grade: result.grade,
                gradePoint: result.gradePoint,
                qualityPoint: result.qualityPoint,
                type: result.courseType
            });
        });

        // Convert grouped object to array and sort chronologically (simple string sort might work for sessions like "2024/2025")
        const sessionsArray = Object.values(groupedResults).sort((a: any, b: any) => {
            if (a.session === b.session) return a.semester.localeCompare(b.semester);
            return a.session.localeCompare(b.session);
        });

        const [cgpaRecord] = await db.select().from(schema.cgpaRecords).where(eq(schema.cgpaRecords.studentId, student.id));

        const responsePayload = {
            institution: {
                name: institutionNameSettings?.value || '',
                logo: institutionLogoSettings?.value || ''
            },
            student: {
                name: student.name,
                matricNumber: student.username,
                programme: student.department || '', // Assuming programme is tied to department for now
                department: student.department || '',
                faculty: student.faculty || ''
            },
            sessions: sessionsArray,
            summary: {
                totalEarnedCredits: cgpaRecord ? cgpaRecord.totalEarnedCredits : 0,
                totalCreditUnits: cgpaRecord ? cgpaRecord.totalCreditUnits : 0,
                totalQualityPoints: cgpaRecord ? cgpaRecord.totalQualityPoints : 0,
                cgpa: cgpaRecord ? cgpaRecord.cgpa : 0,
                classification: ''
            }
        };
        
        if (cgpaRecord) {
            const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
            const settingsRows = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'degree_classification_rules'));
            let rules = [];
            if (settingsRows.length > 0) rules = JSON.parse(settingsRows[0].value);
            responsePayload.summary.classification = ResultCalculationService.calculateDegreeClassification(cgpaRecord.cgpa, rules);
        }
        
        res.json(responsePayload);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to generate transcript' });
    }
});

app.get("/api/admin/settings/degree_classification", requireAuth, requireRole(['Administrator', 'Registrar', 'Admin']), async (req, res) => {
    try {
        const [setting] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'degree_classification_rules'));
        res.json({ rules: setting ? JSON.parse(setting.value) : [] });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get classification rules' });
    }
  });

  app.put("/api/admin/settings/degree_classification", requireAuth, requireRole(['Administrator', 'Registrar', 'Admin']), async (req, res) => {
    try {
        const { rules } = req.body; // rules should be an array of { minCgpa: number, classification: string }
        const [existing] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'degree_classification_rules'));
        if (existing) {
            await db.update(schema.systemSettings).set({ value: JSON.stringify(rules) }).where(eq(schema.systemSettings.key, 'degree_classification_rules'));
        } else {
            await db.insert(schema.systemSettings).values({ key: 'degree_classification_rules', value: JSON.stringify(rules) });
        }
        
        // Wait, maybe we don't recalculate CGPA automatically here because it's heavy, or maybe we do.
        // Actually, CGPA records don't store classification, so we don't need to recalculate them.
        res.json({ message: 'Rules updated' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update classification rules' });
    }
  });

  app.get("/api/admin/settings/repeat_course_policy", requireAuth, requireRole(['Administrator', 'Registrar', 'Admin']), async (req, res) => {
    try {
        const [setting] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'repeat_course_policy'));
        res.json({ policy: setting ? setting.value : 'Best Attempt Counts' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get policy' });
    }
  });

  app.put("/api/admin/settings/repeat_course_policy", requireAuth, requireRole(['Administrator', 'Registrar', 'Admin']), async (req, res) => {
    try {
        const { policy } = req.body;
        const [existing] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'repeat_course_policy'));
        if (existing) {
            await db.update(schema.systemSettings).set({ value: policy }).where(eq(schema.systemSettings.key, 'repeat_course_policy'));
        } else {
            await db.insert(schema.systemSettings).values({ key: 'repeat_course_policy', value: policy });
        }
        
        // Recalculate CGPA for all students that have published results to reflect the new policy
        const studentsWithResults = await db.select({ studentId: schema.results.studentId }).from(schema.results).where(eq(schema.results.status, 'published')).groupBy(schema.results.studentId);
        const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
        for (const record of studentsWithResults) {
            await ResultCalculationService.updateStudentGPAAndCGPA(record.studentId);
        }

        res.json({ message: 'Policy updated' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update policy' });
    }
  });

  // Result Amendment Request (Lecturer/HOD)
  app.post("/api/results/:id/amend/request", requireAuth, requireRole(['Lecturer', 'HOD', 'Administrator']), async (req, res) => {
    try {
        const resultId = parseInt(req.params.id);
        const { newCa, newExam, reason } = req.body;
        
        const [existingResult] = await db.select().from(schema.results).where(eq(schema.results.id, resultId));
        if (!existingResult) return res.status(404).json({ error: "Result not found" });

        const actorRole = (req as any).user.role;
        const actorId = (req as any).user.id;
        const actorDepartment = (req as any).user.department;

        if (actorRole !== 'Administrator') {
            if (actorRole === 'Lecturer') {
                const [allocation] = await db.select().from(schema.courseAllocations).where(
                    and(eq(schema.courseAllocations.courseId, existingResult.courseId), eq(schema.courseAllocations.lecturerId, actorId))
                );
                if (!allocation) return res.status(403).json({ error: "Unauthorized: You are not assigned to this course." });
            } else if (actorRole === 'HOD') {
                const [course] = await db.select({ departmentName: schema.departments.name })
                    .from(schema.courses)
                    .leftJoin(schema.departments, eq(schema.courses.departmentId, schema.departments.id))
                    .where(eq(schema.courses.id, existingResult.courseId));
                if (!course || course.departmentName !== actorDepartment) {
                    return res.status(403).json({ error: "Unauthorized: Course not in your department." });
                }
            }
        }

        // Create amendment record
        await db.insert(schema.resultAmendments).values({
            resultId: resultId,
            requestedById: (req as any).user.id,
            oldCa: existingResult.caScore,
            newCa: newCa,
            oldExam: existingResult.examScore,
            newExam: newExam,
            reason: reason,
            status: 'pending'
        });

        res.json({ message: "Amendment request submitted" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to submit request" });
    }
  });

  // Result Amendment Approval (Registrar/Admin)
  
  app.get("/api/admin/amendments", requireAuth, requireRole(['Registrar', 'Administrator', 'HOD', 'Lecturer']), async (req, res) => {
    try {
        const { resultAmendments, results, courses, users } = await import('./src/db/schema');
        const { desc, eq } = await import('drizzle-orm');
        
        let query = db.select({
            id: resultAmendments.id,
            oldCa: resultAmendments.oldCa,
            newCa: resultAmendments.newCa,
            oldExam: resultAmendments.oldExam,
            newExam: resultAmendments.newExam,
            reason: resultAmendments.reason,
            status: resultAmendments.status,
            createdAt: resultAmendments.createdAt,
            requestedBy: {
                id: users.id,
                name: users.name,
                email: users.email
            },
            course: {
                code: courses.code,
                title: courses.title
            }
        }).from(resultAmendments)
        .leftJoin(results, eq(resultAmendments.resultId, results.id))
        .leftJoin(courses, eq(results.courseId, courses.id))
        .leftJoin(users, eq(resultAmendments.requestedById, users.id))
        .orderBy(desc(resultAmendments.createdAt));

        const data = await query;
        res.json(data);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch amendments" });
    }
  });

  app.post("/api/admin/amendments/:id/approve", requireAuth, requireRole(['Registrar', 'Administrator']), async (req, res) => {
    try {
        const amendmentId = parseInt(req.params.id);
        const { action } = req.body; // 'approve' or 'reject'
        
        const [amendment] = await db.select().from(schema.resultAmendments).where(eq(schema.resultAmendments.id, amendmentId));
        if (!amendment) return res.status(404).json({ error: "Amendment not found" });

        if (action === 'reject') {
            await db.update(schema.resultAmendments).set({ status: 'rejected', approvedById: (req as any).user.id }).where(eq(schema.resultAmendments.id, amendmentId));
            return res.json({ message: "Amendment rejected" });
        }

        if (action === 'approve') {
            const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
            
            // Get course
            const [result] = await db.select().from(schema.results).where(eq(schema.results.id, amendment.resultId));
            const [course] = await db.select().from(schema.courses).where(eq(schema.courses.id, result.courseId));
            
            const totalScore = ResultCalculationService.calculateTotalScore(amendment.newCa, amendment.newExam);
            const { grade, gradePoint, isPass } = await ResultCalculationService.calculateGradeFromDB(totalScore);
            const qualityPoint = ResultCalculationService.calculateQualityPoint(course.credits, gradePoint);

            // Update result
            await db.update(schema.results).set({
                caScore: amendment.newCa,
                examScore: amendment.newExam,
                score: totalScore,
                grade: grade,
                gradePoint: gradePoint,
                qualityPoint: qualityPoint
            }).where(eq(schema.results.id, amendment.resultId));

            // Mark amendment as approved
            await db.update(schema.resultAmendments).set({ status: 'approved', approvedById: (req as any).user.id }).where(eq(schema.resultAmendments.id, amendmentId));

            // Audit
            await db.insert(schema.resultAuditLogs).values({
                userId: (req as any).user.id,
                role: (req as any).user.role,
                studentId: result.studentId,
                courseId: result.courseId,
                action: 'Amendment Approved',
                reason: amendment.reason,
                oldCa: amendment.oldCa,
                newCa: amendment.newCa,
                oldExam: amendment.oldExam,
                newExam: amendment.newExam,
                oldGrade: result.grade,
                newGrade: grade,
                ipAddress: req.ip || req.headers['x-forwarded-for']?.toString()
            });

            // *CRITICAL STEP: RECALCULATE CGPA*
            if (result.status === 'published' || result.status === 'locked') {
                await ResultCalculationService.updateStudentGPAAndCGPA(result.studentId);
            }

            return res.json({ message: "Amendment approved and result updated" });
        }
        
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to process amendment" });
    }
  });

  app.use('/uploads', express.static(uploadDir));

  // EXAM SCHEDULES
  app.get("/api/exams", requireAuth, async (req, res) => {
    try {
      const { examSchedules, courses, users } = await import('./src/db/schema');
      
      
      
      const exams = await db.select({
        id: examSchedules.id,
        examDate: examSchedules.examDate,
        startTime: examSchedules.startTime,
        endTime: examSchedules.endTime,
        venue: examSchedules.venue,
        status: examSchedules.status,
        instructions: examSchedules.instructions,
        courseCode: courses.code,
        courseTitle: courses.title,
        invigilatorName: users.name,
      })
      .from(examSchedules)
      .innerJoin(courses, eq(examSchedules.courseId, courses.id))
      .leftJoin(users, eq(examSchedules.invigilatorId, users.id));
      
      res.json(exams);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch exams" });
    }
  });

  app.post("/api/lecturer/exams", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      const { examSchedules } = await import('./src/db/schema');
      
      const { courseId, examDate, startTime, endTime, venue, invigilatorId, instructions } = req.body;
      
      const newExam = await db.insert(examSchedules).values({
        courseId, examDate, startTime, endTime, venue, invigilatorId, instructions,
        createdAt: new Date()
      }).returning();
      
      res.json(newExam[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to schedule exam" });
    }
  });

  app.delete("/api/lecturer/exams/:id", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      const { examSchedules } = await import('./src/db/schema');
      
      
      await db.delete(examSchedules).where(eq(examSchedules.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to delete exam" });
    }
  });

  app.get("/api/student/exams", requireAuth, requireRole(['Student']), async (req, res) => {
    try {
      const studentId = (req as any).user.id;
      const { examSchedules, courses, studentCourses, users } = await import('./src/db/schema');
      
      
      
      const exams = await db.select({
        id: examSchedules.id,
        examDate: examSchedules.examDate,
        startTime: examSchedules.startTime,
        endTime: examSchedules.endTime,
        venue: examSchedules.venue,
        status: examSchedules.status,
        instructions: examSchedules.instructions,
        courseCode: courses.code,
        courseTitle: courses.title,
        invigilatorName: users.name,
      })
      .from(examSchedules)
      .innerJoin(courses, eq(examSchedules.courseId, courses.id))
      .innerJoin(studentCourses, eq(courses.id, studentCourses.courseId))
      .leftJoin(users, eq(examSchedules.invigilatorId, users.id))
      .where(and(eq(studentCourses.studentId, studentId), eq(studentCourses.status, 'registered')));
      
      res.json(exams);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch student exams" });
    }
  });

  

  // Catch-all for missing API routes to return JSON instead of HTML SPA fallback
  app.use("/api/*", (req, res) => {
    console.error(`[API 404] Missing endpoint: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: "API Endpoint not found" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'auth') {
          const userId = Number(parsed.userId);
          if (userId) {
            ws.userId = userId;
            if (!userSockets.has(userId)) {
              userSockets.set(userId, new Set());
            }
            userSockets.get(userId)!.add(ws);
            ws.send(JSON.stringify({
              type: 'authenticated',
              userId,
              onlineUserIds: Array.from(userSockets.keys())
            }));
            
            broadcastUserStatus(userId, true);
          }
        } else if (parsed.type === 'typing') {
          const receiverId = Number(parsed.receiverId);
          if (receiverId && ws.userId) {
            notifyUser(receiverId, {
              type: 'typing',
              senderId: ws.userId,
              courseId: parsed.courseId,
              isTyping: !!parsed.isTyping
            });
          }
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        const sockets = userSockets.get(ws.userId);
        if (sockets) {
          sockets.delete(ws);
          if (sockets.size === 0) {
            userSockets.delete(ws.userId);
            broadcastUserStatus(ws.userId, false);
          }
        }
      }
    });
  });

  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws: ExtendedWebSocket) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  httpServer.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
