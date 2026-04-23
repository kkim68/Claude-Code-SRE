import { useState, FormEvent, useEffect } from "react";
import { AiFillStar } from "react-icons/ai";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

import StarRating from "./StarRating";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/context/authContext";
import { maxWidth, paragraph } from "@/styles";
import { cn } from "@/utils/helper";

interface ReviewsProps {
  mediaType: string;
  mediaId: number;
}

const Reviews = ({ mediaType, mediaId }: ReviewsProps) => {
  const { isAuthenticated, user } = useAuth();
  const {
    reviews,
    average,
    count,
    loading,
    userReview,
    submitReview,
    updateReview,
    deleteReview,
  } = useReviews(mediaType, mediaId);

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (userReview && !editing) {
      setRating(userReview.rating);
      setContent(userReview.content);
      setEditing(true);
    }
  }, [userReview]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      if (editing && userReview) {
        await updateReview(userReview.id, rating, content);
      } else {
        await submitReview(rating, content);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    await deleteReview(reviewId);
    setRating(0);
    setContent("");
    setEditing(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "Z");
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return null;

  return (
    <section className={cn(maxWidth, "py-8")}>
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-2xl font-bold font-nunito dark:text-secColor text-black">
          Reviews
        </h3>
        {count > 0 && average !== null && (
          <div className="flex items-center gap-2 dark:text-gray-300 text-gray-600">
            <AiFillStar className="text-yellow-400 text-lg" />
            <span className="font-semibold">{average}</span>
            <span className="text-sm">
              ({count} {count === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {isAuthenticated && (
        <form
          onSubmit={handleSubmit}
          className="dark:bg-[#1e1a2e] bg-gray-50 rounded-lg p-6 mb-8"
        >
          <h4 className="font-medium dark:text-gray-200 text-gray-800 mb-3">
            {editing ? "Update your review" : "Write a review"}
          </h4>

          <div className="mb-4">
            <StarRating value={rating} onChange={setRating} size="text-2xl" />
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            maxLength={2000}
            className="w-full px-3 py-2 rounded bg-white dark:bg-[#2a2540] dark:text-secColor text-black border dark:border-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}

          <div className="flex gap-3 mt-3">
            <button
              type="submit"
              disabled={submitting}
              className="py-2 px-6 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors duration-300 disabled:opacity-50 text-sm"
            >
              {submitting
                ? "Saving..."
                : editing
                ? "Update Review"
                : "Submit Review"}
            </button>
            {editing && userReview && (
              <button
                type="button"
                onClick={() => handleDelete(userReview.id)}
                className="py-2 px-4 bg-transparent border dark:border-gray-600 border-gray-300 dark:text-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500 font-medium rounded transition-colors duration-300 text-sm"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className={cn(paragraph, "dark:text-gray-500 text-gray-400")}>
          No reviews yet.{" "}
          {!isAuthenticated && "Sign in to be the first to review."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="dark:bg-[#1e1a2e] bg-gray-50 rounded-lg p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold dark:text-secColor text-black text-sm">
                    {review.username}
                  </span>
                  <StarRating
                    value={review.rating}
                    size="text-sm"
                  />
                  <span className="text-xs dark:text-gray-500 text-gray-400">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                {user?.id === review.user_id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRating(review.rating);
                        setContent(review.content);
                        setEditing(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="dark:text-gray-400 text-gray-500 hover:text-red-500 transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="dark:text-gray-400 text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                )}
              </div>
              {review.content && (
                <p className={cn(paragraph, "dark:text-gray-300 text-gray-700")}>
                  {review.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Reviews;
