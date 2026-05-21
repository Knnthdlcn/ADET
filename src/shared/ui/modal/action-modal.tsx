import { Modal, Pressable, View } from "react-native";

import { PrimaryButton } from "@shared/ui/button/primary-button";
import { AppCard } from "@shared/ui/card/app-card";
import { AppText } from "@shared/ui/typography/app-text";

type Props = {
  visible: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children?: React.ReactNode;
};

export function ActionModal({ visible, title, description, onClose, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/35 px-5 pb-8">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <AppCard className="rounded-[24px] px-5 py-6">
          <AppText variant="heading">{title}</AppText>
          {description ? (
            <AppText tone="muted" className="mt-2">
              {description}
            </AppText>
          ) : null}
          <View className="mt-5">{children}</View>
          <PrimaryButton title="Close" variant="secondary" className="mt-4" onPress={onClose} />
        </AppCard>
      </View>
    </Modal>
  );
}
