import { router } from "expo-router";
import { Box, Camera, CloudUpload, Map, Navigation, RadioTower } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { useScanResultStore } from "@entities/scan-result";
import { speakText } from "@features/text-to-speech";
import { colors } from "@shared/constants/colors";
import { PageHeader } from "@shared/ui/app-shell/page-header";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { AppCard, PressableCard } from "@shared/ui/card/app-card";
import { Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";

const featureCards = [
  { title: "Start Room Capture", body: "Collect mock room images", icon: Camera, href: "/mapping-capture" },
  { title: "Existing Maps", body: "Review trained areas", icon: Map, href: "/mapping" },
  { title: "Offline Model", body: "Prototype local guidance", icon: Box, href: "/mapping" },
  { title: "Training Status", body: "Track mock AI progress", icon: RadioTower, href: "/mapping" },
] as const;

export function MappingScreen() {
  const projects = useScanResultStore((state) => state.mappingProjects);
  const advanceMappingProject = useScanResultStore((state) => state.advanceMappingProject);

  return (
    <Screen className="bg-white px-5 pb-0" scroll withBottomNav>
      <PageHeader title="Indoor AI Mapping" subtitle="Offline guidance" />
      <AppCard>
        <View className="flex-row items-start gap-4">
          <Navigation color={colors.primary} size={28} />
          <View className="flex-1">
            <AppText variant="heading">Train indoor guidance</AppText>
            <AppText tone="muted" className="mt-2">
              Capture rooms now, then simulate upload, indoor model training, and an offline model for future navigation.
            </AppText>
          </View>
        </View>
        <PrimaryButton
          title="Speak mapping instructions"
          className="mt-5"
          onPress={() =>
            speakText(
              "Indoor AI Mapping lets you capture room images, upload them to an AI server, train an indoor model, and later use that model offline. This is a frontend prototype.",
            )
          }
        />
      </AppCard>

      <View className="mt-5 flex-row flex-wrap justify-between gap-y-4">
        {featureCards.map((card) => {
          const Icon = card.icon;
          return (
            <PressableCard
              key={card.title}
              className="w-[48%]"
              accessibilityLabel={card.title}
              onPress={() => router.push(card.href)}
            >
              <Icon color={colors.primary} size={25} />
              <AppText variant="label" className="mt-3">{card.title}</AppText>
              <AppText variant="caption" tone="muted" className="mt-1">{card.body}</AppText>
            </PressableCard>
          );
        })}
      </View>

      <AppText variant="heading" className="mt-6">Mock projects</AppText>
      <View className="mt-3 gap-3">
        {projects.map((project) => (
          <Pressable key={project.id} accessibilityRole="button" onPress={() => advanceMappingProject(project.id)}>
            <AppCard>
              <View className="flex-row items-center justify-between gap-4">
                <View className="flex-1">
                  <AppText variant="label">{project.name}</AppText>
                  <AppText tone="muted" className="mt-1">{project.status}</AppText>
                  <AppText variant="caption" tone="muted" className="mt-1">
                    {project.roomsMapped} rooms mapped - {project.lastUpdated}
                  </AppText>
                </View>
                <CloudUpload color={colors.primary} size={24} />
              </View>
              <View className="mt-4 h-3 overflow-hidden rounded-full bg-primary-soft">
                <View className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
              </View>
              <AppText variant="caption" tone="muted" className="mt-2">
                Tap to advance mock training progress.
              </AppText>
            </AppCard>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
