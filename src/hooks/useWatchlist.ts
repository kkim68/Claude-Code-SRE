import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/authContext";

interface WatchlistItem {
  id: number;
  user_id: number;
  media_type: string;
  media_id: number;
  title: string;
  poster_path: string;
  created_at: string;
}

export const useWatchlistCheck = (mediaType: string, mediaId: number) => {
  const { token, isAuthenticated } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const check = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/watchlist/check?media_type=${mediaType}&media_id=${mediaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setInWatchlist(data.inWatchlist);
      setWatchlistId(data.watchlistId);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, mediaType, mediaId]);

  useEffect(() => {
    check();
  }, [check]);

  const toggle = useCallback(
    async (title: string, posterPath: string) => {
      if (!token) return;
      if (inWatchlist && watchlistId) {
        await fetch(`/api/watchlist/${watchlistId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setInWatchlist(false);
        setWatchlistId(null);
      } else {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            media_type: mediaType,
            media_id: mediaId,
            title,
            poster_path: posterPath,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setInWatchlist(true);
          setWatchlistId(data.id);
        }
      }
    },
    [token, inWatchlist, watchlistId, mediaType, mediaId]
  );

  return { inWatchlist, loading, toggle };
};

export const useWatchlistAll = () => {
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const remove = useCallback(
    async (id: number) => {
      if (!token) return;
      await fetch(`/api/watchlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [token]
  );

  return { items, loading, remove, refetch: fetchAll };
};
