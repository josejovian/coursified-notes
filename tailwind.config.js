/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontSize: {
      sm: [
        "0.5rem",
        {
          lineHeight: "0.5rem",
        },
      ], // 8
      "md-alt": [
        "0.875rem",
        {
          lineHeight: "0.875rem",
        },
      ],
      base: [
        "1rem",
        {
          lineHeight: "1rem",
        },
      ], // 16
      "lg-alt": [
        "1.25rem",
        {
          lineHeight: "1.25rem",
        },
      ],
      lg: [
        "1.5rem",
        {
          lineHeight: "1.5rem",
        },
      ],
      xl: [
        "2rem",
        {
          lineHeight: "2rem",
        },
      ],
      "2xl": [
        "2.5rem",
        {
          lineHeight: "2.5rem",
        },
      ],
      "3xl": [
        "3rem",
        {
          lineHeight: "3rem",
        },
      ],
      "4xl": [
        "3.5rem",
        {
          lineHeight: "3.5rem",
        },
      ],
      "5xl": [
        "4rem",
        {
          lineHeight: "4rem",
        },
      ],
    },
    extend: {},
  },
  plugins: [],
};
