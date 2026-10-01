module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|nativewind|react-native-reanimated|react-native-svg|phosphor-react-native|nanoid)",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^react-native/setup-env$": "<rootDir>/jest.setup.js",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
