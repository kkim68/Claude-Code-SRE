import React, { useCallback } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";

import SidebarNavItem from "./SidebarNavItem";
import ThemeOption from "./SidebarThemeOption";
import Logo from "../Logo";
import Overlay from "../Overlay";

import { useGlobalContext } from "@/context/globalContext";
import { useTheme } from "@/context/themeContext";
import { useAuth } from "@/context/authContext";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useMotion } from "@/hooks/useMotion";
import { navLinks, themeOptions } from "@/constants";
import { sideBarHeading } from "@/styles";
import { INavLink } from "@/types";
import { cn } from "@/utils/helper";

const SideBar: React.FC = () => {
  const { showSidebar, setShowSidebar } = useGlobalContext();
  const { theme } = useTheme();
  const { user, isAuthenticated, signout } = useAuth();
  const { slideIn } = useMotion();

  const closeSideBar = useCallback(() => {
    setShowSidebar(false);
  }, [setShowSidebar]);

  const { ref } = useOnClickOutside({
    action: closeSideBar,
    enable: showSidebar
  });

  return (
    <AnimatePresence>
      {showSidebar && (
        <Overlay>
          <m.nav
            variants={slideIn("right", "tween", 0, 0.3)}
            initial="hidden"
            animate="show"
            exit="hidden"
            ref={ref}
            className={cn(
              `fixed top-0 right-0 sm:w-[40%] xs:w-[220px] w-[195px] h-full z-[25] overflow-y-auto shadow-md md:hidden p-4 pb-0 dark:text-gray-200 text-gray-600`,
              theme === "Dark" ? "dark-glass" : "light-glass"
            )}
          >
            <div className="flex items-center justify-center  ">
              <Logo />
            </div>

            <div className="p-4 sm:pt-8  xs:pt-6 pt-[22px] h-full flex flex-col">
              <h3 className={sideBarHeading}>Menu</h3>
              <ul className="flex flex-col sm:gap-2 xs:gap-[6px] gap-1 capitalize xs:text-[14px] text-[13.5px] font-medium">
                {navLinks.map((link: INavLink) => {
                  return (
                    <SidebarNavItem
                      link={link}
                      closeSideBar={closeSideBar}
                      key={link.title.replaceAll(" ", "")}
                    />
                  );
                })}
              </ul>

              <h3 className={cn(`mt-4 `, sideBarHeading)}>Account</h3>
              <div className="flex flex-col sm:gap-2 xs:gap-[6px] gap-1 xs:text-[14px] text-[13.5px] font-medium mb-2">
                {isAuthenticated ? (
                  <>
                    <span className="flex items-center gap-2 py-1 px-[10px] dark:text-gray-200 text-gray-600">
                      <FiUser />
                      {user?.username}
                    </span>
                    <button
                      onClick={() => {
                        signout();
                        closeSideBar();
                      }}
                      className="text-left py-1 px-[10px] text-red-500 hover:text-red-400 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/signin"
                    onClick={closeSideBar}
                    className="py-1 px-[10px] dark:hover:text-primary hover:text-black transition-all duration-300"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              <h3 className={cn(`mt-4 `, sideBarHeading)}>Theme</h3>
              <ul className="flex flex-col sm:gap-2 xs:gap-[4px] gap-[2px] capitalize text-[14.75px] font-medium">
                {themeOptions.map((theme) => {
                  return <ThemeOption theme={theme} key={theme.title} />;
                })}
              </ul>

              <p className="xs:text-[12px] text-[11.75px] mt-auto sm:mb-6 mb-[20px] text-center font-nunito dark:text-gray-200">
                &copy; 2023 by tMovies. All right reserved.
              </p>
            </div>
          </m.nav>
        </Overlay>
      )}{" "}
    </AnimatePresence>
  );
};

export default SideBar;
