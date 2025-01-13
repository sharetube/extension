import autoprefixer from "autoprefixer";
import postcssPrefixSelector from "postcss-prefix-selector";
import tailwindcss from "tailwindcss";

export default {
  plugins: [
    tailwindcss,
    autoprefixer,
    postcssPrefixSelector({
      ignoreFiles: [/\/pages/],
      exclude: [":root", "html", "body"],
      prefix: ".sharetube",
    }),
  ],
};
