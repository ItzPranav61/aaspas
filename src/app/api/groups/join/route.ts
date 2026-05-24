import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, userId } = body;

    if (!groupId || !userId) {
      return NextResponse.json(
        { error: "groupId and userId are required" },
        { status: 400 }
      );
    }

    // Check if membership exists
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    let joined = false;

    if (existingMember) {
      // Creator cannot leave their own group if they are the admin, but for mock let's allow or keep creator
      // Let's find group to see who created it
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (group?.createdBy === userId) {
        return NextResponse.json(
          { error: "Group creator cannot leave the group" },
          { status: 400 }
        );
      }

      await prisma.groupMember.delete({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
      });
      joined = false;
    } else {
      await prisma.groupMember.create({
        data: {
          groupId,
          userId,
          role: "member",
        },
      });
      joined = true;
    }

    const count = await prisma.groupMember.count({
      where: { groupId },
    });

    return NextResponse.json({ joined, count });
  } catch (error) {
    console.error("Failed to toggle group membership:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
