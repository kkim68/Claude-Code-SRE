import { Link, useNavigate } from "react-router-dom";
import { FaYoutube } from "react-icons/fa";
import { BsBookmarkFill, BsBookmark } from "react-icons/bs";

import Image from "../Image";
import { IMovie } from "@/types";
import { useMediaQuery } from "usehooks-ts";
import { useAuth } from "@/context/authContext";
import { useWatchlistCheck } from "@/hooks/useWatchlist";

const MovieCard = ({
  movie,
  category,
}: {
  movie: IMovie;
  category: string;
}) => {
  const { poster_path, original_title: title, name, id } = movie;
  const isMobile = useMediaQuery("(max-width: 380px)");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { inWatchlist, toggle: toggleWatchlist } = useWatchlistCheck(
    category,
    Number(id)
  );

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    toggleWatchlist(title || name, poster_path);
  };

  return (
    <>
      <Link
        to={`/${category}/${id}`}
        className="dark:bg-[#1f1f1f] bg-[#f5f5f5] rounded-lg relative group w-[170px] select-none xs:h-[250px] h-[216px] overflow-hidden"
      >
        <Image
          height={!isMobile ? 250 : 216}
          width={170}
          src={`https://image.tmdb.org/t/p/original/${poster_path}`}
          alt={movie.original_title}
          className=" object-cover rounded-lg drop-shadow-md shadow-md group-hover:shadow-none group-hover:drop-shadow-none transition-all duration-300 ease-in-out"
          effect="zoomIn"
        />

        <div className="absolute top-0 left-0 w-[170px]  h-full group-hover:opacity-100 opacity-0 bg-[rgba(0,0,0,0.6)] transition-all duration-300 rounded-lg flex items-center justify-center">
          <div className="xs:text-[48px] text-[42px] text-[#ff0000] scale-[0.4] group-hover:scale-100 transition-all duration-300 ">
            <FaYoutube />
          </div>
        </div>

        <button
          onClick={handleWatchlistClick}
          className="absolute top-2 right-2 z-[2] bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
          title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          {inWatchlist ? (
            <BsBookmarkFill className="text-xs text-red-500" />
          ) : (
            <BsBookmark className="text-xs" />
          )}
        </button>
      </Link>

      <h4 className="dark:text-gray-300 text-center cursor-default sm:text-base xs:text-[14.75px] text-[14px] font-medium ">
        {(title?.length > 50 ? title.split(":")[0] : title) || name}
      </h4>
    </>
  );
};

export default MovieCard;
