import { CheckCircle2, Heart, Home, RefreshCcw, Share2, Volume2 } from "lucide-react-native";
import { Image, Modal, View } from "react-native";

import { colors } from "@shared/constants/colors";
import { Button } from "@shared/ui/button";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { Card } from "@shared/ui/card";
import { FadeInView, Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/typography";
import { useResultPage } from "../model/use-result-page";

export function ResultScreen() {
  const resultPage = useResultPage();

  if (!resultPage.resultText) {
    return (
      <Screen className="justify-center">
        <FadeInView>
          <Card className="items-center px-6 py-8">
            <View className="h-16 w-16 items-center justify-center rounded-3xl bg-brand-100">
              <RefreshCcw color={colors.brand.deep} size={30} />
            </View>
            <Text variant="heading" className="mt-5 text-center">
              No result yet
            </Text>
            <Text tone="muted" className="mt-2 text-center">
              Capture and analyze an image to see the returned text here.
            </Text>
            <Button
              title="Start Scan"
              className="mt-6"
              onPress={resultPage.handleScanAgain}
            />
            <Button
              title="Back Home"
              variant="ghost"
              className="mt-2"
              onPress={resultPage.handleGoHome}
            />
          </Card>
        </FadeInView>
      </Screen>
    );
  }

  return (
    <Screen scroll className="justify-between">
      <Modal
        visible={resultPage.favoriteSaved}
        transparent
        animationType="fade"
        onRequestClose={() => resultPage.setFavoriteSaved(false)}
      >
        <View className="flex-1 justify-center bg-black/35 px-6">
          <Card className="items-center rounded-[24px] px-6 py-7">
            <Heart color={colors.primary} size={36} fill={colors.primary} />
            <Text variant="heading" className="mt-4 text-center">
              Saved to Favorites
            </Text>
            <Text tone="muted" className="mt-2 text-center">
              You can find this result in your saved items.
            </Text>
            <PrimaryButton
              title="Done"
              className="mt-6"
              onPress={() => resultPage.setFavoriteSaved(false)}
            />
          </Card>
        </View>
      </Modal>
      <View>
        <FadeInView>
          <View className="items-center pt-4">
            <View className="h-20 w-20 items-center justify-center rounded-[32px] bg-brand-100">
              <CheckCircle2 color={colors.brand.deep} size={38} />
            </View>
            <Text variant="title" className="mt-5 text-center">
              Analysis complete
            </Text>
            <Text tone="muted" className="mt-2 text-center">
              The result is ready and has been read aloud.
            </Text>
          </View>
        </FadeInView>

        <FadeInView delay={120} className="mt-7">
          {resultPage.capturedImageUri ? (
            <Image
              source={{ uri: resultPage.capturedImageUri }}
              className="mb-4 h-52 w-full rounded-[24px]"
              resizeMode="cover"
            />
          ) : null}
          <Card className="px-6 py-6">
            <Text variant="caption" tone="brand">Scene summary</Text>
            <Text className="mt-3 text-[18px] leading-7">{resultPage.latestScan?.summary ?? resultPage.resultText}</Text>
            {resultPage.latestScan?.recognizedText ? (
              <>
                <Text variant="caption" tone="brand" className="mt-5">Recognized text</Text>
                <Text className="mt-2">{resultPage.latestScan.recognizedText}</Text>
              </>
            ) : null}
            {resultPage.latestScan ? (
              <View className="mt-5 rounded-2xl bg-[#F6F6FB] p-4">
                <Text variant="label">Detected objects</Text>
                <Text tone="muted" className="mt-1">{resultPage.latestScan.objects.join(", ") || "No objects detected"}</Text>
                <Text variant="label" className="mt-4">Confidence</Text>
                <Text tone="muted" className="mt-1">{Math.round(resultPage.latestScan.confidence * 100)}%</Text>
                {resultPage.latestScan.warnings.length > 0 ? (
                  <>
                    <Text variant="label" className="mt-4">Warnings</Text>
                    <Text tone="danger" className="mt-1">{resultPage.latestScan.warnings.join(", ")}</Text>
                  </>
                ) : null}
              </View>
            ) : null}
          </Card>
        </FadeInView>
      </View>

      <FadeInView delay={180} className="mt-8 gap-3">
        <Button
          title="Play Again"
          variant="secondary"
          icon={<Volume2 color={colors.ink} size={19} />}
          onPress={resultPage.handlePlayAgain}
        />
        <Button
          title="Save to Favorites"
          variant="secondary"
          icon={<Heart color={colors.ink} size={19} />}
          onPress={resultPage.handleSaveFavorite}
        />
        <Button
          title="Share"
          variant="secondary"
          icon={<Share2 color={colors.ink} size={19} />}
          onPress={resultPage.handleShare}
        />
        <Button
          title="Scan Again"
          icon={<RefreshCcw color="#FFFFFF" size={19} />}
          onPress={resultPage.handleScanAgain}
        />
        <Button
          title="Home"
          variant="ghost"
          icon={<Home color={colors.ink} size={19} />}
          onPress={resultPage.handleGoHome}
        />
      </FadeInView>
    </Screen>
  );
}
