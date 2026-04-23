import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/authContext";

interface Review {
  id: number;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  username: string;
}

interface ReviewAverage {
  average: number | null;
  count: number;
}

export const useReviews = (mediaType: string, mediaId: number) => {
  const { token, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const [reviewsRes, avgRes] = await Promise.all([
        fetch(`/api/reviews?media_type=${mediaType}&media_id=${mediaId}`),
        fetch(`/api/reviews/average?media_type=${mediaType}&media_id=${mediaId}`),
      ]);
      const reviewsData: Review[] = await reviewsRes.json();
      const avgData: ReviewAverage = await avgRes.json();
      setReviews(reviewsData);
      setAverage(avgData.average);
      setCount(avgData.count);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [mediaType, mediaId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = useCallback(
    async (rating: number, content: string) => {
      if (!token) return;
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          media_type: mediaType,
          media_id: mediaId,
          rating,
          content,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await fetchReviews();
    },
    [token, mediaType, mediaId, fetchReviews]
  );

  const updateReview = useCallback(
    async (reviewId: number, rating: number, content: string) => {
      if (!token) return;
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, content }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await fetchReviews();
    },
    [token, fetchReviews]
  );

  const deleteReview = useCallback(
    async (reviewId: number) => {
      if (!token) return;
      await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchReviews();
    },
    [token, fetchReviews]
  );

  const userReview = reviews.find((r) => r.user_id === user?.id) || null;

  return {
    reviews,
    average,
    count,
    loading,
    userReview,
    submitReview,
    updateReview,
    deleteReview,
  };
};
