import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Theme Mode Enum
enum ThemeModePreference {
  light,
  dark,
  system,
}

/// Theme Provider - Manages app theme mode (light/dark/system)
class ThemeProvider with ChangeNotifier {
  static const String _themeModeKey = 'theme_mode';
  
  ThemeModePreference _themeModePreference = ThemeModePreference.system;
  ThemeMode _themeMode = ThemeMode.system;
  
  ThemeProvider() {
    _loadThemePreference();
  }
  
  ThemeModePreference get themeModePreference => _themeModePreference;
  ThemeMode get themeMode => _themeMode;
  
  /// Load theme preference from shared preferences
  Future<void> _loadThemePreference() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedThemeMode = prefs.getString(_themeModeKey);
      
      if (savedThemeMode != null) {
        _themeModePreference = ThemeModePreference.values.firstWhere(
          (e) => e.toString() == savedThemeMode,
          orElse: () => ThemeModePreference.system,
        );
      }
      
      _updateThemeMode();
      notifyListeners();
    } catch (e) {
      // If error, use system default
      _themeModePreference = ThemeModePreference.system;
      _updateThemeMode();
    }
  }
  
  /// Set theme mode preference
  Future<void> setThemeMode(ThemeModePreference preference) async {
    _themeModePreference = preference;
    _updateThemeMode();
    
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_themeModeKey, preference.toString());
    } catch (e) {
      // Handle error silently
    }
    
    notifyListeners();
  }
  
  /// Update ThemeMode based on preference
  void _updateThemeMode() {
    switch (_themeModePreference) {
      case ThemeModePreference.light:
        _themeMode = ThemeMode.light;
        break;
      case ThemeModePreference.dark:
        _themeMode = ThemeMode.dark;
        break;
      case ThemeModePreference.system:
        _themeMode = ThemeMode.system;
        break;
    }
  }
  
  /// Get current brightness
  Brightness getCurrentBrightness(BuildContext context) {
    if (_themeMode == ThemeMode.system) {
      return MediaQuery.of(context).platformBrightness;
    }
    return _themeMode == ThemeMode.light ? Brightness.light : Brightness.dark;
  }
  
  /// Check if dark mode is active
  bool isDarkMode(BuildContext context) {
    return getCurrentBrightness(context) == Brightness.dark;
  }
}

