import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const localityId = searchParams.get("localityId");
    const category = searchParams.get("category");
    const groupId = searchParams.get("groupId");

    // Build filter object
    const where: {
      localityId?: string;
      category?: string;
      content?: {
        contains?: string;
        not?: {
          contains: string;
        };
      };
    } = {};

    if (localityId) {
      where.localityId = localityId;
    }

    if (category && category !== "all" && category !== "All") {
      where.category = category.toLowerCase().replace(" & ", "_").replace("/", "_").replace(" ", "_");
    }

    // If fetching for a specific group, we search for the [Group:id] tag in content
    if (groupId) {
      where.content = {
        contains: `[Group:${groupId}]`,
      };
    } else {
      // Exclude group posts from the main general feed unless requested
      where.content = {
        not: {
          contains: "[Group:",
        },
      };
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        eventDetail: true,
        alertDetail: true,
        lostFoundDetail: true,
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      localityId?: string;
      title?: string;
      content?: string;
      category?: string;
      imageUrl?: string;
      eventDate?: string;
      location?: string;
      severity?: string;
      expiresAt?: string;
      type?: string;
      itemName?: string;
      reward?: string;
      groupId?: string;
    };
    const {
      userId,
      localityId,
      title,
      content,
      category,
      imageUrl,
      // Optional details
      eventDate,
      location,
      severity,
      expiresAt,
      type,
      itemName,
      reward,
      groupId, // Optional if posted to a group
    } = body;

    if (!userId || !localityId || !title || !content || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Format content if posted to a group
    const finalContent = groupId ? `[Group:${groupId}]${content}` : content;
    const dbCategory = category.toLowerCase().replace(" & ", "_").replace("/", "_").replace(" ", "_");

    // Create post in a transaction to include details
    const newPost = await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          userId,
          localityId,
          title,
          content: finalContent,
          category: dbCategory,
          imageUrl: imageUrl || null,
        },
      });

      if (dbCategory === "event" && eventDate && location) {
        await tx.eventDetail.create({
          data: {
            postId: post.id,
            eventDate: new Date(eventDate),
            location,
          },
        });
      } else if (dbCategory === "alert" && severity) {
        await tx.alertDetail.create({
          data: {
            postId: post.id,
            severity,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
          },
        });
      } else if (dbCategory === "lost_found" && type && itemName) {
        await tx.lostFoundDetail.create({
          data: {
            postId: post.id,
            type,
            itemName,
            reward: reward || null,
          },
        });
      }

      return post;
    });

    // Re-fetch post with full relations
    const fullPost = await prisma.post.findUnique({
      where: { id: newPost.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        eventDetail: true,
        alertDetail: true,
        lostFoundDetail: true,
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(fullPost, { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
