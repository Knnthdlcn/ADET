import "../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppProvider } from "@app/providers/app-provider";

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <AppProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade_from_bottom",
            contentStyle: { backgroundColor: "#FFFFFF" },
          }}
        />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
