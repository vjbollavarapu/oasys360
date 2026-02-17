import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/routes/app_routes.dart';

/// Inventory Items Management Screen
class InventoryItemsManagementScreen extends StatelessWidget {
  const InventoryItemsManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Inventory Items'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () {
              Navigator.pushNamed(context, AppRoutes.barcodeScanner);
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search items...',
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: isDark ? AppTheme.surfaceDark : Colors.white,
                ),
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: 15,
                itemBuilder: (context, index) {
                  return _buildInventoryItem('Item ${index + 1}', 'SKU-${1000 + index}', index * 10, isDark);
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Add inventory item functionality coming soon')),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildInventoryItem(String name, String sku, int quantity, bool isDark) {
    final isLowStock = quantity < 20;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceDark : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isLowStock
              ? AppTheme.warning
              : (isDark ? Colors.white.withValues(alpha: 0.05) : AppTheme.borderLight),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(Icons.inventory_2, color: AppTheme.primaryColor),
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
                  sku,
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      'Qty: $quantity',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: isLowStock ? AppTheme.warning : (isDark ? AppTheme.textDark : AppTheme.textLight),
                      ),
                    ),
                    if (isLowStock) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.warning.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'Low Stock',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.warning,
                          ),
                        ),
                      ),
                    ],
                  ],
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
