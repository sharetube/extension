import autoprefixer from "autoprefixer";
import postcssPrefixSelector from "postcss-prefix-selector";
import tailwindcss from "tailwindcss";

export default {
  plugins: [
    tailwindcss,
    autoprefixer,
    postcssPrefixSelector({
      prefix: ".sharetube",
      transform(_, selector, prefixedSelector) {
        if (selector.startsWith(":root")) {
          return selector;
        }
        return prefixedSelector;
      },
    }),
  ],
};
