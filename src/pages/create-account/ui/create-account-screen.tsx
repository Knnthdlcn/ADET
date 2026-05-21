import { router } from "expo-router";
import { CircleHelp, Lock, Mail, UserRound } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { useAuthStore } from "@features/auth";
import { colors } from "@shared/constants/colors";
import { AppCard } from "@shared/ui/card/app-card";
import { AppInput } from "@shared/ui/input/app-input";
import { AppLogo } from "@shared/ui/logo/app-logo";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { FadeInView, Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";

export function CreateAccountScreen() {
  const signIn = useAuthStore((state) => state.signIn);

  function handleCreateAccount() {
    signIn();
    router.replace("/home");
  }

  return (
    <Screen scroll className="justify-center bg-white px-8 py-7">
      <FadeInView className="items-center">
        <AppLogo subtitle="Create Account" />
      </FadeInView>

      <FadeInView delay={90} className="mt-8">
        <AppCard className="px-7 py-6 shadow-md">
          <AppInput
            label="Full Name"
            placeholder="Enter your fullname"
            leftIcon={<UserRound color={colors.ink} size={20} />}
          />
          <AppInput
            label="Email"
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            className="mt-4"
            leftIcon={<Mail color={colors.ink} size={19} />}
          />
          <AppInput
            label="Create Password"
            placeholder="••••••"
            secureTextEntry
            secureToggle
            className="mt-4"
            leftIcon={<Lock color={colors.ink} size={19} />}
          />
          <AppInput
            label="Confirm Password"
            placeholder="••••••"
            secureTextEntry
            secureToggle
            className="mt-4"
            leftIcon={<Lock color={colors.ink} size={19} />}
          />

          <PrimaryButton
            title="Sign In"
            className="mt-8"
            onPress={handleCreateAccount}
          />

          <View className="mt-7 flex-row justify-center">
            <AppText variant="caption" tone="primary" className="font-bold">
              Already have an account?{" "}
            </AppText>
            <Pressable accessibilityRole="button" onPress={() => router.replace("/sign-in")}>
              <AppText variant="caption" tone="primary" className="font-bold">
                Sign In
              </AppText>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            className="mt-4 flex-row items-center justify-center gap-1"
            onPress={() => router.push("/help")}
          >
            <CircleHelp color="#6B6B72" size={16} />
            <AppText variant="caption" tone="muted">
              Need Help?
            </AppText>
          </Pressable>
        </AppCard>
      </FadeInView>
    </Screen>
  );
}
