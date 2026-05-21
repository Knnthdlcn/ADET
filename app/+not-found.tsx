import { router } from "expo-router";
import { FileQuestion } from "lucide-react-native";
import { View } from "react-native";

import { colors } from "@shared/constants/colors";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { Screen } from "@shared/ui/screen/screen";
import { AppText } from "@shared/ui/typography/app-text";

export default function NotFoundScreen() {
  return (
    <Screen className="items-center justify-center px-8">
      <View className="h-20 w-20 items-center justify-center rounded-[24px] bg-primary-soft">
        <FileQuestion color={colors.primary} size={38} />
      </View>
      <AppText variant="title" className="mt-6 text-center">
        Page not found
      </AppText>
      <AppText tone="muted" className="mt-2 text-center">
        This route does not exist in Assistive Vision.
      </AppText>
      <PrimaryButton
        title="Back to Sign In"
        className="mt-8"
        onPress={() => router.replace("/sign-in")}
      />
    </Screen>
  );
}
