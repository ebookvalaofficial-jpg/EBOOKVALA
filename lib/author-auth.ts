import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export interface AuthorAuthResult {
  authorUser?: {
    id: string;
    email: string;
    name: string | null;
    isAuthor: boolean;
    authorProfileId?: string;
  };
  errorResponse?: NextResponse;
}

export async function checkAuthorAuth(): Promise<AuthorAuthResult> {
  const session = await auth();

  if (!session || !session.user?.email) {
    return {
      errorResponse: NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      isAuthor: true,
      isBanned: true,
      authorProfile: { select: { id: true } },
    },
  });

  if (!user || user.isBanned) {
    return {
      errorResponse: NextResponse.json({ error: 'Forbidden: Account suspended or invalid' }, { status: 403 }),
    };
  }

  if (!user.isAuthor) {
    return {
      errorResponse: NextResponse.json({ error: 'Forbidden: Author role required' }, { status: 403 }),
    };
  }

  return {
    authorUser: {
      id: user.id,
      email: user.email,
      name: user.name,
      isAuthor: user.isAuthor,
      authorProfileId: user.authorProfile?.id,
    },
  };
}
