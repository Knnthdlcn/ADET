import { Bell } from "lucide-react-native";
import { View } from "react-native";

import { useNotificationStore } from "@entities/notifications";
import { colors } from "@shared/constants/colors";
import { PageHeader } from "@shared/ui/app-shell/page-header";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { AppCard } from "@shared/ui/card/app-card";
import { Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";
import { formatDateTime } from "@shared/lib/format-date";

export function NotificationsScreen() {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAllRead = useNotificationStore((state) => state.markAllRead);

  return (
    <Screen className="bg-white px-5" scroll>
      <PageHeader title="Notifications" subtitle="Updates" />
      <PrimaryButton title="Mark all as read" variant="secondary" className="mb-4" onPress={markAllRead} />
      <View className="gap-3">
        {notifications.map((notification) => (
          <AppCard key={notification.id} className="flex-row gap-4">
            <View>
              <Bell color={colors.primary} size={24} />
              {!notification.read ? <View className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#E02020]" /> : null}
            </View>
            <View className="flex-1">
              <AppText variant="label">{notification.title}</AppText>
              <AppText tone="muted" className="mt-1">
                {notification.body}
              </AppText>
              <AppText variant="caption" tone="muted" className="mt-2">
                {formatDateTime(notification.createdAt)}
              </AppText>
            </View>
          </AppCard>
        ))}
      </View>
    </Screen>
  );
}
