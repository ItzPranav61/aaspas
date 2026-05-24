import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, email, localityId, avatarUrl } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required to update profile" },
        { status: 400 }
      );
    }

    // Verify if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      name?: string;
      email?: string | null;
      localityId?: string | null;
      avatarUrl?: string | null;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (email !== undefined) {
      // Check if email is already taken by another user
      if (email !== null && email !== "") {
        const emailUser = await prisma.user.findUnique({
          where: { email },
        });
        if (emailUser && emailUser.id !== userId) {
          return NextResponse.json(
            { error: "Email is already in use by another account" },
            { status: 400 }
          );
        }
      }
      updateData.email = email === "" ? null : email;
    }

    if (localityId !== undefined) {
      if (localityId !== null) {
        // Verify locality exists
        const locality = await prisma.locality.findUnique({
          where: { id: localityId },
        });
        if (!locality) {
          return NextResponse.json(
            { error: "Invalid localityId. Locality not found." },
            { status: 400 }
          );
        }
      }
      updateData.localityId = localityId;
    }

    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
