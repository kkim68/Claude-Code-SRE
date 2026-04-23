import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsBookmarkXFill } from "react-icons/bs";

import Image from "@/common/Image";
import { Loader } from "@/common";
import { useAuth } from "@/context/authContext";
import { useWatchlistAll } from "@/hooks/useWatchlist";
import { maxWidth, mainHeading } from "@/styles";
import { cn } from "@/utils/helper";

const Watchlist = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { items, loading, remove } = useWatchlistAll();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/signin");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || loading) return <Loader />;

  return (
    <section className="min-h-screen dark:bg-[#191624] bg-white pt-28 pb-12">
      <div className={maxWidth}>
        <h1
          className={cn(
            mainHeading,
            "mb-8 sm:max-w-none xs:max-w-none max-w-none"
          )}
        >
          My Watchlist
        </h1>

        {items.length === 0 ? (
          <p className="dark:text-gray-400 text-gray-600 text-center mt-20">
            Your watchlist is empty. Browse{" "}
            <Link to="/movie" className="text-red-500 hover:text-red-400">
              movies
            </Link>{" "}
            or{" "}
            <Link to="/tv" className="text-red-500 hover:text-red-400">
              TV shows
            </Link>{" "}
            to add some.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col items-center gap-2">
                <div className="relative group">
                  <Link to={`/${item.media_type}/${item.media_id}`}>
                    <div className="dark:bg-[#1f1f1f] bg-[#f5f5f5] rounded-lg w-[170px] xs:h-[250px] h-[216px] overflow-hidden">
                      <Image
                        height={250}
                        width={170}
                        src={`https://image.tmdb.org/t/p/original/${item.poster_path}`}
                        alt={item.title}
                        className="object-cover rounded-lg drop-shadow-md shadow-md"
                        effect="zoomIn"
                      />
                    </div>
                  </Link>
                  <button
                    onClick={() => remove(item.id)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    title="Remove from watchlist"
                  >
                    <BsBookmarkXFill className="text-sm" />
                  </button>
                </div>
                <h4 className="dark:text-gray-300 text-center text-sm font-medium max-w-[170px]">
                  {item.title}
                </h4>
                <span className="text-xs dark:text-gray-500 text-gray-400 uppercase">
                  {item.media_type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Watchlist;
