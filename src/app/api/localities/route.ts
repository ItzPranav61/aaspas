import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const localities = await prisma.locality.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(localities);
  } catch (error) {
    console.error("Failed to fetch localities:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
