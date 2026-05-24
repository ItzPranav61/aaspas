import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const localityId = searchParams.get("localityId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: {
      localityId?: string;
      category?: string;
      OR?: Array<{ name: { contains: string } } | { description: { contains: string } }>;
    } = {};

    if (localityId) {
      where.localityId = localityId;
    }

    if (category && category !== "all" && category !== "All") {
      where.category = category.toLowerCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const groups = await prisma.group.findMany({
      where,
      include: {
        members: {
          select: {
            userId: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      category?: string;
      localityId?: string;
      createdBy?: string;
    };
    const { name, description, category, localityId, createdBy } = body;

    if (!name || !description || !category || !localityId || !createdBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newGroup = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const group = await tx.group.create({
        data: {
          name,
          description,
          category: category.toLowerCase(),
          localityId,
          createdBy,
        },
      });

      // Add creator as admin member
      await tx.groupMember.create({
        data: {
          groupId: group.id,
          userId: createdBy,
          role: "admin",
        },
      });

      return group;
    });

    // Re-fetch group with members count
    const fullGroup = await prisma.group.findUnique({
      where: { id: newGroup.id },
      include: {
        members: true,
      },
    });

    return NextResponse.json(fullGroup, { status: 201 });
  } catch (error) {
    console.error("Failed to create group:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
