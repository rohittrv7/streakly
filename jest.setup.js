require("react-native-gesture-handler/jestSetup");

jest.mock("react-native-worklets", () => ({
  createSerializable: (v) => v,
  isSerializableRef: () => false,
  makeShareable: (v) => v,
  createShareable: (v) => v,
  createSynchronizable: (v) => v,
  isWorkletFunction: () => false,
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  WorkletsModule: {},
  loadUnpackers: jest.fn(),
  init: jest.fn(),
}));

jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (c) => c,
    },
    useSharedValue: (init) => ({ value: init }),
    useAnimatedStyle: (fn) => fn(),
    useAnimatedProps: (fn) => fn(),
    useReducedMotion: () => false,
    withTiming: (to) => to,
    withSpring: (to) => to,
    withRepeat: (to) => to,
    withSequence: (...args) => args[0],
    withDelay: (_, to) => to,
    interpolate: (_val, _input, output) => output[0],
    Easing: {
      out: (f) => f,
      cubic: (t) => t,
    },
    runOnJS: (fn) => fn,
  };
});

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: "Link",
}));
