import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.util';
import prisma from '@/lib/prisma.util';
import * as z from 'zod';
import { t, changeLanguage } from '@/lib/backendTranslations';

const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    changeLanguage(request.headers.get('Accept-Language') ?? 'en');
    return NextResponse.json({ error: t('api:error.unauthorized') }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    changeLanguage(request.headers.get('Accept-Language') ?? 'en');
    return NextResponse.json({ error: t('api:error.databaseError') }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    changeLanguage(request.headers.get('Accept-Language') ?? 'en');
    return NextResponse.json({ error: t('api:error.unauthorized') }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    const newProject = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        code: '',
        userId: session.user.id,
      },
    });

    changeLanguage(request.headers.get('Accept-Language') ?? 'en');
    return NextResponse.json({ project: newProject, message: t('api:success.projectCreated') });
  } catch (error) {
    if (error instanceof z.ZodError) {
      changeLanguage(request.headers.get('Accept-Language') ?? 'en');
      return NextResponse.json({ error: t('api:error.invalidInput') }, { status: 400 });
    }
    console.error('Error creating project:', error);
    changeLanguage(request.headers.get('Accept-Language') ?? 'en');
    return NextResponse.json({ error: t('api:error.databaseError') }, { status: 500 });
  }
}
