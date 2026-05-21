import { Eye, EyeOff, Mic } from "lucide-react-native";
import { type ReactNode, useState } from "react";
import { Alert, Pressable, TextInput, View, type TextInputProps } from "react-native";

import { colors } from "@shared/constants/colors";
import { cn } from "@shared/lib/cn";
import { AppText } from "@shared/ui/typography/app-text";

type Props = TextInputProps & {
  label: string;
  leftIcon: ReactNode;
  showMic?: boolean;
  secureToggle?: boolean;
  onMicPress?: () => void;
};

export function AppInput({
  label,
  leftIcon,
  showMic = true,
  secureToggle = false,
  onMicPress,
  secureTextEntry,
  className,
  ...props
}: Props) {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));

  return (
    <View className={cn("w-full", className)}>
      <AppText variant="label" className="mb-2">
        {label}
      </AppText>
      <View className="min-h-12 flex-row items-center rounded-[9px] border border-[#D8D8DE] bg-[#F1F1F2] px-3">
        <View className="mr-3">{leftIcon}</View>
        <TextInput
          placeholderTextColor="#9A9AA2"
          className="min-w-0 flex-1 p-0 text-[14px] text-ink"
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          {...props}
        />
        {secureToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            className="ml-2 h-9 w-9 items-center justify-center"
            onPress={() => setHidden((value) => !value)}
          >
            {hidden ? (
              <Eye color={colors.primary} size={20} />
            ) : (
              <EyeOff color={colors.primary} size={20} />
            )}
          </Pressable>
        ) : null}
        {showMic ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Voice input for ${label}`}
            className="ml-1 h-9 w-9 items-center justify-center"
            onPress={
              onMicPress ??
              (() =>
                Alert.alert(
                  "Voice input",
                  "Voice dictation is a frontend placeholder in this demo.",
                ))
            }
          >
            <Mic color={colors.primary} size={20} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
