import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  type ScrollViewProps,
} from "react-native";

export interface KeyboardAwareScreenProps extends ScrollViewProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  extraScrollHeight?: number;
  className?: string;
  contentContainerClassName?: string;
  scrollRef?: React.RefObject<ScrollView>;
}

export function KeyboardAwareScreen({
  children,
  footer,
  extraScrollHeight = 24,
  className = "flex-1",
  contentContainerClassName,
  style,
  contentContainerStyle,
  scrollRef: externalScrollRef,
  ...rest
}: KeyboardAwareScreenProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const internalScrollRef = useRef<ScrollView>(null);
  const scrollRef = externalScrollRef || internalScrollRef;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className={className}
      style={style}
    >
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          contentContainerStyle,
          {
            paddingBottom:
              (keyboardHeight > 0 ? keyboardHeight : 24) + extraScrollHeight,
          },
        ]}
        className={contentContainerClassName}
        {...rest}
      >
        {children}
      </ScrollView>
      {footer && <View>{footer}</View>}
    </KeyboardAvoidingView>
  );
}
