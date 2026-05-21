import { router } from "expo-router";
import { useState } from "react";
import { Camera, CheckCircle2, CloudUpload, Cpu, ImagePlus } from "lucide-react-native";
import { View } from "react-native";

import { speakText } from "@features/text-to-speech";
import { colors } from "@shared/constants/colors";
import { PageHeader } from "@shared/ui/app-shell/page-header";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { AppCard } from "@shared/ui/card/app-card";
import { Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";

const steps = [
  { title: "Capturing room images", icon: ImagePlus },
  { title: "Uploading to AI server", icon: CloudUpload },
  { title: "Training indoor model", icon: Cpu },
  { title: "Offline model ready", icon: CheckCircle2 },
] as const;

export function MappingCaptureScreen() {
  const [activeStep, setActiveStep] = useState(0);

  function advance() {
    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
  }

  return (
    <Screen className="bg-white px-5" scroll>
      <PageHeader title="Room Capture" subtitle="Indoor mapping" />
      <AppCard className="items-center px-6 py-7">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary">
          <Camera color="#FFFFFF" size={46} />
        </View>
        <AppText variant="heading" className="mt-5 text-center">Start Room Capture</AppText>
        <AppText tone="muted" className="mt-2 text-center">
          This mock flow simulates gathering indoor camera data and preparing an offline guidance model.
        </AppText>
        <PrimaryButton
          title="Narrate capture steps"
          className="mt-6"
          onPress={() => speakText("Move slowly around the room. Capture corners, doors, walkways, furniture, and obstacles. The app will simulate upload and model training.")}
        />
      </AppCard>

      <View className="mt-5 gap-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const complete = index <= activeStep;

          return (
            <AppCard key={step.title} className={`flex-row items-center gap-4 ${complete ? "border-primary-soft bg-[#FBFBFF]" : ""}`}>
              <View className={`h-11 w-11 items-center justify-center rounded-2xl ${complete ? "bg-primary" : "bg-[#F0F0F6]"}`}>
                <Icon color={complete ? "#FFFFFF" : colors.muted} size={22} />
              </View>
              <View className="flex-1">
                <AppText variant="label">{step.title}</AppText>
                <AppText tone="muted" className="mt-1">
                  {complete ? "Mock step active or complete." : "Waiting for previous step."}
                </AppText>
              </View>
            </AppCard>
          );
        })}
      </View>

      <PrimaryButton
        title={activeStep === steps.length - 1 ? "View Indoor Maps" : "Advance Mock Progress"}
        className="mt-5"
        onPress={activeStep === steps.length - 1 ? () => router.replace("/mapping") : advance}
      />
    </Screen>
  );
}
