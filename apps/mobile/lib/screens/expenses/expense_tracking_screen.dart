import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/routes/app_routes.dart';
import '../../core/providers/expense_provider.dart';
import '../../core/models/expense_models.dart';
import 'package:intl/intl.dart';

/// Expense Tracking Screen
/// Converted from stitch_transactions/expense_tracking/code.html
class ExpenseTrackingScreen extends StatefulWidget {
  const ExpenseTrackingScreen({super.key});

  @override
  State<ExpenseTrackingScreen> createState() => _ExpenseTrackingScreenState();
}

class _ExpenseTrackingScreenState extends State<ExpenseTrackingScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedFilter = 'This Month';

  @override
  void initState() {
    super.initState();
    // Load expenses when screen is initialized
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ExpenseProvider>(context, listen: false).loadExpenses(refresh: true);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    return formatter.format(amount);
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final expenseDate = DateTime(date.year, date.month, date.day);
    
    if (expenseDate == today) {
      return 'Today';
    } else if (expenseDate == today.subtract(const Duration(days: 1))) {
      return 'Yesterday';
    } else {
      return DateFormat('MMM d').format(date);
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Expenses'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: () {
              Navigator.pushNamed(context, AppRoutes.notifications);
            },
            icon: Icon(
              Icons.notifications_outlined,
              color: isDark ? AppTheme.textDark : AppTheme.textLight,
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search Bar
            _buildSearchBar(context, isDark),
            
            // Filter Chips
            _buildFilterChips(context, isDark),
            
            // Expenses List
            Expanded(
              child: _buildExpensesList(context, isDark),
            ),
          ],
        ),
      ),
    );
  }


  Widget _buildSearchBar(BuildContext context, bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? AppTheme.surfaceDark : Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: TextField(
          controller: _searchController,
          style: TextStyle(
            color: isDark ? AppTheme.textDark : AppTheme.textLight,
            fontSize: 14,
          ),
          decoration: InputDecoration(
            hintText: 'Search merchants, categories, amounts...',
            hintStyle: TextStyle(
              color: isDark ? AppTheme.textMutedDark : AppTheme.textMutedLight,
            ),
            prefixIcon: Icon(
              Icons.search,
              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
            ),
            suffixIcon: IconButton(
              icon: Icon(
                Icons.tune,
                color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
              ),
              onPressed: () {
                // Show filter options
              },
            ),
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChips(BuildContext context, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildFilterChip(
              context,
              'This Month',
              isDark,
              isSelected: _selectedFilter == 'This Month',
              onTap: () => setState(() => _selectedFilter = 'This Month'),
            ),
            const SizedBox(width: 8),
            _buildFilterChip(
              context,
              'Category',
              isDark,
              onTap: () {
                // Show category filter
              },
            ),
            const SizedBox(width: 8),
            _buildFilterChip(
              context,
              'Status: All',
              isDark,
              onTap: () {
                // Show status filter
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(
    BuildContext context,
    String label,
    bool isDark, {
    bool isSelected = false,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? AppTheme.primaryColor
              : (isDark ? AppTheme.surfaceDark : Colors.white),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: isSelected
                ? AppTheme.primaryColor
                : (isDark
                    ? Colors.white.withValues(alpha: 0.05)
                    : AppTheme.borderLight),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isSelected
                    ? Colors.white
                    : (isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight),
              ),
            ),
            if (!isSelected) ...[
              const SizedBox(width: 4),
              Icon(
                Icons.expand_more,
                size: 18,
                color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildExpensesList(BuildContext context, bool isDark) {
    return Consumer<ExpenseProvider>(
      builder: (context, expenseProvider, _) {
        final expenses = expenseProvider.expenses;
        final isLoading = expenseProvider.isLoading;
        final errorMessage = expenseProvider.errorMessage;

        if (isLoading && expenses.isEmpty) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        }

        if (errorMessage != null && expenses.isEmpty) {
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
                  errorMessage,
                  style: TextStyle(
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => expenseProvider.refresh(),
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }

        if (expenses.isEmpty) {
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
                  'No expenses yet',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppTheme.textDark : AppTheme.textLight,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Add your first expense to get started',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                  ),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: expenses.length + (expenseProvider.hasMore ? 1 : 0),
          itemBuilder: (context, index) {
            if (index == expenses.length) {
              // Load more trigger
              WidgetsBinding.instance.addPostFrameCallback((_) {
                expenseProvider.loadMore();
              });
              return const Center(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: CircularProgressIndicator(),
                ),
              );
            }
            
            final expense = expenses[index];
            return _buildExpenseItem(context, expense, isDark);
          },
        );
      },
    );
  }

  Widget _buildExpenseItem(BuildContext context, ExpenseModel expense, bool isDark) {
    final isApproved = expense.status == 'approved' || expense.status == 'posted';
    
    return InkWell(
      onTap: () {
        // TODO: Navigate to expense details screen when created
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Expense: ${expense.merchant ?? expense.description}'),
            duration: const Duration(seconds: 1),
          ),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.surfaceDark : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark
                ? Colors.white.withValues(alpha: 0.05)
                : AppTheme.borderLight.withValues(alpha: 0.3),
          ),
        ),
        child: Row(
        children: [
          // Receipt Thumbnail
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: expense.receiptUrl != null && expense.receiptUrl!.isNotEmpty
                ? Image.network(
                    expense.receiptUrl!,
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 60,
                        height: 60,
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.05)
                            : AppTheme.borderLight.withValues(alpha: 0.3),
                        child: Icon(
                          Icons.receipt_long_outlined,
                          color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                        ),
                      );
                    },
                  )
                : Container(
                    width: 60,
                    height: 60,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.05)
                        : AppTheme.borderLight.withValues(alpha: 0.3),
                    child: Icon(
                      Icons.receipt_long_outlined,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                    ),
                  ),
          ),
          const SizedBox(width: 16),
          // Expense Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        expense.merchant ?? expense.description,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isDark ? AppTheme.textDark : AppTheme.textLight,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isApproved
                            ? AppTheme.success.withValues(alpha: 0.1)
                            : AppTheme.warning.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        isApproved ? 'Approved' : 'Pending',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isApproved ? AppTheme.success : AppTheme.warning,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    if (expense.category != null && expense.category!.isNotEmpty)
                      Text(
                        expense.category!,
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                        ),
                      ),
                    if (expense.category != null && expense.category!.isNotEmpty)
                      Text(
                        ' • ',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                        ),
                      ),
                    Text(
                      _formatDate(expense.date),
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          // Amount
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '-${_formatCurrency(expense.amount)}',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppTheme.textDark : AppTheme.textLight,
                ),
              ),
              const SizedBox(height: 4),
              Icon(
                Icons.chevron_right,
                color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                size: 20,
              ),
            ],
          ),
        ],
      ),
      ),
    );
  }
}

