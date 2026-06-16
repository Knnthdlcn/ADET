# ADET Assistive Vision

ADET Assistive Vision is a blind-first Expo React Native app for real-time scene assistance.

The app now opens directly to the full-screen camera. A user can tap once to analyze the current view, long press to speak a voice command in a custom development build, double tap to repeat the last spoken response, and swipe down to stop voice or listening. Camera frames are sent to the existing backend AI server, and the returned scene description is spoken aloud with text-to-speech.

This frontend is designed to be:

- Camera-first
- Voice-first
- Gesture-first
- Backend-AI-powered
- Safe in Expo Go fallback mode
- Useful for blind and visually impaired users

## Current Features

- Full-screen camera launches immediately from `app/index.tsx`.
- Single tap captures the camera frame and sends it to the backend AI.
- Backend AI result is parsed, displayed in the HUD, saved to scan history, and spoken aloud.
- Text-to-speech uses `expo-speech` with a calm English voice preference.
- Long press starts voice recognition in a custom Expo development build.
- Expo Go stays safe and shows "Voice recognition requires the development build."
- Double tap repeats the last spoken response.
- Swipe down stops speech and aborts voice recognition.
- Swipe left or right changes assistive mode.
- Swipe up increases detail level.
- HUD shows camera state, voice state, backend state, current mode, recognized command, and AI result.
- Haptic feedback is used for listening, success, warnings, and errors.
- Backend offline handling keeps the camera open and speaks a clear error.
- Emergency command uses a safe frontend placeholder and does not fake emergency calls.

## Voice Commands

Voice recognition is implemented with `expo-speech-recognition`.

Supported command examples:

- "What is in front of me?"
- "Describe what you see."
- "Describe the room."
- "Analyze this."
- "What is around me?"
- "What is on my left?"
- "What is on my right?"
- "Is the path clear?"
- "Are there obstacles?"
- "Is there a person nearby?"
- "Read this."
- "Read the text."
- "What does this say?"
- "Read the sign."
- "Read the document."
- "Guide me."
- "Where is the door?"
- "Find the door."
- "Where are the stairs?"
- "Find the stairs."
- "Help me walk."
- "Tell me if the path is blocked."
- "Find my phone."
- "Find my keys."
- "Find a chair."
- "Find the table."
- "Repeat."
- "Say that again."
- "Stop."
- "Be quiet."
- "Increase detail."
- "Decrease detail."
- "Standard detail."
- "Detailed mode."
- "Short answer."
- "Help."
- "What can I say?"
- "Emergency."
- "Emergency help."
- "Call for help."

The frontend maps commands into intents such as:

- `describe_scene`
- `read_text`
- `check_path`
- `find_object`
- `repeat`
- `stop`
- `increase_detail`
- `decrease_detail`
- `set_detail`
- `help`
- `emergency`
- `start_continuous`
- `stop_continuous`

Visual commands capture the current camera frame and call the existing backend image analysis endpoint. Non-visual commands, such as repeat, stop, help, detail level, and emergency placeholder, run locally in the frontend.

## Backend AI

The frontend expects the existing ADET backend server to be running separately.

Backend repository:

```text
https://github.com/Dhombus/ADET-server.git
```

The current frontend sends image uploads to:

```http
POST /api/detect/upload
Content-Type: multipart/form-data
```

Form field:

```text
image
```

The backend streams or returns text describing the image. The frontend accepts common response keys such as `text`, `description`, `analysis`, `result`, `summary`, `caption`, `ocr`, `recognizedText`, `response`, or streamed `{ "token": "..." }` lines.

The backend is not modified by this frontend project.

## Backend Setup

Install Ollama:

```text
https://ollama.com
```

On Windows, if `ollama` is not in your terminal path, use the installed executable directly:

```powershell
& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" --version
```

Download the model used by the backend:

```powershell
& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" pull llava:7b
```

Clone and run the backend server:

