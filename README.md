# Assistive Vision

Assistive Vision is an Expo React Native app that starts at Sign In, supports account creation, shows a polished home dashboard, captures images with the device camera, uploads the image as `multipart/form-data`, displays the returned text, and reads it aloud with `expo-speech`.

The Figma link was not accessible, so the attached screenshots were treated as the UI source of truth. The black “Unmatched Route” screenshot was treated as the bug, not the target UI.

## Project Structure

```text
app/
  _layout.tsx
  index.tsx
  sign-in.tsx
  create-account.tsx
  home.tsx
  camera.tsx
  result.tsx
  +not-found.tsx

src/
  app/
    providers/
      app-provider.tsx
      query-provider.tsx
  pages/
    sign-in/
    create-account/
    home/
    camera/
    result/
  features/
    auth/
    camera-capture/
    image-upload/
    text-to-speech/
  entities/
    scan-result/
  shared/
    api/
    config/
    constants/
    lib/
    types/
    ui/
```

## Install

```bash
npm install
```

The required libraries are already in `package.json`: Expo Router, NativeWind, Zustand, TanStack Query, `expo-camera`, `expo-speech`, Reanimated, Safe Area, Screens, SVG, and Lucide icons.

The gallery picker was added with:

```bash
npx expo install expo-image-picker
```

## Environment

Create `.env` from the example:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Set your API URL:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-api-url.com
```

Endpoint contract:

```http
POST /analyze-image
Content-Type: multipart/form-data
```

Form field:

```text
image
```

Response:

```json
{
  "text": "This is the result from the image."
}
```

## Run

```bash
npm start
```

Or run on a specific platform:

```bash
npm run android
npm run ios
npm run web
```

For a clean cache after routing or NativeWind changes:

```bash
npx expo start -c
```

## Testing on Expo Go

1. Run `npm start`.
2. Open Expo Go on your phone.
3. Scan the QR code.
4. Grant camera permission when prompted.
5. Sign In, tap Scan Now or the Scan tab, capture a photo, then Analyze.

Use a physical device for camera testing. Simulators and emulators can have limited camera behavior.

## Android Emulator

```bash
npm run android
```

If your backend runs locally on your computer, Android emulator usually needs:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
```

## iOS Simulator

Requires macOS:

```bash
npm run ios
```

For a backend running on the same Mac, this usually works:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Physical Device Backend URL

Do not use `localhost` from a phone. Use your computer’s LAN IP:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.100.48:3000
```

Make sure the phone and computer are on the same Wi-Fi network and your firewall allows the backend port.

## Quality Checks

```bash
npm run typecheck
npx expo-doctor
npx expo export --platform web --output-dir dist-web-check
```

You can remove `dist-web-check` after the smoke test.

## Troubleshooting

**Unmatched Route**

- This project fixes the `src/app` collision by setting `expo.extra.router.root` to `app` in `app.json`.
- `app/index.tsx` redirects to `/sign-in`.
- Valid app routes are `/sign-in`, `/create-account`, `/home`, `/camera`, and `/result`.
- Restart with `npx expo start -c` after route changes.

**NativeWind styles not applying**

- Confirm `babel.config.js`, `metro.config.js`, `tailwind.config.js`, and `global.css` exist.
- Restart with `npx expo start -c`.

**Camera permission denied**

- Use the app’s permission screen to open settings.
- Enable Camera permission for Expo Go or the installed app.

**API upload failing**

- Confirm `.env` has a real `EXPO_PUBLIC_API_BASE_URL`.
- Confirm the backend accepts `multipart/form-data` with field name `image`.
- Confirm it returns `{ "text": string }`.

**localhost not working on phone**

- `localhost` means the phone itself. Use your computer’s LAN IP instead.

**expo-speech not speaking**

- Check device volume and silent mode.
- The result screen automatically calls `Speech.speak(response.text)` through `src/features/text-to-speech/lib/speech.ts`.

## Manual Button Checklist

Home:

- Hamburger opens the side menu; each menu item navigates or closes if already active.
- Notification bell opens Notifications and removes the red unread dot.
- Profile avatar opens Profile.
- Server Connected card opens status details and Test Connection shows a success message.
- Scan Now card and camera icon open Camera.
- Voice Message opens the Voice Message screen; Play sample message speaks.
- Gallery opens the image picker; selected image creates a mock result and opens Result.
- View All opens Quick Actions.
- Recent Scans opens History; each history item opens Scan Details.
- Favorites opens Favorites; saved results appear after saving from Result.
- Get Help opens Help.
- Emergency SOS opens confirmation; Continue opens the demo SOS screen.
- Floating microphone opens Voice Assistant; its three commands work.
- Bottom tabs navigate to Home, Camera, History, Settings, and Profile.

Camera:

- Back returns to previous screen or Home.
- Capture uses `expo-camera`, stores the image URI, and shows a preview.
- Retake clears the preview and returns to live camera.
- Analyze uses the real API when configured, otherwise returns mock text, stores it, speaks it, and opens Result.
- Backend warning “How to fix” opens setup instructions.

Result:

- Captured image preview displays when available.
- Play Again speaks the recognized text.
- Scan Again clears the current scan and opens Camera.
- Save to Favorites stores the current result and shows a success modal.
- Share opens the native share sheet.

## Screenshot Assumptions

- Primary color is the purple/blue family around `#332FDB`.
- Auth screens use a white background, centered logo, soft shadow card, gray inputs, mic affordances, and purple CTAs.
- Home uses a white dashboard layout, top menu/notification/profile row, green server card, purple scan card, four quick action cards, floating mic button, and a custom bottom tab bar.
- The profile image was recreated as a lightweight avatar placeholder because no source image asset was provided.
