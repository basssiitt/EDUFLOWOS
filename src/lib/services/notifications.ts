import { db } from '@/lib/db';
import { notifications, users, parentStudents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

type NotificationChannel = 'whatsapp' | 'sms' | 'email' | 'push';

interface SendNotificationParams {
  schoolId: string;
  userId?: string;
  channel: NotificationChannel;
  recipientAddress: string;
  subject?: string;
  body: string;
  templateKey?: string;
  metadata?: Record<string, any>;
}

export async function sendNotification(params: SendNotificationParams) {
  try {
    const [notification] = await db.insert(notifications).values({
      schoolId: params.schoolId,
      userId: params.userId,
      channel: params.channel,
      recipientAddress: params.recipientAddress,
      subject: params.subject,
      body: params.body,
      templateKey: params.templateKey,
      metadata: params.metadata || {},
      status: 'pending',
    }).returning();

    // Dispatch based on channel
    switch (params.channel) {
      case 'email':
        await sendEmailNotification(params);
        break;
      case 'whatsapp':
        await sendWhatsAppNotification(params);
        break;
      case 'sms':
        await sendSMSNotification(params);
        break;
      case 'push':
        await sendPushNotification(params);
        break;
    }

    // Update status to sent
    await db.update(notifications)
      .set({ status: 'sent', sentAt: new Date() })
      .where(eq(notifications.id, notification.id));

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}

async function sendEmailNotification(params: SendNotificationParams) {
  // Integration with email service (e.g., Resend, SendGrid)
  // For now, we'll just log it
  console.log(`[EMAIL] To: ${params.recipientAddress}, Subject: ${params.subject}`);
  
  // TODO: Implement actual email sending
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'EduFlow <notifications@eduflow.com>',
  //   to: params.recipientAddress,
  //   subject: params.subject || 'EduFlow Notification',
  //   html: params.body,
  // });
}

async function sendWhatsAppNotification(params: SendNotificationParams) {
  // Integration with WhatsApp Cloud API
  console.log(`[WHATSAPP] To: ${params.recipientAddress}, Body: ${params.body}`);
  
  // TODO: Implement WhatsApp Cloud API
  // const response = await fetch(
  //   `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       messaging_product: 'whatsapp',
  //       to: params.recipientAddress,
  //       type: 'text',
  //       text: { body: params.body },
  //     }),
  //   }
  // );
}

async function sendSMSNotification(params: SendNotificationParams) {
  // Integration with SMS gateway
  console.log(`[SMS] To: ${params.recipientAddress}, Body: ${params.body}`);
  
  // TODO: Implement SMS gateway integration
}

async function sendPushNotification(params: SendNotificationParams) {
  // Integration with push notification service
  console.log(`[PUSH] To: ${params.recipientAddress}, Body: ${params.body}`);
  
  // TODO: Implement push notifications
}

// ==================== NOTIFICATION TEMPLATES ====================

export async function sendAttendanceAlert(
  schoolId: string,
  parentId: string,
  studentName: string,
  date: string,
  status: 'absent' | 'late'
) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, parentId),
    columns: { phone: true, email: true },
  });

  if (!user) return;

  const message = status === 'absent'
    ? `Dear Parent, ${studentName} has been marked ABSENT on ${date}. Please contact the school if this is an error.`
    : `Dear Parent, ${studentName} arrived LATE on ${date}. Please ensure timely arrival.`;

  // Send via multiple channels
  const channels: NotificationChannel[] = ['push'];
  if (user.phone) channels.push('whatsapp');
  if (user.email) channels.push('email');

  for (const channel of channels) {
    await sendNotification({
      schoolId,
      userId: parentId,
      channel,
      recipientAddress: channel === 'email' ? user.email! : user.phone!,
      subject: `Attendance Alert - ${studentName}`,
      body: message,
      templateKey: 'attendance_alert',
      metadata: { studentName, date, status },
    });
  }
}

