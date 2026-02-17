import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';

/// Chart of Accounts Screen
class ChartOfAccountsScreen extends StatelessWidget {
  const ChartOfAccountsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Chart of Accounts'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search accounts...',
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: isDark ? AppTheme.surfaceDark : Colors.white,
                ),
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: 10,
                itemBuilder: (context, index) {
                  return _buildAccountItem('Account ${index + 1}', '100$index', isDark);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccountItem(String name, String code, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceDark : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? Colors.white.withValues(alpha: 0.05) : AppTheme.borderLight,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(Icons.account_tree, color: AppTheme.primaryColor),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppTheme.textDark : AppTheme.textLight,
                  ),
                ),
                Text(
                  code,
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                  ),
                ),
              ],
            ),
          ),
          Icon(Icons.chevron_right, color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight),
        ],
      ),
    );
  }
}
