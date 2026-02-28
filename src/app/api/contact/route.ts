import { NextRequest, NextResponse } from "next/server";
// import { Resend } from "resend"; // TODO: npm install resend

// ENVIRONMENT VARIABLES NEEDED:
// RESEND_API_KEY: Your Resend API key (get from https://resend.com/api-keys)
// ADMIN_EMAIL: Admin email address to receive contact form submissions (e.g., support@robi.ai)

// Initialize Resend client
// const resend = new Resend(process.env.RESEND_API_KEY); // TODO: Uncomment after npm install resend

// Type for email sending results
interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Send user confirmation email
 */
async function sendUserConfirmationEmail(
  userEmail: string,
  userName: string
): Promise<EmailResult> {
  try {
    // TODO: Uncomment after npm install resend
    // const result = await resend.emails.send({
    //   from: "noreply@robi.ai",
    //   to: userEmail,
    //   subject: "Thank You for Contacting Robi - We've Received Your Message",
    //   ...
    // });

    console.log(`[EMAIL] User confirmation would be sent to ${userEmail} for ${userName}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending user confirmation email:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send admin notification email with contact form details
 */
async function sendAdminNotificationEmail(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<EmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn("ADMIN_EMAIL environment variable not set. Admin notification not sent.");
    return { success: false, error: "ADMIN_EMAIL not configured" };
  }

  try {
    // TODO: Uncomment after npm install resend
    // const result = await resend.emails.send({
    //   from: "noreply@robi.ai",
    //   to: adminEmail,
    //   subject: `New Contact Form Submission: ${subject}`,
    //   ...
    // });

    console.log(`[EMAIL] Admin notification would be sent to ${adminEmail} from ${name} (${email})`);
    console.log(`[EMAIL] Subject: ${subject}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending admin notification email:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters long" },
        { status: 400 }
      );
    }

    // Log the submission
    console.log("Contact form submission received:", {
      name,
      email,
      subject,
      timestamp: new Date().toISOString(),
    });

    // Send confirmation email to user
    const userEmailResult = await sendUserConfirmationEmail(email, name);
    if (!userEmailResult.success) {
      console.error("User confirmation email failed:", userEmailResult.error);
      // Continue anyway - don't block response
    }

    // Send notification email to admin
    const adminEmailResult = await sendAdminNotificationEmail(
      name,
      email,
      subject,
      message
    );
    if (!adminEmailResult.success) {
      console.error("Admin notification email failed:", adminEmailResult.error);
      // Continue anyway - don't block response
    }

    // Always return success to user (emails may have failed but submission was received)
    return NextResponse.json(
      {
        success: true,
        message: "Thank you for contacting us. We will get back to you soon.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
