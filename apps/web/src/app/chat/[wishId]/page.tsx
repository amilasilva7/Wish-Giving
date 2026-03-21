"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SparkLoader from "@/app/components/SparkLoader";
import PageLoader from "@/app/components/PageLoader";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
};

type Conversation = {
  id: string;
  messages: Message[];
};

function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

export default function ChatPage() {
  const params = useParams<{ wishId: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function ensureConversation() {
    await fetch(`/api/conversations/${params.wishId}`, { method: "POST" });
  }

  async function loadConversation() {
    const res = await fetch(`/api/conversations/${params.wishId}`);
    if (res.status === 401) {
      setAuthError("login");
      return;
    }
    if (res.status === 403) {
      setAuthError("forbidden");
      return;
    }
    if (!res.ok) return;
    const data = await res.json();
    setConversation(data.conversation);
  }

  useEffect(() => {
    (async () => {
      await ensureConversation();
      await loadConversation();
    })();
  }, [params.wishId]);

  // Poll every 8 seconds when conversation is loaded
  useEffect(() => {
    if (!conversation) return;
    const interval = setInterval(loadConversation, 8000);
    return () => clearInterval(interval);
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!conversation) return;
    setSending(true);
    const res = await fetch(`/api/messages/${conversation.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body })
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to send");
      return;
    }
    setBody("");
    await loadConversation();
  }

  if (authError === "forbidden") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12">
          <p className="text-gray-500">You don't have access to this conversation.</p>
        </div>
      </div>
    );
  }

  if (authError === "login") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">You must be signed in to view this conversation.</p>
          <Link href={`/auth/login?redirect=/chat/${params.wishId}`} className="btn-primary inline-block">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    {sending && <PageLoader label="Sending message…" />}
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Chat about this wish</h1>
      {conversation ? (
        <div className="card flex flex-col gap-4">
          <div className="flex flex-col gap-3 min-h-40 max-h-96 overflow-y-auto">
            {conversation.messages.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No messages yet. Say hello!</p>
            ) : (
              conversation.messages.map(m => (
                <div key={m.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-500 flex-shrink-0">
                    {m.sender.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xs font-semibold text-gray-700">{m.sender.name}</p>
                      <span className="text-xs text-gray-400">{relativeTime(m.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{m.body}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-gray-100 pt-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                className="input flex-1 resize-none"
                rows={2}
                placeholder="Type a message..."
                required
              />
              <button type="submit" className="btn-primary self-end" disabled={sending}>
                {sending ? <SparkLoader size="sm" /> : "Send"}
              </button>
            </form>
            {error && <p className="error-msg mt-2">{error}</p>}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12 text-orange-400"><SparkLoader label="Loading conversation…" /></div>
      )}
    </div>
    </>
  );
}
