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
        if (
          selector.startsWith(":root") ||
          selector.startsWith("html") ||
          selector.startsWith("body")
        ) {
          return selector;
        }
        return prefixedSelector;
      },
    }),
  ],
};
