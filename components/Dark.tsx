import { useEffect } from "react";
import styles from "./Dark.module.css";

export const Dark = Object.assign(
  () => {
    useEffect(() => {
      Dark.init();
    });

    return (
      <button
        className={styles.button}
        title="Toogle Dark mode"
        aria-label="Toggle Dark Mode"
        onClick={() => Dark.toggle()}
      >
        <span></span>
        <span></span>
      </button>
    );
  },
  {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    init: () => {
      if (
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },

    // Whenever the user explicitly chooses light mode
    dark: () => {
      localStorage.theme = "dark";
      document.documentElement.classList.add("dark");
    },

    // Whenever the user explicitly chooses dark mode
    light: () => {
      localStorage.theme = "light";
      document.documentElement.classList.remove("dark");
    },

    // Whenever the user explicitly chooses to respect the OS preference
    reset: () => {
      localStorage.removeItem("theme");
    },

    toggle: () => {
      if (localStorage.theme === "dark") {
        document.documentElement.classList.remove("dark");
        localStorage.theme = "light";
      } else {
        document.documentElement.classList.add("dark");
        localStorage.theme = "dark";
      }
    },
  }
);
