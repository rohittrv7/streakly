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

jest.mock("expo-audio", () => {
  const mockPlayer = {
    play: jest.fn(),
    pause: jest.fn(),
    release: jest.fn(),
    loop: false,
    volume: 1,
    playing: false,
    currentTime: 0,
    duration: 5,
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  };
  return {
    createAudioPlayer: jest.fn(() => mockPlayer),
    useAudioPlayer: jest.fn(() => mockPlayer),
    setIsAudioActiveAsync: jest.fn(),
    setAudioModeAsync: jest.fn(),
  };
});

jest.mock("expo-intent-launcher", () => ({
  startActivityAsync: jest.fn(),
  ActivityAction: {},
}));

jest.mock("expo-secure-store", () => {
  const store = new Map();
  return {
    getItemAsync: jest.fn(async (key) => store.get(key) || null),
    setItemAsync: jest.fn(async (key, val) => store.set(key, val)),
    deleteItemAsync: jest.fn(async (key) => store.delete(key)),
    _clear: () => store.clear(),
  };
});
