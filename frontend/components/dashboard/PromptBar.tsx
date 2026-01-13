"use client";

import type { ContentType, JobStatusResponse } from "@/redux/contentTypes";

interface PromptBarProps {
  genType: ContentType;
  genPrompt: string;
  isGenerating: boolean;
  currentJobId: string | null;
  jobStatus: JobStatusResponse | undefined;
  isJobPolling: boolean;
  onGenTypeChange: (type: ContentType) => void;
  onGenPromptChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PromptBar({
  genType,
  genPrompt,
  isGenerating,
  currentJobId,
  jobStatus,
  isJobPolling,
  onGenTypeChange,
  onGenPromptChange,
  onSubmit,
}: PromptBarProps) {
  return (
    <div className="h-[calc(100vh-64px)] flex justify-center items-center">
      <section className="mb-48 min-w-1/2 border-none">
        <form
          onSubmit={onSubmit}
          className="max-w-3xl mx-auto flex flex-col gap-2 text-sm"
        >
          <div>
            <label className="block mb-1 text-lg font-semibold">Prompt</label>
            <textarea
              value={genPrompt}
              onChange={(e) => onGenPromptChange(e.target.value)}
              rows={3}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex justify-between">
            <select
              value={genType}
              onChange={(e) => onGenTypeChange(e.target.value as ContentType)}
              className="w-48 border rounded px-2 py-1 text-sm cursor-pointer"
            >
              <option value="blog_outline">Blog Outline</option>
              <option value="product_description">Product Description</option>
              <option value="social_caption">Social Caption</option>
            </select>
            <button
              type="submit"
              disabled={isGenerating}
              className="w-48 items-center rounded border px-3 py-1.5 text-xs font-medium text-violet-600 disabled:opacity-60 cursor-pointer"
            >
              {isGenerating ? "Queuing..." : "Generate"}
            </button>
          </div>
        </form>
        <div className="max-w-3xl mx-auto space-y-2 text-xs text-gray-600 mt-4">
          {currentJobId && (
            <p className="text-red-600">
              Job {currentJobId}:{" "}
              {jobStatus?.status
                ? jobStatus.status.charAt(0).toUpperCase() +
                  jobStatus.status.slice(1)
                : "pending"}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
