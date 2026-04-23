import { AiFillStar, AiOutlineStar } from "react-icons/ai";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: string;
}

const StarRating = ({ value, onChange, size = "text-xl" }: StarRatingProps) => {
  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            disabled={!onChange}
            className={`${size} transition-colors duration-150 ${
              onChange
                ? "cursor-pointer hover:text-yellow-400"
                : "cursor-default"
            } ${filled ? "text-yellow-400" : "dark:text-gray-600 text-gray-300"}`}
          >
            {filled ? <AiFillStar /> : <AiOutlineStar />}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
