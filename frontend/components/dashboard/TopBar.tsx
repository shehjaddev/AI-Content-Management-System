"use client";

interface TopBarProps {
  email: string | null;
  onLogout: () => void;
}

export function TopBar({ email, onLogout }: TopBarProps) {
  return (
    <header className="h-16 border-b flex items-center justify-between px-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold">AI Content Management System</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-600">
        {email && <span>{email}</span>}
        <button
          type="button"
          onClick={onLogout}
          className="px-2 py-1 rounded border text-sm text-red-600 cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
