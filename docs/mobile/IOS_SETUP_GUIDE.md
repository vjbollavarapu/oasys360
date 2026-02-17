# iOS Simulator Setup Guide

## Problem
Xcode 26.2 uses iOS SDK 26.2, which requires iOS 26.2 runtime to be installed. The runtime is currently missing, causing build failures.

## Solution: Install iOS 26.2 Runtime

### Step 1: Open Xcode
```bash
cd apps/mobile
open ios/Runner.xcworkspace
```

### Step 2: Install iOS 26.2 Runtime
1. In Xcode, go to **Xcode > Settings** (or press `⌘ + ,`)
2. Click the **Components** tab (or "Platforms" in some versions)
3. Find **"iOS 26.2 Simulator"** in the list
4. Click the **Download** button (cloud icon ☁️) next to it
5. Wait for the download to complete (this may take 5-15 minutes depending on your internet speed)
6. **Important**: Keep Xcode open during the download

### Step 3: Verify Installation
After download completes, verify the runtime is installed:
```bash
xcrun simctl runtime list
```
You should see `iOS 26.2` in the list with status `(Installed)` or `(Ready)`.

### Step 4: Run the App
Once the runtime is installed, run:
```bash
cd apps/mobile
flutter run
```
Or specify the device:
```bash
flutter run -d "iPhone 16 Pro Max"
```

## Current Status

✅ **App Code**: All 26 screens converted and compiling successfully  
✅ **Flutter Setup**: Configured correctly  
✅ **Xcode**: Version 26.2 installed  
❌ **iOS 26.2 Runtime**: **NOT INSTALLED** (This is what's blocking you)

## Available Runtimes (Currently Installed)
- iOS 26.0 ✅
- iOS 18.6 ✅
- iOS 18.4 ✅
- iOS 18.2 ✅
- iOS 18.1 ✅
- iOS 26.2 ❌ (Required for Xcode 26.2)

## Alternative Solutions (If iOS 26.2 is not available)

### Option 1: Use Older Xcode Version
If iOS 26.2 runtime is not available for download, you may need to:
- Install an older Xcode version that matches your available runtimes
- Or wait for Apple to release iOS 26.2 runtime

### Option 2: Test on Chrome (Current Workaround)
The app works perfectly on Chrome:
```bash
cd apps/mobile
flutter run -d chrome
```
This allows you to test all 26 screens while waiting for iOS runtime.

### Option 3: Use Physical iOS Device
If you have a physical iPhone/iPad:
```bash
# Connect device via USB
flutter devices  # Should show your device
flutter run -d <device-id>
```

## Troubleshooting

### If iOS 26.2 is not in Components list:
- Make sure Xcode is fully updated
- Check Apple Developer website for iOS 26.2 availability
- Try restarting Xcode

### If download fails:
- Check your internet connection
- Ensure you have enough disk space (iOS runtime is ~10-15 GB)
- Try restarting Xcode and retry download

### If runtime installs but still doesn't work:
```bash
# Clean Flutter build
cd apps/mobile
flutter clean
flutter pub get
cd ios
pod install
cd ..
flutter run
```

## Next Steps After Installation

1. ✅ Install iOS 26.2 runtime (follow steps above)
2. ✅ Run `flutter run` to test on simulator
3. ✅ Test all 26 screens with theme switching
4. ✅ Begin API integration (see `MOBILE_INTEGRATION_CHECKLIST.md`)

---

**Note**: This is a one-time setup. Once iOS 26.2 runtime is installed, you'll be able to run the app on iOS simulator without any issues.

