import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// App Theme Configuration
/// Supports Light, Dark, and System modes
class AppTheme {
  // Primary Colors
  static const Color primaryColor = Color(0xFF135BEC);
  static const Color primaryLight = Color(0xFF4A90E2);
  
  // Background Colors
  static const Color backgroundLight = Color(0xFFF6F6F8);
  static const Color backgroundDark = Color(0xFF101622);
  
  // Surface Colors
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceDark = Color(0xFF1A1D24);
  static const Color surfaceDarkAlt = Color(0xFF1C2433);
  
  // Text Colors
  static const Color textLight = Color(0xFF111827);
  static const Color textDark = Color(0xFFF9FAFB);
  static const Color textSecondaryLight = Color(0xFF6B7280);
  static const Color textSecondaryDark = Color(0xFF94A3B8);
  static const Color textMutedLight = Color(0xFF9CA3AF);
  static const Color textMutedDark = Color(0xFF64748B);
  
  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
  
  // Border Colors
  static const Color borderLight = Color(0xFFE5E7EB);
  static const Color borderDark = Color(0xFF374151);
  
  /// Light Theme
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: backgroundLight,
      colorScheme: ColorScheme.light(
        primary: primaryColor,
        secondary: const Color(0xFF00C8B3),
        surface: surfaceLight,
        error: error,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: textLight,
        onError: Colors.white,
      ),
      
      // AppBar Theme
      appBarTheme: const AppBarTheme(
        elevation: 0,
        centerTitle: false,
        backgroundColor: Colors.transparent,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        iconTheme: IconThemeData(color: textLight),
        titleTextStyle: TextStyle(
          color: textLight,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          fontFamily: 'Manrope',
        ),
      ),
      
      // Card Theme
      cardTheme: CardTheme(
        color: surfaceLight,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: borderLight.withValues(alpha: 0.1),
            width: 1,
          ),
        ),
        shadowColor: Colors.black.withValues(alpha: 0.05),
      ),
      
      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceLight,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      
      // Button Themes
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(999), // Fully rounded (pill)
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            fontFamily: 'Manrope',
          ),
        ),
      ),
      
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryColor,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          side: const BorderSide(color: primaryColor),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(999),
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            fontFamily: 'Manrope',
          ),
        ),
      ),
      
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryColor,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            fontFamily: 'Manrope',
          ),
        ),
      ),
      
      // Floating Action Button Theme
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        elevation: 4,
      ),
      
      // Text Theme
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: textLight,
          fontFamily: 'Manrope',
        ),
        displayMedium: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: textLight,
          fontFamily: 'Manrope',
        ),
        displaySmall: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: textLight,
          fontFamily: 'Manrope',
        ),
        headlineLarge: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: textLight,
          fontFamily: 'Manrope',
        ),
        headlineMedium: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: textLight,
          fontFamily: 'Manrope',
        ),
        headlineSmall: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: textLight,
          fontFamily: 'Manrope',
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.normal,
          color: textLight,
          fontFamily: 'Manrope',
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.normal,
          color: textLight,
          fontFamily: 'Manrope',
        ),
        bodySmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.normal,
          color: textSecondaryLight,
          fontFamily: 'Manrope',
        ),
        labelLarge: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: textLight,
          fontFamily: 'Manrope',
        ),
        labelMedium: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: textSecondaryLight,
          fontFamily: 'Manrope',
        ),
        labelSmall: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: textMutedLight,
          fontFamily: 'Manrope',
        ),
      ),
      
      // Divider Theme
      dividerTheme: DividerThemeData(
        color: borderLight,
        thickness: 1,
        space: 1,
      ),
      
      // Chip Theme
      chipTheme: ChipThemeData(
        backgroundColor: surfaceLight,
        selectedColor: primaryColor,
        disabledColor: borderLight,
        labelStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          fontFamily: 'Manrope',
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(999),
        ),
      ),
    );
  }
  
  /// Dark Theme
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: primaryLight,
      scaffoldBackgroundColor: backgroundDark,
      colorScheme: ColorScheme.dark(
        primary: primaryLight,
        secondary: const Color(0xFF00C8B3),
        surface: surfaceDark,
        error: error,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: textDark,
        onError: Colors.white,
      ),
      
      // AppBar Theme
      appBarTheme: const AppBarTheme(
        elevation: 0,
        centerTitle: false,
        backgroundColor: Colors.transparent,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        iconTheme: IconThemeData(color: textDark),
        titleTextStyle: TextStyle(
          color: textDark,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          fontFamily: 'Manrope',
        ),
      ),
      
      // Card Theme
      cardTheme: CardTheme(
        color: surfaceDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: Colors.white.withValues(alpha: 0.05),
            width: 1,
          ),
        ),
        shadowColor: Colors.black.withValues(alpha: 0.3),
      ),
      
      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceDark,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryLight, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      
      // Button Themes (same as light but with dark colors)
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: primaryLight,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(999),
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            fontFamily: 'Manrope',
          ),
        ),
      ),
      
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryLight,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          side: const BorderSide(color: primaryLight),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(999),
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            fontFamily: 'Manrope',
          ),
        ),
      ),
      
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryLight,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            fontFamily: 'Manrope',
          ),
        ),
      ),
      
      // Floating Action Button Theme
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryLight,
        foregroundColor: Colors.white,
        elevation: 4,
      ),
      
      // Text Theme
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: textDark,
          fontFamily: 'Manrope',
        ),
        displayMedium: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: textDark,
          fontFamily: 'Manrope',
        ),
        displaySmall: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: textDark,
          fontFamily: 'Manrope',
        ),
        headlineLarge: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: textDark,
          fontFamily: 'Manrope',
        ),
        headlineMedium: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: textDark,
          fontFamily: 'Manrope',
        ),
        headlineSmall: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: textDark,
          fontFamily: 'Manrope',
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.normal,
          color: textDark,
          fontFamily: 'Manrope',
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.normal,
          color: textDark,
          fontFamily: 'Manrope',
        ),
        bodySmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.normal,
          color: textSecondaryDark,
          fontFamily: 'Manrope',
        ),
        labelLarge: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: textDark,
          fontFamily: 'Manrope',
        ),
        labelMedium: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: textSecondaryDark,
          fontFamily: 'Manrope',
        ),
        labelSmall: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: textMutedDark,
          fontFamily: 'Manrope',
        ),
      ),
      
      // Divider Theme
      dividerTheme: DividerThemeData(
        color: Colors.white.withValues(alpha: 0.1),
        thickness: 1,
        space: 1,
      ),
      
      // Chip Theme
      chipTheme: ChipThemeData(
        backgroundColor: surfaceDark,
        selectedColor: primaryLight,
        disabledColor: borderDark,
        labelStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          fontFamily: 'Manrope',
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(999),
        ),
      ),
    );
  }
}

