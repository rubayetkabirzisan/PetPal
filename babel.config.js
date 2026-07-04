module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@components": "./src/components",
            "@hooks": "./src/hooks",
            "@screens": "./src/screens",
            "@assets": "./assets",
            "@lib": "./src/lib",
            "@src": "./src",
          },
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      ],
      "react-native-reanimated/plugin", // MUST be last
    ],
  };
};
