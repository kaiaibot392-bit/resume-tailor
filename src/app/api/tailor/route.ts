import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function fetchUrlContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Resume-Tailor/1.0',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }
  
  const html = await response.text();
  
  // Simple text extraction - remove scripts, styles, tags
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return text;
}

export async function POST(request: Request) {
  try {
    const { resume, jobDescription } = await request.json();

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing resume or job description' },
        { status: 400 }
      );
    }

    // Handle resume (text or URL)
    let resumeContent = resume;
    if (resume.startsWith('http://') || resume.startsWith('https://')) {
      try {
        resumeContent = await fetchUrlContent(resume);
      } catch {
        return NextResponse.json(
          { error: 'Failed to fetch resume URL' },
          { status: 400 }
        );
      }
    }

    // Handle job description (text or URL)
    let jobContent = jobDescription;
    if (jobDescription.startsWith('http://') || jobDescription.startsWith('https://')) {
      try {
        jobContent = await fetchUrlContent(jobDescription);
      } catch {
        return NextResponse.json(
          { error: 'Failed to fetch job description URL' },
          { status: 400 }
        );
      }
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
          content: `Resume:\n${resumeContent}\n\nJob Description:\n${jobContent}`,
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
