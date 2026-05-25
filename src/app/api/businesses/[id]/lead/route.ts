import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const updated = await prisma.business.update({
      where: { id },
      data: {
        leadsCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true, leadsCount: updated.leadsCount });
  } catch (error) {
    console.error("Failed to log business lead:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
