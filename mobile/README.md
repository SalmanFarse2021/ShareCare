# ShareCare Mobile App

This is the Flutter mobile application for ShareCare, designed to work with the existing Next.js backend.

## Prerequisites

1.  **Flutter SDK**: [Install Flutter](https://docs.flutter.dev/get-started/install)
2.  **Next.js Backend**: Ensure the web app is running locally or deployed.
    - Local: `npm run dev` at the project root.
    - **Important**: If running on Android Emulator, the backend at `localhost` is accessible via `10.0.2.2`.

## Setup

1.  **Get Dependencies**:
    ```bash
    flutter pub get
    ```

2.  **Configuration**:
    - Update `lib/config/constants.dart` if your backend URL differs.
    - Android: Add API Key to `android/app/src/main/AndroidManifest.xml`
    - iOS: Add API Key to `ios/Runner/AppDelegate.swift` (or `Info.plist`)

## Running the App

- **Android**: `flutter run -d android`
- **iOS**: `flutter run -d ios` (Requires macOS)

## Folder Structure

- `lib/services`: API and Auth logic.
- `lib/screens`: UI Pages (Login, Dashboard, Feed, Map).
- `lib/models`: Data models.
- `lib/widgets`: Reusable components (PostCard).
