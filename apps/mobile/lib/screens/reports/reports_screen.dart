import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/routes/app_routes.dart';

/// Reports Screen
class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Reports'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: GridView.count(
          crossAxisCount: 2,
          padding: const EdgeInsets.all(16),
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
            _buildReportCard('Financial Report', Icons.pie_chart, AppTheme.primaryColor, isDark, () {
              Navigator.pushNamed(context, AppRoutes.reportViewer);
            }),
            _buildReportCard('Tax Report', Icons.receipt_long, AppTheme.warning, isDark, () {}),
            _buildReportCard('Compliance Report', Icons.verified_user, AppTheme.success, isDark, () {}),
            _buildReportCard('Custom Report', Icons.assessment, AppTheme.info, isDark, () {}),
          ],
        ),
      ),
    );
  }

  Widget _buildReportCard(String title, IconData icon, Color color, bool isDark, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? AppTheme.surfaceDark : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? Colors.white.withValues(alpha: 0.05) : AppTheme.borderLight,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 32, color: color),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? AppTheme.textDark : AppTheme.textLight,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
