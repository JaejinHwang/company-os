/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#f7f4ed",
          surface: "#f7f4ed",
          light: "#eceae4",
        },
        charcoal: {
          DEFAULT: "#1c1c1c",
          muted: "#5f5f5d",
          offwhite: "#fcfbf8",
        },
      },
      fontFamily: {
        sans: [
          '"Camera Plain Variable"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        display: ["3.75rem", { lineHeight: "1.05", letterSpacing: "-1.5px" }],
        section: ["3rem", { lineHeight: "1.0", letterSpacing: "-1.2px" }],
        sub: ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.9px" }],
      },
      borderRadius: {
        pill: "9999px",
        card: "12px",
        container: "16px",
      },
      boxShadow: {
        "inset-dark":
          "rgba(255,255,255,0.2) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px 0px",
        focus: "rgba(0,0,0,0.1) 0px 4px 12px",
      },
      transitionTimingFunction: {
        gentle: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
