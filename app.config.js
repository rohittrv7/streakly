const appJson = require("./app.json");

module.exports = ({ config }) => {
  const baseConfig = config || appJson.expo;

  // Controlled by STREAKLY_ABIS environment variable
  // Default: ["arm64-v8a", "armeabi-v7a"]
  // Smallest personal build: STREAKLY_ABIS=arm64-v8a
  // Emulator: STREAKLY_ABIS=x86_64
  const architectures = process.env.STREAKLY_ABIS
    ? process.env.STREAKLY_ABIS.split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : ["arm64-v8a", "armeabi-v7a"];

  const buildPropertiesPlugin = [
    "expo-build-properties",
    {
      android: {
        buildArchs: architectures,
        reactNativeArchitectures: architectures,
        enableProguardInReleaseBuilds: true,
        enableShrinkResourcesInReleaseBuilds: true,
      },
    },
  ];

  const existingPlugins = (baseConfig.plugins || []).filter(
    (p) =>
      !(
        p === "expo-build-properties" ||
        (Array.isArray(p) && p[0] === "expo-build-properties")
      )
  );

  return {
    ...baseConfig,
    extra: {
      ...(baseConfig.extra || {}),
      youtubeApiKey: process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || "",
    },
    plugins: [...existingPlugins, buildPropertiesPlugin],
  };
};
