"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearAuth } from "@/redux/authSlice";
import { useRouter } from "next/navigation";
import {
  useListContentQuery,
  useDeleteContentMutation,
  useGenerateContentMutation,
  useGetJobStatusQuery,
  useUpdateContentMutation,
} from "@/redux/contentApi";
import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { ContentType } from "@/redux/contentTypes";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { ContentPanel } from "@/components/dashboard/ContentPanel";
import { PromptBar } from "@/components/dashboard/PromptBar";

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const email = useAppSelector((state) => state.auth.userEmail);

  type JobUpdateMode = "auto" | "socket" | "polling";
  const [jobUpdateMode, setJobUpdateMode] = useState<JobUpdateMode>("auto");

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = searchInput.trim();
      setSearchQuery(trimmed ? trimmed : undefined);
    }, 300);

    return () => clearTimeout(handle);
  }, [searchInput]);

  const {
    data: contentItems,
    isLoading: isContentLoading,
    isError: isContentError,
    refetch: refetchContent,
  } = useListContentQuery(searchQuery ? { q: searchQuery } : undefined);

  const [deleteContent, { isLoading: isDeleting }] = useDeleteContentMutation();
  const [generateContent, { isLoading: isGenerating }] =
    useGenerateContentMutation();
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [genPrompt, setGenPrompt] = useState("");
  const [genType, setGenType] = useState<ContentType>("blog_outline");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const {
    data: jobStatus,
    isFetching: isJobPolling,
    refetch: refetchJobStatus,
  } = useGetJobStatusQuery(currentJobId ?? "", {
    skip: !currentJobId,
    pollingInterval: jobUpdateMode === "socket" ? 0 : currentJobId ? 3000 : 0,
  });

  useEffect(() => {
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

    const s = io(SOCKET_URL);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !currentJobId || jobUpdateMode === "polling") return;

    const handleJobUpdate = (payload: { jobId: string; status: string }) => {
      if (payload.jobId !== currentJobId) return;

      void refetchContent();
      void refetchJobStatus();
      setCurrentJobId(null);
    };

    socket.on("jobUpdate", handleJobUpdate);

    return () => {
      socket.off("jobUpdate", handleJobUpdate);
    };
  }, [socket, currentJobId, jobUpdateMode, refetchContent, refetchJobStatus]);

  const latestGenerated = useMemo(
    () =>
      jobStatus?.content && jobStatus.status === "completed"
        ? jobStatus.content
        : null,
    [jobStatus]
  );

  useEffect(() => {
    if (jobStatus?.status === "completed") {
      void refetchContent();
      setCurrentJobId(null);
    }
  }, [jobStatus?.status, refetchContent]);

  const selectedContent = useMemo(
    () => contentItems?.find((item) => item._id === selectedId) ?? null,
    [contentItems, selectedId]
  );

  useEffect(() => {
    if (selectedContent) {
      setEditTitle(selectedContent.title ?? "");
      setEditBody(selectedContent.body ?? "");
      setIsEditing(false);
    } else {
      setEditTitle("");
      setEditBody("");
      setIsEditing(false);
    }
  }, [selectedContent]);

  useEffect(() => {
    if (latestGenerated && latestGenerated._id) {
      setSelectedId(latestGenerated._id);
    }
  }, [latestGenerated]);

  const handleLogout = () => {
    dispatch(clearAuth());
    router.push("/login");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContent(id).unwrap();
      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (err) {
      console.error("Delete content failed", err);
    }
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genPrompt) return;
    try {
      const res = await generateContent({
        prompt: genPrompt,
        contentType: genType,
      }).unwrap();
      setCurrentJobId(res.jobId);
      setGenPrompt("");
      void refetchJobStatus();
    } catch (err) {
      console.error("Generate content failed", err);
    }
  };

  const handleSaveEdits = async () => {
    if (!selectedContent) return;
    try {
      await updateContent({
        id: selectedContent._id,
        data: { title: editTitle, body: editBody },
      }).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error("Update content failed", err);
    }
  };

  const handleNewContent = () => {
    setSelectedId(null);
    setEditTitle("");
    setEditBody("");
    setCurrentJobId(null);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar: history */}
      <Sidebar
        items={contentItems}
        selectedId={selectedId}
        isLoading={isContentLoading}
        isError={isContentError}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSelect={(id) => setSelectedId(id)}
        onNewContent={handleNewContent}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <TopBar email={email} onLogout={handleLogout} />

        {/* Content + editor */}
        <main className="flex-1 flex flex-col">
          <div className="flex items-center justify-end px-4 pt-2 gap-2 text-[11px] text-gray-600">
            <span>Job updates:</span>
            <select
              value={jobUpdateMode}
              onChange={(e) =>
                setJobUpdateMode(e.target.value as JobUpdateMode)
              }
              className="border rounded px-1 py-0.5 text-[11px] bg-white cursor-pointer"
            >
              <option value="auto">Auto (Socket + Polling)</option>
              <option value="socket">Socket only</option>
              <option value="polling">Polling only</option>
            </select>
          </div>
          {selectedContent ? (
            <ContentPanel
              item={selectedContent}
              editTitle={editTitle}
              editBody={editBody}
              isEditing={isEditing}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
              onEditTitleChange={setEditTitle}
              onEditBodyChange={setEditBody}
              onStartEdit={() => setIsEditing(true)}
              onSave={handleSaveEdits}
              onCancelEdit={() => {
                setIsEditing(false);
                if (selectedContent) {
                  setEditTitle(selectedContent.title ?? "");
                  setEditBody(selectedContent.body ?? "");
                }
              }}
              onDelete={() => {
                if (selectedContent) {
                  void handleDelete(selectedContent._id);
                }
              }}
            />
          ) : (
            <PromptBar
              genType={genType}
              genPrompt={genPrompt}
              isGenerating={isGenerating}
              currentJobId={currentJobId}
              jobStatus={jobStatus}
              isJobPolling={isJobPolling}
              onGenTypeChange={(t) => setGenType(t)}
              onGenPromptChange={(v) => setGenPrompt(v)}
              onSubmit={handleGenerateSubmit}
            />
          )}
        </main>
      </div>
    </div>
  );
}
