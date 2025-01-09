import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { code, files, projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Check if the project exists and belongs to the user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    // Handle large files
    if (code.length > CHUNK_SIZE) {
      const chunks = Math.ceil(code.length / CHUNK_SIZE);
      for (let i = 0; i < chunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min((i + 1) * CHUNK_SIZE, code.length);
        const chunk = code.slice(start, end);
        await (prisma as any).projectFile.create({
          data: {
            projectId,
            path: `chunk_${i}`,
            content: chunk,
          },
        });
      }
      // Save metadata
      await (prisma as any).projectFile.create({
        data: {
          projectId,
          path: 'metadata',
          content: JSON.stringify({ chunks }),
        },
      });
    } else {
      // Update the project's code
      await prisma.project.update({
        where: { id: projectId },
        data: { code },
      });
    }

    // Save or update files
    for (const file of files) {
      await (prisma as any).projectFile.upsert({
        where: {
          projectId_path: {
            projectId,
            path: file.path,
          },
        },
        update: {
          content: file.content,
        },
        create: {
          projectId,
          path: file.path,
          content: file.content,
        },
      });
    }

    return NextResponse.json({ message: 'Code and files saved successfully' });
  } catch (error) {
    console.error('Error saving code:', error);
    return NextResponse.json({ error: 'An error occurred while saving the code' }, { status: 500 });
  }
}
