module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      ["module-resolver", {
        root: ["./"],
        alias: {
          "@": ".",
          "@components": "./components",
          "@hooks": "./hooks",
          "@screens": "./screens",
          "@assets": "./assets",
          "@lib": "./lib",
          "@src": "./src"
        },
        extensions: [
          ".js",
          ".jsx",
          ".ts",
          ".tsx",
        ]
      }]
    ]
  };
};