import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.util';
import prisma from '@/lib/prisma.util';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { repoUrl } = await request.json();

    // Extract owner and repo from the URL
    const [, , , owner, repo] = new URL(repoUrl).pathname.split('/');

    // Fetch repository data
    const { data: repoData } = await octokit.repos.get({ owner, repo });

    // Fetch repository content
    const { data: repoContent } = await octokit.repos.getContent({
      owner,
      repo,
      path: '',
    });

    // Create project in database
    const project = await prisma.project.create({
      data: {
        name: repoData.name,
        userId: session.user.id,
        description: repoData.description ?? '',
        code: JSON.stringify(repoContent),
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error importing project:', error);
    return NextResponse.json(
      { error: 'An error occurred while importing the project' },
      { status: 500 }
    );
  }
}
