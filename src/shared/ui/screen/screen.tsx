import { type ReactNode } from "react";
import { StatusBar } from "expo-status-bar";
import { ScrollView, View, type ViewProps } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@shared/lib/cn";
import { BottomNavigation } from "@shared/ui/app-shell/bottom-navigation";

type Props = ViewProps & {
  scroll?: boolean;
  withBottomNav?: boolean;
  floatingAction?: ReactNode;
};

export function Screen({
  children,
  className,
  scroll = false,
  withBottomNav = false,
  floatingAction,
  ...props
}: Props) {
  const insets = useSafeAreaInsets();
  const navSpace = withBottomNav ? 132 + insets.bottom : 28;

  const content = (
    <View
      className={cn(
        scroll ? "px-5 pt-3" : "flex-1 px-5 pb-6 pt-3",
        withBottomNav && !scroll && "pb-32",
        className,
      )}
      {...props}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      {scroll ? (
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: navSpace }}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}

      {floatingAction}

      {withBottomNav ? (
        <View
          pointerEvents="box-none"
          className="absolute inset-x-0"
          style={{ bottom: Math.max(insets.bottom - 8, 0) }}
        >
          <BottomNavigation />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
