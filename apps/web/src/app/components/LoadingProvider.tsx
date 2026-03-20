"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import PageLoader from "./PageLoader";

interface LoadingContextType {
  showLoading: (label?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const countRef = useRef(0);
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("Please wait…");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-hide when navigation completes (pathname changes)
  useEffect(() => {
    if (prevPathRef.current !== null && prevPathRef.current !== pathname) {
      countRef.current = 0;
      setVisible(false);
    }
    prevPathRef.current = pathname;
  }, [pathname]);

  const showLoading = useCallback((newLabel?: string) => {
    countRef.current++;
    setLabel(newLabel ?? "Please wait…");
    setVisible(true);
  }, []);

  const hideLoading = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    if (countRef.current === 0) {
      setVisible(false);
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {mounted && visible && createPortal(<PageLoader label={label} />, document.body)}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}
