import { create } from "zustand";
import { api } from "@/lib/api";
import type { Review } from "@claudeship/shared";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:14000/api";

interface ArchitectState {
  reviews: Review[];
  activeReview: Review | null;
  isReviewing: boolean;
  error: string | null;
  currentProjectId: string | null;

  fetchReviews: (projectId: string) => Promise<void>;
  fetchReview: (projectId: string, reviewId: string) => Promise<void>;
  triggerReview: (projectId: string) => Promise<void>;
  subscribeToReviews: (projectId: string) => () => void;
  clearError: () => void;
}

export const useArchitectStore = create<ArchitectState>((set, get) => ({
  reviews: [],
  activeReview: null,
  isReviewing: false,
  error: null,
  currentProjectId: null,

  fetchReviews: async (projectId: string) => {
    try {
      const reviews = await api.get<Review[]>(
        `/projects/${projectId}/reviews`,
      );
      set({ reviews, currentProjectId: projectId, error: null });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch reviews",
      });
    }
  },

  fetchReview: async (projectId: string, reviewId: string) => {
    try {
      const review = await api.get<Review>(
        `/projects/${projectId}/reviews/${reviewId}`,
      );
      set({ activeReview: review, error: null });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch review",
      });
    }
  },

  triggerReview: async (projectId: string) => {
    try {
      set({ isReviewing: true, error: null });
      await api.post(`/projects/${projectId}/reviews/trigger`);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to trigger review",
        isReviewing: false,
      });
    }
  },

  subscribeToReviews: (projectId: string) => {
    const eventSource = new EventSource(
      `${API_BASE_URL}/projects/${projectId}/reviews/subscribe`,
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "start") {
          set({ isReviewing: true });
        } else if (data.type === "complete") {
          set({ isReviewing: false });
          // Refresh reviews list
          get().fetchReviews(projectId);
        } else if (data.type === "error") {
          set({
            isReviewing: false,
            error: data.data?.error || "Review failed",
          });
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      // EventSource will auto-reconnect
    };

    return () => {
      eventSource.close();
    };
  },

  clearError: () => set({ error: null }),
}));
