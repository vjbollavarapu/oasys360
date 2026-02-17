import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/routes/app_routes.dart';
import '../../core/providers/banking_provider.dart';
import '../../core/models/banking_models.dart';

/// Bank Accounts Overview Screen
/// Converted from stitch_transactions/bank_accounts_overview/code.html
class BankAccountsOverviewScreen extends StatefulWidget {
  const BankAccountsOverviewScreen({super.key});

  @override
  State<BankAccountsOverviewScreen> createState() => _BankAccountsOverviewScreenState();
}

class _BankAccountsOverviewScreenState extends State<BankAccountsOverviewScreen> {
  @override
  void initState() {
    super.initState();
    // Load bank accounts after the first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final bankingProvider = Provider.of<BankingProvider>(context, listen: false);
      bankingProvider.loadBankAccounts();
    });
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    return formatter.format(amount);
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      body: CustomScrollView(
          slivers: [
            // Header
            SliverAppBar(
              pinned: true,
              elevation: 0,
              backgroundColor: (isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight)
                  .withValues(alpha: 0.95),
              title: const Text('Bank Accounts'),
              actions: [
                IconButton(
                  icon: const Icon(Icons.search),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Search functionality coming soon')),
                    );
                  },
                ),
                Stack(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.notifications_outlined),
                      onPressed: () {
                        Navigator.pushNamed(context, AppRoutes.notifications);
                      },
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: AppTheme.error,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            
            // Total Liquidity Card
            SliverToBoxAdapter(
              child: Consumer<BankingProvider>(
                builder: (context, bankingProvider, _) {
                  if (bankingProvider.isLoading && bankingProvider.accounts.isEmpty) {
                    return const Padding(
                      padding: EdgeInsets.all(16),
                      child: Center(child: CircularProgressIndicator()),
                    );
                  }

                  if (bankingProvider.errorMessage != null && bankingProvider.accounts.isEmpty) {
                    return Padding(
                      padding: const EdgeInsets.all(16),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.error_outline,
                              size: 64,
                              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              bankingProvider.errorMessage ?? 'Error loading bank accounts',
                              style: TextStyle(
                                color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () => bankingProvider.loadBankAccounts(),
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  return Padding(
                    padding: const EdgeInsets.all(16),
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [AppTheme.primaryColor, const Color(0xFF0F4AC7)],
                        ),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primaryColor.withValues(alpha:0.2),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Total Liquidity',
                                    style: TextStyle(
                                      color: Colors.white.withValues(alpha: 0.9),
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    _formatCurrency(bankingProvider.totalBalance),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 32,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha:0.2),
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.trending_up, size: 14, color: Colors.white),
                                        const SizedBox(width: 4),
                                        Text(
                                          '+5.2%',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'vs last month',
                                    style: TextStyle(
                                      color: Colors.white.withValues(alpha:0.8),
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          // Placeholder for chart
                          Container(
                            height: 96,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha:0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Center(
                              child: Text(
                                'Chart Placeholder',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.7),
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            
            // Account Cards
            SliverToBoxAdapter(
              child: Consumer<BankingProvider>(
                builder: (context, bankingProvider, _) {
                  if (bankingProvider.isLoading && bankingProvider.accounts.isEmpty) {
                    return const SizedBox.shrink();
                  }

                  if (bankingProvider.errorMessage != null && bankingProvider.accounts.isEmpty) {
                    return const SizedBox.shrink();
                  }

                  if (bankingProvider.accounts.isEmpty) {
                    return Padding(
                      padding: const EdgeInsets.all(16),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.account_balance_outlined,
                              size: 64,
                              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No bank accounts',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: isDark ? AppTheme.textDark : AppTheme.textLight,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Add your first bank account to get started',
                              style: TextStyle(
                                fontSize: 14,
                                color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Accounts',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: isDark ? AppTheme.textDark : AppTheme.textLight,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ...bankingProvider.accounts.asMap().entries.map((entry) {
                          final index = entry.key;
                          final account = entry.value;
                          final accentColor = _getAccountColor(account.accountType, index);
                          return Padding(
                            padding: EdgeInsets.only(bottom: index < bankingProvider.accounts.length - 1 ? 12 : 0),
                            child: _buildAccountCard(
                              context,
                              account,
                              accentColor,
                              isDark,
                            ),
                          );
                        }),
                      ],
                    ),
                  );
                },
              ),
            ),
            
            SliverToBoxAdapter(
              child: SizedBox(height: MediaQuery.of(context).padding.bottom + 20),
            ),
          ],
        ),
    );
  }

  Color _getAccountColor(String accountType, int index) {
    switch (accountType.toLowerCase()) {
      case 'checking':
      case 'operating':
        return AppTheme.primaryColor;
      case 'savings':
        return AppTheme.success;
      case 'investment':
        return AppTheme.warning;
      default:
        // Cycle through colors for other types
        final colors = [AppTheme.primaryColor, AppTheme.success, AppTheme.warning, AppTheme.info];
        return colors[index % colors.length];
    }
  }

  String _maskAccountNumber(String accountNumber) {
    if (accountNumber.length <= 4) {
      return accountNumber;
    }
    return '****${accountNumber.substring(accountNumber.length - 4)}';
  }

  Widget _buildAccountCard(
    BuildContext context,
    BankAccountModel account,
    Color accentColor,
    bool isDark,
  ) {
    return GestureDetector(
      onTap: () {
        // Pass account ID to transactions screen
        Navigator.pushNamed(
          context,
          AppRoutes.bankingTransactions,
          arguments: account.id,
        );
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.surfaceDark : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark
                ? Colors.white.withValues(alpha: 0.05)
                : AppTheme.borderLight,
          ),
        ),
        child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: accentColor.withValues(alpha:0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.account_balance,
              color: accentColor,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  account.accountName,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppTheme.textDark : AppTheme.textLight,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _maskAccountNumber(account.accountNumber),
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                  ),
                ),
                if (account.bankName != null)
                  Text(
                    account.bankName!,
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? AppTheme.textMutedDark : AppTheme.textMutedLight,
                    ),
                  ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                _formatCurrency(account.balance),
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppTheme.textDark : AppTheme.textLight,
                ),
              ),
              const SizedBox(height: 4),
              Icon(
                Icons.chevron_right,
                color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
              ),
            ],
          ),
        ],
      ),
      ),
    );
  }
}
