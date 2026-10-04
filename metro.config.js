const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push("wasm");

const mockSymbols = path.resolve(__dirname, "src/mocks/expo-symbols.js");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "expo-symbols") {
    return {
      filePath: mockSymbols,
      type: "sourceFile",
    };
  }
  if (moduleName === "phosphor-react-native") {
    if (
      context.originModulePath &&
      context.originModulePath.includes("phosphor-react-native")
    ) {
      return context.resolveRequest(
        context,
        "phosphor-react-native/src/lib/index",
        platform
      );
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