```powershell
cd "$env:USERPROFILE\Downloads"
git clone https://github.com/Dhombus/ADET-server.git
cd ADET-server
npm install
node server.js
```

The backend should run at:

```text
http://localhost:3000
http://YOUR_COMPUTER_IPV4:3000
```

For a phone on the same Wi-Fi network, use your computer IPv4 address, not `localhost`.

Find your IPv4 address on Windows:

```powershell
ipconfig
```

Example:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.100.48:3000
```

## Frontend Requirements

- Node.js compatible with Expo SDK 54. Expo SDK 54 targets Node 20.19.x or newer.
- npm
- Expo CLI through `npx expo`
- Android Studio or an Android device for local Android development builds
- Xcode on macOS for iOS local development builds
- A running ADET backend server for real AI analysis

## Install Frontend

```powershell
cd "C:\Users\Kenneth\Downloads\ADET CODING"
npm install
```

## Environment

Create `.env` from the example:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

Set the backend URL:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_COMPUTER_IPV4:3000
```

Examples:

```env
# Physical Android/iPhone on same Wi-Fi
EXPO_PUBLIC_API_BASE_URL=http://192.168.100.48:3000

# Android emulator
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000

# iOS simulator on the same Mac as the backend
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

Restart Expo after changing `.env`.

## Run With Expo Go

Expo Go can run the camera, backend analysis, HUD, gestures, and text-to-speech.

```powershell
npm start
```

Then open Expo Go and scan the QR code.

Important: Expo Go does not include the native `expo-speech-recognition` module. In Expo Go, long press will safely say:

```text
Voice recognition requires the development build.
```

This is expected. Use a custom development build for real voice commands.

## Run With Custom Development Build

Real voice recognition requires a custom Expo development build because `expo-speech-recognition` is a native module.

This project includes:

- `expo-dev-client`
- `expo-speech-recognition`
- Microphone permission
- iOS speech recognition permission
- Android `RECORD_AUDIO` permission
- Safe Expo Go fallback

### Android Local Development Build

Connect an Android phone with USB debugging enabled or start an Android emulator.

Then run:

```powershell
npm run android:dev
```

After the development build is installed, start the dev-client Metro server:

```powershell
npm run start:dev
```

Open the installed ADET development build on the phone or emulator and connect it to the Metro server.

### iOS Local Development Build

Requires macOS and Xcode:

```bash
npm run ios:dev
npm run start:dev
```

### EAS Development Build

You can also create a development build with EAS:

```powershell
npm install --global eas-cli
eas login
eas build --platform android --profile development
```

For iOS device builds, an Apple Developer account is required.

## Available Scripts

```powershell
npm start          # Expo start
npm run start:dev # Expo dev-client start
npm run android   # Open in Expo Go / Android target
npm run android:dev
npm run ios       # Open in Expo Go / iOS target
npm run ios:dev
npm run web
npm run typecheck
```

## Gesture Controls

- Single tap: analyze current camera view.
- Long press: start voice command listening in a dev build.
- Double tap: repeat last spoken response.
- Swipe down: stop listening or speech.
- Swipe left: previous assistive mode.
- Swipe right: next assistive mode.
- Swipe up: increase detail level.
- Two-finger hold: toggle continuous listening mode.
- Three-finger hold: replay the current message.

## Assistive Modes

- Scene: general environment description.
- Text: reading signs, labels, papers, documents, or visible screen text.
- Object: object finder and object identification.
- Guide: path safety, obstacles, doors, stairs, and navigation cues.

## Accessibility Notes

The app is designed around blind-first interaction:

- The camera opens immediately.
- Voice feedback is more important than visual UI.
- The HUD is concise and avoids crowding.
- Gestures do not require small buttons.
- Long press voice activation is the primary hands-free control.
- Unsupported voice runtimes do not crash.
- Backend failures keep the camera open.
- Emergency help is a placeholder only and tells the user to use the phone emergency shortcut.

## Project Structure

```text
app/
  _layout.tsx
  index.tsx
  camera.tsx
  result.tsx
  server-status.tsx
  ...

