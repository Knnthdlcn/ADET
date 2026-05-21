import * as Haptics from "expo-haptics";

import { useSettingsStore } from "@entities/settings";

export function lightImpact() {
  if (!useSettingsStore.getState().hapticFeedback) {
    return;
  }

  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function successImpact() {
  if (!useSettingsStore.getState().hapticFeedback) {
    return;
  }

  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
