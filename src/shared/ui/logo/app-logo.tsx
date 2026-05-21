import { Eye } from "lucide-react-native";
import { View } from "react-native";

import { AppText } from "@shared/ui/typography/app-text";

type Props = {
  subtitle: string;
};

export function AppLogo({ subtitle }: Props) {
  return (
    <View className="items-center">
      <View className="h-[60px] w-[60px] items-center justify-center rounded-[4px] bg-primary">
        <View className="h-9 w-12 items-center justify-center rounded-full bg-white">
          <Eye color="#332FDB" size={28} strokeWidth={3} />
        </View>
      </View>
      <AppText variant="title" className="mt-4 text-center">
        Assistive Vision
      </AppText>
      <AppText variant="caption" tone="muted" className="mt-1 text-center">
        {subtitle}
      </AppText>
    </View>
  );
}
