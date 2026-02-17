# OASYS360 Mobile Application

Flutter mobile application for OASYS360 Enterprise Financial Management Platform.

## 📱 Overview

This is a Flutter cross-platform mobile application (iOS and Android) that provides a mobile interface for the OASYS360 platform. All UI/UX designs were created using Google Stitch and converted to Flutter widgets.

## ✨ Features

- **Theme Support**: Light, Dark, and System theme modes
- **Enterprise Design**: Clean, professional UI following Material Design 3
- **Responsive**: Optimized for mobile devices
- **Cross-Platform**: iOS and Android support

## 🎨 Theme System

The app includes a comprehensive theme system that supports:

- **Light Mode**: Clean, bright interface
- **Dark Mode**: Dark interface for low-light environments
- **System Mode**: Automatically follows device theme setting

Theme preference is persisted using `shared_preferences` and can be changed from the Settings screen.

### Theme Colors

- **Primary**: `#135BEC` (Blue)
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Yellow/Orange)
- **Error**: `#EF4444` (Red)

See `lib/core/theme/app_theme.dart` for complete color definitions.

## 📁 Project Structure

```
lib/
├── core/
│   └── theme/
│       ├── app_theme.dart          # Theme definitions
│       └── theme_provider.dart     # Theme state management
├── screens/
│   ├── dashboard/                  # Dashboard screens
│   ├── expenses/                   # Expense tracking
│   ├── invoices/                   # Invoice management
│   ├── approvals/                  # Approval workflows
│   ├── settings/                   # App settings
│   ├── notifications/              # Notifications
│   ├── offline/                    # Offline mode
│   ├── accounting/                 # Accounting features
│   ├── banking/                    # Banking features
│   ├── inventory/                  # Inventory management
│   ├── sales/                      # Sales management
│   └── reports/                    # Reports
├── widgets/
│   └── common/
│       └── material_symbol_icon.dart  # Icon helper
└── main.dart                       # App entry point
```

## 🚀 Getting Started

### Prerequisites

- Flutter SDK (3.6.2 or higher)
- Dart SDK (3.6.2 or higher)
- Android Studio / Xcode (for mobile development)

### Installation

1. **Install dependencies:**
   ```bash
   flutter pub get
   ```

2. **Run the app:**
   ```bash
   flutter run
   ```

### Development

1. **Convert HTML to Flutter:**
   - HTML files are in `stitch_transactions/`
   - Use the conversion guide: `lib/utils/html_to_flutter_converter.md`
   - Reference completed screens for patterns

2. **Test theme modes:**
   - Light mode: Change device to light theme
   - Dark mode: Change device to dark theme
   - System mode: Enable in Settings screen

## 📊 Conversion Status

See `CONVERSION_STATUS.md` for detailed conversion progress.

### Completed Screens (4/25)
- ✅ Dashboard Screen
- ✅ Expense Tracking Screen
- ✅ Settings Screen
- ✅ Notifications Screen

### Remaining Screens (21)
- See `CONVERSION_STATUS.md` for full list

## 📚 Documentation

- **Conversion Guide**: `lib/utils/html_to_flutter_converter.md`
- **Conversion Status**: `CONVERSION_STATUS.md`
- **Google Stitch Prompts**: `../STITCH_PROMPTS.md`

## 🛠️ Dependencies

Key dependencies:

- `provider` - State management
- `shared_preferences` - Theme persistence
- `google_fonts` - Typography (Manrope font)
- `intl` - Internationalization
- `http` / `dio` - API communication

See `pubspec.yaml` for complete list.

## 🎯 Next Steps

1. **Complete Screen Conversions**: Convert remaining 21 HTML files to Flutter
2. **Navigation**: Set up navigation between screens
3. **API Integration**: Connect to Django REST APIs
4. **State Management**: Implement proper data state management
5. **Testing**: Add unit and widget tests
6. **Optimization**: Performance optimization and animations

## 📝 Notes

- All screens should use `ThemeProvider` for theme access
- Colors should come from `AppTheme` constants
- Use Material Icons or `MaterialSymbolIcon` widget for icons
- Ensure touch targets are at least 44x44 points
- Follow Material Design 3 guidelines
- Test accessibility features

## 🤝 Contributing

When converting HTML to Flutter:

1. Follow the conversion guide
2. Test all three theme modes (light/dark/system)
3. Ensure proper spacing and alignment
4. Use semantic widgets for accessibility
5. Add comments for complex layouts

## 📄 License

Proprietary - OASYS360 Platform

---

*Last Updated: December 2024*