export async function sendDiaryNotification(
  schoolId: string,
  parentId: string,
  studentName: string,
  subjectName: string,
  title: string,
  entryDate: string
) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, parentId),
    columns: { phone: true, email: true },
  });

  if (!user) return;

  const message = `New homework/diary entry for ${studentName}:\n${subjectName}: ${title}\nDate: ${entryDate}`;

  await sendNotification({
    schoolId,
    userId: parentId,
    channel: 'push',
    recipientAddress: user.email || '',
    subject: `New Diary Entry - ${studentName}`,
    body: message,
    templateKey: 'diary_notification',
    metadata: { studentName, subjectName, title, entryDate },
  });
}

export async function sendInvoiceNotification(
  schoolId: string,
  parentId: string,
  studentName: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string
) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, parentId),
    columns: { phone: true, email: true },
  });

  if (!user) return;

  const message = `Fee voucher generated for ${studentName}.\nInvoice: ${invoiceNumber}\nAmount: PKR ${amount.toLocaleString()}\nDue Date: ${dueDate}\nPay online through the parent portal.`;

  const channels: NotificationChannel[] = ['push'];
  if (user.phone) channels.push('whatsapp');
  if (user.email) channels.push('email');

  for (const channel of channels) {
    await sendNotification({
      schoolId,
      userId: parentId,
      channel,
      recipientAddress: channel === 'email' ? user.email! : user.phone!,
      subject: `Fee Voucher - ${studentName}`,
      body: message,
      templateKey: 'invoice_notification',
      metadata: { studentName, invoiceNumber, amount, dueDate },
    });
  }
}

export async function sendPaymentConfirmation(
  schoolId: string,
  parentId: string,
  studentName: string,
  invoiceNumber: string,
  amount: number
) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, parentId),
    columns: { phone: true, email: true },
  });

  if (!user) return;

  const message = `Payment received!\nStudent: ${studentName}\nInvoice: ${invoiceNumber}\nAmount: PKR ${amount.toLocaleString()}\nThank you for your payment.`;

  await sendNotification({
    schoolId,
    userId: parentId,
    channel: 'email',
    recipientAddress: user.email!,
    subject: `Payment Confirmation - ${invoiceNumber}`,
    body: message,
    templateKey: 'payment_confirmation',
    metadata: { studentName, invoiceNumber, amount },
  });
}

export async function sendOverdueReminder(
  schoolId: string,
  parentId: string,
  studentName: string,
  invoiceNumber: string,
  amount: number,
  daysOverdue: number
) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, parentId),
    columns: { phone: true, email: true },
  });

  if (!user) return;

  const message = `OVERDUE REMINDER\nStudent: ${studentName}\nInvoice: ${invoiceNumber}\nAmount Due: PKR ${amount.toLocaleString()}\nDays Overdue: ${daysOverdue}\nPlease pay immediately to avoid additional late fees.`;

  const channels: NotificationChannel[] = ['push'];
  if (user.phone) channels.push('whatsapp');
  if (user.email) channels.push('email');

  for (const channel of channels) {
    await sendNotification({
      schoolId,
      userId: parentId,
      channel,
      recipientAddress: channel === 'email' ? user.email! : user.phone!,
      subject: `OVERDUE: Fee Payment - ${studentName}`,
      body: message,
      templateKey: 'overdue_reminder',
      metadata: { studentName, invoiceNumber, amount, daysOverdue },
    });
  }
}

export async function sendReportCardNotification(
  schoolId: string,
  parentId: string,
  studentName: string,
  term: string,
  percentage: number
) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, parentId),
    columns: { phone: true, email: true },
  });

  if (!user) return;

  const message = `Report Card Published!\nStudent: ${studentName}\nTerm: ${term}\nOverall: ${percentage}%\nView detailed results on the parent portal.`;

  await sendNotification({
    schoolId,
    userId: parentId,
    channel: 'email',
    recipientAddress: user.email!,
    subject: `Report Card - ${studentName} (${term})`,
    body: message,
    templateKey: 'report_card',
    metadata: { studentName, term, percentage },
  });
}

// Get notification history for a user
export async function getUserNotifications(userId: string, limit: number = 20) {
  return db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    limit,
  });
}

// Get notification stats for a school
export async function getNotificationStats(schoolId: string) {
  // This would be a more complex query in production
  // For now, return basic structure
  return {
    total: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    byChannel: {
      email: 0,
      whatsapp: 0,
      sms: 0,
      push: 0,
    },
  };
}
