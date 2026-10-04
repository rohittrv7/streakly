// Mock for expo-symbols to prevent bundling the 967KB MaterialSymbols font
// when unused by the application.
module.exports = {
  unstable_getMaterialSymbolSourceAsync: async () => null,
};
