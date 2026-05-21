import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Phone, ShieldAlert } from "lucide-react-native";

import { useScanResultStore } from "@entities/scan-result";
import { colors } from "@shared/constants/colors";
import { PageHeader } from "@shared/ui/app-shell/page-header";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { AppCard } from "@shared/ui/card/app-card";
import { Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";

export function EmergencySosScreen() {
  const contacts = useScanResultStore((state) => state.emergencyContacts);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <Screen className="bg-white px-5" scroll>
      <Modal visible={Boolean(selectedContact)} transparent animationType="fade" onRequestClose={() => setSelectedContact(null)}>
        <View className="flex-1 justify-center bg-black/35 px-6">
          <Pressable className="absolute inset-0" onPress={() => setSelectedContact(null)} />
          <AppCard className="rounded-[24px] px-5 py-6">
            <AppText variant="heading">Notify emergency contact?</AppText>
            <AppText tone="danger" className="mt-3 font-bold">
              Frontend demo only. No real emergency call will be made.
            </AppText>
            <AppText tone="muted" className="mt-3">
              This will show a mock success state for the selected contact.
            </AppText>
            <View className="mt-6 flex-row gap-3">
              <PrimaryButton title="Cancel" variant="secondary" fullWidth={false} className="flex-1" onPress={() => setSelectedContact(null)} />
              <PrimaryButton
                title="Notify"
                fullWidth={false}
                className="flex-1"
                onPress={() => {
                  setSelectedContact(null);
                  setSuccess(true);
                }}
              />
            </View>
          </AppCard>
        </View>
      </Modal>

      <PageHeader title="Emergency SOS" subtitle="Frontend demo" />
      <AppCard className="items-center px-6 py-7">
        <ShieldAlert color={colors.primary} size={54} />
        <AppText variant="title" className="mt-5 text-center">Emergency SOS</AppText>
        <AppText tone="danger" className="mt-4 text-center font-bold">
          Frontend demo only. No real emergency call will be made.
        </AppText>
        {success ? (
          <View className="mt-5 w-full rounded-2xl bg-[#E8F7EF] p-4">
            <AppText variant="label" tone="success">Mock notification sent</AppText>
            <AppText tone="muted" className="mt-1">Your selected contact would be notified in the production backend.</AppText>
          </View>
        ) : null}
      </AppCard>

      <View className="mt-4 gap-3">
        {contacts.map((contact) => (
          <AppCard key={contact.id} className="flex-row items-center gap-4">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft">
              <Phone color={colors.primary} size={22} />
            </View>
            <View className="flex-1">
              <AppText variant="label">{contact.name}</AppText>
              <AppText tone="muted" className="mt-1">{contact.relationship} - {contact.phone}</AppText>
            </View>
            <PrimaryButton title="Notify" fullWidth={false} className="w-24" onPress={() => setSelectedContact(contact.id)} />
          </AppCard>
        ))}
      </View>
    </Screen>
  );
}
