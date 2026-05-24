import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const localityId = searchParams.get("localityId");
    const category = searchParams.get("category");

    const where: { localityId?: string; category?: string } = {};

    if (localityId) {
      where.localityId = localityId;
    }

    if (category && category !== "all" && category !== "All") {
      where.category = category.toLowerCase();
    }

    const businesses = await prisma.business.findMany({
      where,
      orderBy: {
        rating: "desc",
      },
    });

    return NextResponse.json(businesses);
  } catch (error) {
    console.error("Failed to fetch businesses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
