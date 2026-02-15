import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { resume, jobDescription } = await request.json();

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing resume or job description' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a resume optimization expert. Rewrite the resume to best match the job description. Highlight relevant skills, experiences, and achievements that align with the job requirements. Keep the same format and structure but emphasize the most relevant points. Do not fabricate information.',
        },
        {
          role: 'user',
          content: `Resume:\n${resume}\n\nJob Description:\n${jobDescription}`,
        },
      ],
      temperature: 0.7,
    });

    const tailoredResume = completion.choices[0]?.message?.content;

    if (!tailoredResume) {
      return NextResponse.json(
        { error: 'Failed to generate tailored resume' },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: tailoredResume });
  } catch (error) {
    console.error('Error tailoring resume:', error);
    return NextResponse.json(
      { error: 'Failed to tailor resume' },
      { status: 500 }
    );
  }
}