src/
  app/
    providers/
  entities/
    scan-result/
    settings/
  features/
    camera-capture/
    image-upload/
    text-to-speech/
    voice-recognition/
  pages/
    camera/
    home/
    result/
    server-status/
    ...
  shared/
    api/
    config/
    lib/
    ui/
```

## Key Frontend Files

- `app/index.tsx`: redirects directly to `/camera`.
- `src/pages/camera/ui/camera-page.tsx`: full-screen camera, HUD, and gesture controls.
- `src/pages/camera/model/use-camera-page.ts`: camera analysis, voice command flow, TTS, HUD state, backend offline handling.
- `src/pages/camera/model/assistant-command.ts`: natural language voice command parser.
- `src/pages/camera/model/vision-analysis-service.ts`: connects captured frames to backend AI.
- `src/features/voice-recognition/lib/voice-recognition.ts`: native speech recognition wrapper and Expo Go fallback.
- `src/features/text-to-speech/lib/speech.ts`: spoken output.
- `src/shared/api/client.ts`: backend request and streaming response parsing.
- `src/shared/config/env.ts`: backend URL configuration and development fallback.

## Validation

Run these checks before pushing changes:

```powershell
npm run typecheck
npx expo install --check
npx expo config --type public
npx expo-doctor
```

Current validation status:

```text
npm run typecheck: passed
npx expo install --check: passed
npx expo-doctor: 18/18 checks passed
```

## Testing Checklist

Backend:

- Start Ollama.
- Confirm `llava:7b` is installed with `ollama list`.
- Start backend with `node server.js`.
- Confirm `http://localhost:3000` opens.
- Confirm phone and computer are on the same Wi-Fi.

Frontend in Expo Go:

- Run `npm start`.
- Open app in Expo Go.
- Camera opens immediately.
- Single tap analyzes using backend AI.
- AI result is spoken aloud.
- Long press says voice requires development build.
- App does not crash.

Frontend in custom development build:

- Run `npm run android:dev` or `npm run ios:dev`.
- Run `npm run start:dev`.
- Open installed development build.
- Long press and say "Describe the room."
- Confirm the HUD shows the recognized command.
- Confirm the camera captures and sends the frame to backend AI.
- Confirm the AI result is spoken.
- Say "Read this."
- Say "Repeat."
- Say "Stop."
- Say "Increase detail."
- Turn backend off and confirm the app speaks the backend unavailable message.

## Troubleshooting

### Voice requires development build

This means the app is running in Expo Go or another runtime without the speech recognition native module.

Use:

```powershell
npm run android:dev
npm run start:dev
```

### Voice recognition does not start in dev build

- Confirm microphone permission is allowed.
- Confirm speech recognition permission is allowed on iOS.
- Rebuild the development client after changing native config.
- On Android, make sure Google speech recognition is available on the device.

### Backend analysis is unavailable

- Make sure the backend server is running on port `3000`.
- Make sure `.env` points to the correct IPv4 address.
- Make sure the phone and computer are on the same Wi-Fi.
- Make sure Windows Firewall allows inbound access to port `3000`.

### Phone cannot use localhost

`localhost` on a phone means the phone itself. Use the computer IPv4 address:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_COMPUTER_IPV4:3000
```

### First scan is slow

The first backend scan can be slow because Ollama has to load `llava:7b` into memory.

### Native module crash after adding speech recognition

Rebuild the development client. Native modules cannot be added to an already-installed Expo Go runtime.

## Notes

- Do not commit `.env`.
- Do not commit `node_modules`.
- Generated native folders `android/` and `ios/` are ignored and can be regenerated.
- The backend AI prompt and backend routes live outside this frontend repo and were not modified.
