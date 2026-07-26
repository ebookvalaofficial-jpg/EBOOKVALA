import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, copyrightedWork, infringingUrl, statement, signature } = body;

    if (!name || !email || !copyrightedWork || !infringingUrl || !statement || !signature) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const request = await prisma.dmcaRequest.create({
      data: {
        name,
        email,
        copyrightedWork,
        infringingUrl,
        statement,
        signature,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, id: request.id }, { status: 201 });
  } catch (error) {
    console.error('DMCA submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
