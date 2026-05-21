import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { View } from "react-native";

import { colors } from "@shared/constants/colors";
import { IconButton } from "@shared/ui/icon-button";
import { AppText } from "@shared/ui/typography/app-text";

type Props = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: Props) {
  return (
    <View className="mb-5 flex-row items-center justify-between">
      <IconButton
        icon={<ArrowLeft color={colors.ink} size={21} />}
        label="Go back"
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))}
      />
      <View className="ml-4 flex-1 items-end">
        {subtitle ? (
          <AppText variant="caption" tone="muted">
            {subtitle}
          </AppText>
        ) : null}
        <AppText variant="title" className="text-right">
          {title}
        </AppText>
      </View>
    </View>
  );
}
