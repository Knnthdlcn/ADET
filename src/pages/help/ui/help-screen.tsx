import { AlertCircle, LifeBuoy, MessageCircle, Shield } from "lucide-react-native";
import { Linking, Pressable, View } from "react-native";

import { speakText } from "@features/text-to-speech";
import { colors } from "@shared/constants/colors";
import { PageHeader } from "@shared/ui/app-shell/page-header";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { AppCard } from "@shared/ui/card/app-card";
import { Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";

const items = [
  { title: "FAQ", body: "Find answers about scanning, speech, and saved results.", icon: MessageCircle },
  { title: "Contact support", body: "Email support@example.com for frontend demo support.", icon: LifeBuoy },
  { title: "Accessibility tips", body: "Use voice feedback, large text, and high contrast settings.", icon: Shield },
  { title: "Emergency instructions", body: "Use Emergency SOS only as a demo in this app.", icon: AlertCircle },
];

export function HelpScreen() {
  return (
    <Screen className="bg-white px-5 pb-0" scroll withBottomNav>
      <PageHeader title="Help" subtitle="Support & Assistance" />
      <View className="gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              onPress={() => speakText(`${item.title}. ${item.body}`)}
            >
              <AppCard className="flex-row gap-4">
              <Icon color={colors.primary} size={24} />
              <View className="flex-1">
                <AppText variant="label">{item.title}</AppText>
                <AppText tone="muted" className="mt-1">
                  {item.body}
                </AppText>
              </View>
              </AppCard>
            </Pressable>
          );
        })}
      </View>
      <PrimaryButton
        title="Speak help guide"
        className="mt-5"
        onPress={() =>
          speakText(
            "To scan, open the camera, capture an image, then analyze it. Voice messages record your question and play a demo AI response. Use settings for large text, high contrast, reduced motion, and voice feedback.",
          )
        }
      />
      <PrimaryButton
        title="Contact support"
        variant="secondary"
        className="mt-3"
        onPress={() => Linking.openURL("mailto:support@example.com?subject=Assistive%20Vision%20Support")}
      />
    </Screen>
  );
}
