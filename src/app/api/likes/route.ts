import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, userId } = body;

    if (!postId || !userId) {
      return NextResponse.json(
        { error: "postId and userId are required" },
        { status: 400 }
      );
    }

    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    let liked = false;

    if (existingLike) {
      // Remove like
      await prisma.like.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
      liked = false;
    } else {
      // Add like
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
      liked = true;
    }

    // Count total likes
    const count = await prisma.like.count({
      where: { postId },
    });

    return NextResponse.json({ liked, count });
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
