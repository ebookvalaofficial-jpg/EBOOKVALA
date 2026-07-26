import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, issueType, description, screenshotUrl, browserInfo } = body;

    if (!issueType || !description) {
      return NextResponse.json({ error: 'Issue type and description are required' }, { status: 400 });
    }

    const report = await prisma.problemReport.create({
      data: {
        name: name || 'Anonymous',
        email: email || null,
        issueType,
        description,
        screenshotUrl: screenshotUrl || null,
        browserInfo: browserInfo || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, id: report.id }, { status: 201 });
  } catch (error) {
    console.error('Problem report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
