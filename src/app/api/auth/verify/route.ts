import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    if (otp !== "1234") {
      return NextResponse.json(
        { error: "Invalid OTP code. Use 1234." },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (user) {
      return NextResponse.json(
        { success: true, user },
        { status: 200 }
      );
    }

    // User does not exist, let's create a new one.
    // Query the first locality as the default locality
    const defaultLocality = await prisma.locality.findFirst();
    const localityId = defaultLocality ? defaultLocality.id : null;

    const suffix = phone.slice(-4);
    const name = `Resident_${suffix}`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`;
    const role = "member";

    const createdUser = await prisma.user.create({
      data: {
        phone,
        name,
        avatarUrl,
        role,
        localityId,
      },
    });

    return NextResponse.json(
      { success: true, user: createdUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
