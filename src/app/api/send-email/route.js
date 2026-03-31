import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email, orderId, total, items } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'Electric Shop <onboarding@resend.dev>', // Replace with your domain once verified
      to: [email],
      subject: `অর্ডার কনফার্মেশন: #${orderId}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #3b82f6;">Electric Shop</h1>
          <h2>ধন্যবাদ! আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।</h2>
          <p>আপনার অর্ডার আইডি: <strong>#${orderId}</strong></p>
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 10px;">
            <h3>অর্ডার চার্ট:</h3>
            ${items.map(item => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>${item.name} × ${item.quantity}</span>
                <span>৳${Math.round(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
            <hr style="border: 0; border-top: 1px solid #ddd;" />
            <div style="font-weight: bold; font-size: 1.2rem;">
              সর্বমোট: ৳${Math.round(total).toLocaleString()}
            </div>
          </div>
          <p style="margin-top: 20px;">
            আমরা দ্রুত আপনার পণ্যটি পাঠানোর জন্য কাজ করছি। আপনি আপনার প্রোফাইল থেকে অর্ডারের অবস্থা ট্র্যাক করতে পারবেন।
          </p>
          <p style="color: #666; font-size: 0.8rem;">
            যদি কোনো প্রশ্ন থাকে, আমাদের কাস্টমার সার্ভিসের সাথে যোগাযোগ করুন।
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ message: 'ইমেইল সফলভাবে পাঠানো হয়েছে', data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
