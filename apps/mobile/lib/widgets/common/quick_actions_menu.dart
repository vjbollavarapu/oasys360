import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/routes/app_routes.dart';

/// Quick Actions Menu - Bottom sheet with common creation actions
class QuickActionsMenu {
  static void show(BuildContext context) {
    final themeProvider = Theme.of(context);
    final isDark = themeProvider.brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (BuildContext context) {
        return Container(
          decoration: BoxDecoration(
            color: isDark ? AppTheme.surfaceDark : Colors.white,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(24),
            ),
          ),
          child: SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Handle bar
                Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 8),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                
                // Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Quick Actions',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: isDark ? AppTheme.textDark : AppTheme.textLight,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                        color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                      ),
                    ],
                  ),
                ),
                
                const Divider(height: 1),
                
                // Action Items
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Column(
                    children: [
                      _buildActionItem(
                        context,
                        icon: Icons.receipt_long,
                        title: 'Create Expense',
                        subtitle: 'Manual expense entry',
                        color: AppTheme.primaryColor,
                        isDark: isDark,
                        onTap: () {
                          Navigator.pop(context);
                          // Show manual expense dialog
                          final navigatorContext = context;
                          Future.delayed(const Duration(milliseconds: 300), () {
                            if (navigatorContext.mounted) {
                              _showManualExpenseDialog(navigatorContext, isDark);
                            }
                          });
                        },
                      ),
                      
                      _buildActionItem(
                        context,
                        icon: Icons.camera_alt,
                        title: 'Scan Receipt',
                        subtitle: 'OCR receipt scanning',
                        color: AppTheme.success,
                        isDark: isDark,
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.pushNamed(context, AppRoutes.receiptScanner);
                        },
                      ),
                      
                      _buildActionItem(
                        context,
                        icon: Icons.qr_code_scanner,
                        title: 'Scan Barcode',
                        subtitle: 'Barcode scanning',
                        color: AppTheme.info,
                        isDark: isDark,
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.pushNamed(context, AppRoutes.barcodeScanner);
                        },
                      ),
                      
                      _buildActionItem(
                        context,
                        icon: Icons.description_outlined,
                        title: 'Create Invoice',
                        subtitle: 'New invoice creation',
                        color: AppTheme.warning,
                        isDark: isDark,
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.pushNamed(context, AppRoutes.invoiceCreation);
                        },
                      ),
                      
                      _buildActionItem(
                        context,
                        icon: Icons.note_add_outlined,
                        title: 'Quick Transaction',
                        subtitle: 'Fast journal entry',
                        color: AppTheme.error,
                        isDark: isDark,
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.pushNamed(context, AppRoutes.journalEntries);
                          // Optionally show quick entry dialog
                        },
                      ),
                    ],
                  ),
                ),
                
                SizedBox(height: MediaQuery.of(context).padding.bottom + 8),
              ],
            ),
          ),
        );
      },
    );
  }

  static Widget _buildActionItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark
                ? Colors.white.withValues(alpha: 0.05)
                : AppTheme.borderLight.withValues(alpha: 0.3),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: color,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppTheme.textDark : AppTheme.textLight,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
            ),
          ],
        ),
      ),
    );
  }

  static void _showManualExpenseDialog(BuildContext context, bool isDark) {
    final merchantController = TextEditingController();
    final amountController = TextEditingController();
    final descriptionController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Expense'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: merchantController,
                decoration: const InputDecoration(
                  labelText: 'Merchant *',
                  hintText: 'Enter merchant name',
                  prefixIcon: Icon(Icons.store_outlined),
                ),
                autofocus: true,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: amountController,
                decoration: const InputDecoration(
                  labelText: 'Amount *',
                  hintText: '0.00',
                  prefixText: '\$',
                  prefixIcon: Icon(Icons.attach_money),
                ),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  hintText: 'Optional description',
                  prefixIcon: Icon(Icons.description_outlined),
                ),
                maxLines: 2,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (merchantController.text.isEmpty || amountController.text.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Please fill in required fields'),
                    backgroundColor: AppTheme.error,
                  ),
                );
                return;
              }
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Expense created: ${merchantController.text} - \$${amountController.text}'),
                  backgroundColor: AppTheme.success,
                ),
              );
              // TODO: Save to backend when API is ready
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
            ),
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}

