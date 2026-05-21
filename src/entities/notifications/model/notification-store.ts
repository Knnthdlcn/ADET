import { create } from "zustand";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

type NotificationState = {
  unread: boolean;
  notifications: AppNotification[];
  markRead: () => void;
  markAllRead: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  unread: true,
  notifications: [
    {
      id: "notif-1",
      title: "Scan completed",
      body: "Your last scan was processed successfully.",
      createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      read: false,
    },
    {
      id: "notif-2",
      title: "Server connected",
      body: "All systems are operational.",
      createdAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
      read: false,
    },
    {
      id: "notif-3",
      title: "New feature available",
      body: "Voice Assistant can now open help and start scans.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      read: true,
    },
    {
      id: "notif-4",
      title: "Indoor mapping mock ready",
      body: "Try training a mock offline map from the Mapping screen.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      read: false,
    },
  ],
  markRead: () =>
    set((state) => ({
      unread: false,
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),
  markAllRead: () =>
    set((state) => ({
      unread: false,
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),
}));
