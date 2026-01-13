"use client";

import type { ContentItem } from "@/redux/contentTypes";

interface ContentPanelProps {
  item: ContentItem | null;
  editTitle: string;
  editBody: string;
  isEditing: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onEditTitleChange: (value: string) => void;
  onEditBodyChange: (value: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

export function ContentPanel({
  item,
  editTitle,
  editBody,
  isEditing,
  isUpdating,
  isDeleting,
  onEditTitleChange,
  onEditBodyChange,
  onStartEdit,
  onSave,
  onCancelEdit,
  onDelete,
}: ContentPanelProps) {
  if (!item) {
    return (
      <section className="flex-1 overflow-y-auto p-6">
        <div className="h-full flex items-center justify-center text-sm text-gray-600">
          <p>Select a content item on the left or generate a new one.</p>
        </div>
      </section>
    );
  }

  const displayType = item.type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <section className="h-screen flex-1 overflow-scroll p-6 border-none">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="p-1 border rounded tracking-wide">Content Type: {displayType}</span>
            {item.sentiment && (
              <span className="p-1 border rounded tracking-wide">
                Sentiment: {item.sentiment.charAt(0).toUpperCase() +
                  item.sentiment.slice(1)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={onStartEdit}
                className="text-xs px-3 py-1 text-violet-600 rounded border cursor-pointer"
              >
                Edit
              </button>
            )}
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isUpdating}
                  className="text-xs px-3 py-1 rounded border text-green-600 cursor-pointer disabled:opacity-60"
                >
                  {isUpdating ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="text-xs px-3 py-1 rounded border text-red-600 cursor-pointer disabled:opacity-60"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="text-xs px-3 py-1 rounded border cursor-pointer"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          {isEditing ? (
            <>
              <div>
                <label className="block mb-1 font-bold">Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => onEditTitleChange(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">Content</label>
                <textarea
                  value={editBody}
                  onChange={(e) => onEditBodyChange(e.target.value)}
                  rows={12}
                  className="w-full border rounded px-2 py-1 text-sm whitespace-pre-wrap"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-semibold mb-1">
                  {item.title || "Untitled"}
                </h2>
              </div>
              <div>
                <label className="block mb-1 font-bold">Prompt</label>
                <p className="text-xs text-gray-700 border border-dashed rounded px-3 py-2 whitespace-pre-wrap">
                  {item.prompt}
                </p>
              </div>
              <div>
                <label className="block mb-1 font-bold">Content</label>
                <p className="text-sm whitespace-pre-wrap border rounded px-3 py-3">
                  {item.body}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
