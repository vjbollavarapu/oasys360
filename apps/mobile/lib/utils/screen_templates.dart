import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_theme.dart';
import '../core/theme/theme_provider.dart';

/// Template for creating functional screens with theme support
class ScreenTemplate {
  static Widget buildBasicScreen({
    required String title,
    required IconData icon,
    String? subtitle,
    Widget? body,
    List<Widget>? actions,
  }) {
    return Builder(
      builder: (context) {
        final themeProvider = Provider.of<ThemeProvider>(context);
        final isDark = themeProvider.isDarkMode(context);

        return Scaffold(
          backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
          appBar: AppBar(
            title: Text(title),
            backgroundColor: Colors.transparent,
            elevation: 0,
            actions: actions,
          ),
          body: SafeArea(
            child: body ??
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        icon,
                        size: 64,
                        color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: isDark ? AppTheme.textDark : AppTheme.textLight,
                        ),
                      ),
                      if (subtitle != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          subtitle,
                          style: TextStyle(
                            fontSize: 14,
                            color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
          ),
        );
      },
    );
  }
}

