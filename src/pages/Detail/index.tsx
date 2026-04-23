import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { BsBookmarkFill, BsBookmark } from "react-icons/bs";

import { Poster, Loader, Error, Section } from "@/common";
import { Casts, Videos, Genre, Reviews } from "./components";

import { useGetShowQuery } from "@/services/TMDB";
import { useMotion } from "@/hooks/useMotion";
import { useWatchlistCheck } from "@/hooks/useWatchlist";
import { useAuth } from "@/context/authContext";
import { mainHeading, maxWidth, paragraph } from "@/styles";
import { cn } from "@/utils/helper";

const Detail = () => {
  const { category, id } = useParams();
  const [show, setShow] = useState<Boolean>(false);
  const { fadeDown, staggerContainer } = useMotion();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { inWatchlist, toggle: toggleWatchlist } = useWatchlistCheck(
    String(category),
    Number(id)
  );

  const {
    data: movie,
    isLoading,
    isFetching,
    isError,
  } = useGetShowQuery({
    category: String(category),
    id: Number(id),
  });

  useEffect(() => {
    document.title =
      (movie?.title || movie?.name) && !isLoading
        ? movie.title || movie.name
        : "tMovies";

    return () => {
      document.title = "tMovies";
    };
  }, [movie?.title, isLoading, movie?.name]);

  const toggleShow = () => setShow((prev) => !prev);

  if (isLoading || isFetching) {
    return <Loader />;
  }

  if (isError) {
    return <Error error="Something went wrong!" />;
  }

  const {
    title,
    poster_path: posterPath,
    overview,
    name,
    genres,
    videos,
    credits,
  } = movie;

  const backgroundStyle = {
    backgroundImage: `linear-gradient(to top, rgba(0,0,0), rgba(0,0,0,0.98),rgba(0,0,0,0.8) ,rgba(0,0,0,0.4)),url('https://image.tmdb.org/t/p/original/${posterPath}'`,
    backgroundPosition: "top",
    backgroundSize: "cover",
  };

  return (
    <>
      <section className="w-full" style={backgroundStyle}>
        <div
          className={`${maxWidth} lg:py-36 sm:py-[136px] sm:pb-28 xs:py-28 xs:pb-12 pt-24 pb-8 flex flex-row lg:gap-12 md:gap-10 gap-8 justify-center`}
        >
          <Poster title={title} posterPath={posterPath} />
          <m.div
            variants={staggerContainer(0.2, 0.4)}
            initial="hidden"
            animate="show"
            className="text-gray-300 sm:max-w-[80vw] max-w-[90vw]  md:max-w-[520px] font-nunito flex flex-col lg:gap-5 sm:gap-4 xs:gap-[14px] gap-3 mb-8 flex-1 will-change-transform motion-reduce:transform-none"
          >
            <m.div
              variants={fadeDown}
              className="flex items-start gap-3 will-change-transform motion-reduce:transform-none"
            >
              <h2
                className={cn(mainHeading, " md:max-w-[420px]")}
              >
                {title || name}
              </h2>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/signin");
                    return;
                  }
                  toggleWatchlist(title || name, posterPath);
                }}
                className="mt-1 text-xl text-secColor hover:text-red-500 transition-colors duration-200 flex-shrink-0"
                title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              >
                {inWatchlist ? <BsBookmarkFill className="text-red-500" /> : <BsBookmark />}
              </button>
            </m.div>

            <m.ul
              variants={fadeDown}
              className="flex flex-row items-center  sm:gap-[14px] xs:gap-3 gap-[6px] flex-wrap will-change-transform motion-reduce:transform-none"
            >
              {genres.map((genre: { name: string; id: number }) => {
                return <Genre key={genre.id} name={genre.name} />;
              })}
            </m.ul>

            <m.p variants={fadeDown} className={`${paragraph} will-change-transform motion-reduce:transform-none`}>
              <span>
                {overview.length > 280
                  ? `${show ? overview : `${overview.slice(0, 280)}...`}`
                  : overview}
              </span>
              <button
                type="button"
                className={cn(
                  `font-bold ml-1 hover:underline transition-all duration-300`,
                  overview.length > 280 ? "inline-block" : "hidden"
                )}
                onClick={toggleShow}
              >
                {!show ? "show more" : "show less"}
              </button>
            </m.p>

            <Casts casts={credits?.cast || []} />
          </m.div>
        </div>
      </section>

      <Videos videos={videos.results} />

      <Reviews mediaType={String(category)} mediaId={Number(id)} />

      <Section
        title={`Similar ${category === "movie" ? "movies" : "series"}`}
        category={String(category)}
        className={`${maxWidth}`}
        id={Number(id)}
        showSimilarShows
      />
    </>
  );
};

export default Detail;
