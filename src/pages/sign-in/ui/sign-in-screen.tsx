import { router } from "expo-router";
import { Fingerprint, Lock, Mail, CircleHelp } from "lucide-react-native";
import { Alert, Pressable, View } from "react-native";

import { useAuthStore } from "@features/auth";
import { colors } from "@shared/constants/colors";
import { AppCard } from "@shared/ui/card/app-card";
import { AppInput } from "@shared/ui/input/app-input";
import { AppLogo } from "@shared/ui/logo/app-logo";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { FadeInView, Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";

export function SignInScreen() {
  const signIn = useAuthStore((state) => state.signIn);

  function handleSignIn() {
    signIn();
    router.replace("/home");
  }

  return (
    <Screen scroll className="justify-center bg-white px-8 py-8">
      <FadeInView className="items-center">
        <AppLogo subtitle="Sign in to continue" />
      </FadeInView>

      <FadeInView delay={90} className="mt-8">
        <AppCard className="px-7 py-8 shadow-md">
          <AppInput
            label="Email"
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail color={colors.ink} size={19} />}
          />

          <AppInput
            label="Password"
            placeholder="••••••"
            secureTextEntry
            secureToggle
            className="mt-4"
            leftIcon={<Lock color={colors.ink} size={19} />}
          />

          <Pressable
            accessibilityRole="button"
            className="mt-3 self-end"
            onPress={() =>
              Alert.alert(
                "Forgot password",
                "Password recovery will be connected when authentication is ready.",
              )
            }
          >
            <AppText variant="caption" tone="primary">
              Forgot Password?
            </AppText>
          </Pressable>

          <PrimaryButton
            title="Sign In"
            className="mt-5"
            onPress={handleSignIn}
          />

          <Pressable
            accessibilityRole="button"
            className="mt-6 flex-row items-center justify-center gap-2"
            onPress={() =>
              Alert.alert("Biometric login", "Biometric login is ready for native auth integration.")
            }
          >
            <Fingerprint color={colors.signal.green} size={22} />
            <AppText variant="label" tone="success">
              Use Biometric Login
            </AppText>
          </Pressable>

          <View className="mt-6 flex-row justify-center">
            <AppText variant="caption" tone="primary" className="font-bold">
              Don&apos;t have an account?{" "}
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/create-account")}
            >
              <AppText variant="caption" tone="primary" className="font-bold">
                Sign Up
              </AppText>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            className="mt-5 flex-row items-center justify-center gap-1"
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
