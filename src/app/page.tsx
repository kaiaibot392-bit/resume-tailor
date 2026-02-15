'use client';

import { useState } from 'react';

export default function Home() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tailoredResume, setTailoredResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTailor = async () => {
    if (!resume.trim() || !jobDescription.trim()) return;

    setLoading(true);
    setError('');
    setTailoredResume('');

    try {
      const response = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to tailor resume');
      }

      setTailoredResume(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(tailoredResume);
  };

  const downloadTxt = () => {
    const blob = new Blob([tailoredResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tailored-resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-semibold mb-2">Resume Tailor</h1>
          <p className="text-zinc-500">Optimize your resume for each job application</p>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#12121a] border border-zinc-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">Your Resume</h2>
              <span className="text-sm text-zinc-600">{resume.length} chars</span>
            </div>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume or enter a URL (e.g., linkedin.com/in/yourname)..."
              className="w-full h-80 bg-[#0a0a0f] border border-zinc-800 rounded-lg p-4 text-sm font-mono resize-none focus:border-green-500 focus:outline-none placeholder:text-zinc-600"
            />
          </div>

          <div className="bg-[#12121a] border border-zinc-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">Job Description</h2>
              <span className="text-sm text-zinc-600">{jobDescription.length} chars</span>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description or enter a URL..."
              className="w-full h-80 bg-[#0a0a0f] border border-zinc-800 rounded-lg p-4 text-sm font-mono resize-none focus:border-green-500 focus:outline-none placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="flex justify-center mb-12">
          <button
            onClick={handleTailor}
            disabled={!resume.trim() || !jobDescription.trim() || loading}
            className="bg-green-500 text-black font-medium px-8 py-3 rounded-lg hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse">●</span> Tailoring...
              </span>
            ) : (
              'Tailor Resume'
            )}
          </button>
        </div>

        {tailoredResume && (
          <div className="bg-[#12121a] border border-zinc-800 rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">Tailored Resume</h2>
              <span className="text-sm text-zinc-600">{tailoredResume.length} chars</span>
            </div>
            <div className="flex gap-3 mb-3">
              <button
                onClick={copyToClipboard}
                className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={downloadTxt}
                className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
              >
                Download .txt
              </button>
            </div>
            <textarea
              value={tailoredResume}
              readOnly
              className="w-full h-96 bg-[#0a0a0f] border border-zinc-800 rounded-lg p-4 text-sm font-mono resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
