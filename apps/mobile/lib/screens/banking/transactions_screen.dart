import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/providers/banking_provider.dart';
import '../../core/models/banking_models.dart';

/// Transactions Screen
class TransactionsScreen extends StatefulWidget {
  final String? accountId;
  
  const TransactionsScreen({super.key, this.accountId});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.toLowerCase();
      });
    });
    // Load transactions after the first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final bankingProvider = Provider.of<BankingProvider>(context, listen: false);
      bankingProvider.loadTransactions(accountId: widget.accountId);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    return formatter.format(amount.abs());
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final transactionDate = DateTime(date.year, date.month, date.day);
    final diff = transactionDate.difference(today).inDays;

    if (diff == 0) {
      return 'Today';
    } else if (diff == 1) {
      return 'Tomorrow';
    } else if (diff == -1) {
      return 'Yesterday';
    } else if (diff < 0 && diff >= -7) {
      return '${diff.abs()} days ago';
    } else {
      return DateFormat('MMM d, yyyy').format(date);
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Transactions'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search transactions...',
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: isDark ? AppTheme.surfaceDark : Colors.white,
                ),
              ),
            ),
            Expanded(
              child: Consumer<BankingProvider>(
                builder: (context, bankingProvider, _) {
                  // Filter transactions by search query
                  List<BankTransactionModel> filteredTransactions = bankingProvider.transactions;
                  
                  if (_searchQuery.isNotEmpty) {
                    filteredTransactions = filteredTransactions.where((transaction) {
                      return transaction.description.toLowerCase().contains(_searchQuery) ||
                          (transaction.category?.toLowerCase().contains(_searchQuery) ?? false) ||
                          (transaction.reference?.toLowerCase().contains(_searchQuery) ?? false);
                    }).toList();
                  }

                  // Loading state
                  if (bankingProvider.isLoading && filteredTransactions.isEmpty) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  // Error state
                  if (bankingProvider.errorMessage != null && filteredTransactions.isEmpty) {
                    return Center(
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
                            bankingProvider.errorMessage ?? 'Error loading transactions',
                            style: TextStyle(
                              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () => bankingProvider.loadTransactions(accountId: widget.accountId),
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    );
                  }

                  // Empty state
                  if (filteredTransactions.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.receipt_long_outlined,
                            size: 64,
                            color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _searchQuery.isNotEmpty ? 'No transactions found' : 'No transactions',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: isDark ? AppTheme.textDark : AppTheme.textLight,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _searchQuery.isNotEmpty
                                ? 'Try a different search term'
                                : 'Transactions will appear here once available',
                            style: TextStyle(
                              fontSize: 14,
                              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  // Transactions list
                  return RefreshIndicator(
                    onRefresh: () => bankingProvider.loadTransactions(accountId: widget.accountId),
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: filteredTransactions.length,
                      itemBuilder: (context, index) {
                        final transaction = filteredTransactions[index];
                        final isDebit = transaction.type == 'debit' || transaction.amount < 0;
                        return _buildTransactionItem(
                          transaction,
                          isDebit,
                          isDark,
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionItem(BankTransactionModel transaction, bool isDebit, bool isDark) {
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
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: (isDebit ? AppTheme.error : AppTheme.success).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isDebit ? Icons.arrow_downward : Icons.arrow_upward,
              color: isDebit ? AppTheme.error : AppTheme.success,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  transaction.description,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppTheme.textDark : AppTheme.textLight,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      _formatDate(transaction.date),
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                      ),
                    ),
                    if (transaction.category != null) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: (isDark ? AppTheme.surfaceDark : Colors.white).withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          transaction.category!,
                          style: TextStyle(
                            fontSize: 10,
                            color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                if (transaction.reference != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      'Ref: ${transaction.reference!}',
                      style: TextStyle(
                        fontSize: 11,
                        color: isDark ? AppTheme.textMutedDark : AppTheme.textMutedLight,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${isDebit ? "-" : "+"}${_formatCurrency(transaction.amount)}',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isDebit ? AppTheme.error : AppTheme.success,
                ),
              ),
              if (transaction.isReconciled)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Icon(
                    Icons.check_circle,
                    size: 16,
                    color: AppTheme.success,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
