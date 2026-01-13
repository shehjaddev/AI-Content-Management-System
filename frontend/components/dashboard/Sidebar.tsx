"use client";

import type { ContentItem } from "@/redux/contentTypes";

interface SidebarProps {
  items: ContentItem[] | undefined;
  selectedId: string | null;
  isLoading: boolean;
  isError: boolean;
  onSelect: (id: string) => void;
  onNewContent: () => void;
}

export function Sidebar({
  items,
  selectedId,
  isLoading,
  isError,
  onSelect,
  onNewContent,
}: SidebarProps) {
  const selected = items?.find((i) => i._id === selectedId) ?? null;

  return (
    <aside className="w-72 border-r flex flex-col">
      <div className="h-16 p-3 border-b flex items-center justify-between">
        <span className="text-sm font-semibold">Content List</span>
        <button
          type="button"
          onClick={onNewContent}
          className="text-xs px-2 py-1 rounded border cursor-pointer text-violet-600"
        >
          New Content
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
        {isLoading && <p className="text-gray-600">Loading...</p>}
        {isError && <p className="text-red-600">Failed to load content.</p>}
        {!isLoading && !isError && (
          <>
            {items && items.length > 0 ? (
              items.map((item) => {
                const isActive = selected?._id === item._id;
                const displayType = item.type
                  .split("_")
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(" ");
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => onSelect(item._id)}
                    className={`w-full flex items-start justify-between gap-2 rounded px-2 py-2 text-left cursor-pointer ${
                      isActive ? "border" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="truncate text-xs font-semibold max-w-[140px]">
                          {item.title || "Untitled"}
                        </span>
                        <span className="text-[9px] tracking-wide text-gray-500">
                          {displayType}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-600 line-clamp-2">
                        {item.prompt}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-gray-600">No content yet.</p>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
