import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/routes/app_routes.dart';
import '../../widgets/common/quick_actions_menu.dart';
import '../../core/providers/dashboard_provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/models/dashboard_models.dart';
import 'package:intl/intl.dart';

/// Dashboard Screen - Main dashboard view
/// Converted from stitch_transactions/dashboard_1/code.html
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    // Load dashboard data when screen is initialized
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<DashboardProvider>(context, listen: false).loadDashboardData();
    });
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    return formatter.format(amount);
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return 'Good morning';
    } else if (hour < 17) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final dashboardProvider = Provider.of<DashboardProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context, listen: true);
    final isDark = themeProvider.isDarkMode(context);
    
    final stats = dashboardProvider.stats;
    final currentUser = authProvider.currentUser;
    final userName = currentUser?.fullName ?? 
                     (currentUser?.email != null ? currentUser!.email.split('@').first : 'User');
    final greeting = _getGreeting();
    
    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      body: CustomScrollView(
          slivers: [
            // Top App Bar
            SliverAppBar(
              pinned: true,
              elevation: 0,
              backgroundColor: (isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight)
                  .withValues(alpha: 0.9),
              expandedHeight: 80,
              toolbarHeight: 80,
              flexibleSpace: LayoutBuilder(
                builder: (context, constraints) {
                  return Container(
                    decoration: BoxDecoration(
                      color: (isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight)
                          .withValues(alpha: 0.9),
                    ),
                    child: SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            // Profile Section
                            Flexible(
                              child: Row(
                                children: [
                                  Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: AppTheme.primaryColor.withValues(alpha: 0.2),
                                        width: 2,
                                      ),
                                      image: const DecorationImage(
                                        image: NetworkImage(
                                          'https://lh3.googleusercontent.com/aida-public/AB6AXuDroLl87p76TiaHZIdCPrbEzvQOrKlRiXC4fq2JkcEbGnTR1CoeYEyx3eNcMhohs1tJPIr16xO1lgSJv4aujq_7knN5tiwWhTnwgVQxyGT6VQ6BTNxe4TiHLitqPM2NKJOfna4Wqkgyqg6OHRV3ECpMLkcoin5_Yq8Tn-v-24yZqh2DqvRmFJKKVCrGUHXGtZhzIGYAxk_2x80WqMOwbriseX1ojPqcaEMwiA3N_VWx59g1NHdboJC0ouZir4UaVjKbxnrQoRTfUFw',
                                        ),
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Flexible(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisSize: MainAxisSize.min,
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          '$greeting,',
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w500,
                                            color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                                          ),
                                        ),
                                        Text(
                                          userName,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            fontSize: 17,
                                            fontWeight: FontWeight.bold,
                                            color: isDark ? AppTheme.textDark : AppTheme.textLight,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            // Notification Button
                            GestureDetector(
                              onTap: () {
                                Navigator.pushNamed(context, AppRoutes.notifications);
                              },
                              child: Stack(
                                children: [
                                  Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: isDark ? AppTheme.surfaceDark : Colors.white,
                                      border: Border.all(
                                        color: isDark
                                            ? Colors.white.withValues(alpha: 0.1)
                                            : AppTheme.borderLight,
                                        width: 1,
                                      ),
                                    ),
                                    child: Icon(
                                      Icons.notifications_outlined,
                                      color: isDark ? AppTheme.textDark : AppTheme.textLight,
                                    ),
                                  ),
                                  Positioned(
                                    top: 8,
                                    right: 10,
                                    child: Container(
                                      width: 8,
                                      height: 8,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: AppTheme.error,
                                        border: Border.all(
                                          color: isDark ? AppTheme.surfaceDark : Colors.white,
                                          width: 2,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            
            // Content
            SliverToBoxAdapter(
              child: Column(
                children: [
                  // Metric Cards Carousel
                  _buildMetricCards(context, isDark, stats),
                  
                  const SizedBox(height: 24),
                  
                  // Actions Bar
                  _buildActionsBar(context, isDark),
                  
                  const SizedBox(height: 24),
                  
                  // Action Panel
                  _buildActionPanel(context, isDark, stats),
                  
                  const SizedBox(height: 24),
                  
                  // Charts Section
                  _buildChartsSection(context, isDark, dashboardProvider.revenueChart, stats),
                  
                  const SizedBox(height: 24),
                  
                  // Recent Activity
                  _buildRecentActivity(context, isDark, dashboardProvider.recentActivities),
                  
                  SizedBox(height: MediaQuery.of(context).padding.bottom + 100), // Space for bottom nav
                ],
              ),
            ),
        ],
      ),
      bottomNavigationBar: _buildBottomNavigation(context, isDark),
    );
  }

  Widget _buildMetricCards(BuildContext context, bool isDark, DashboardStats? stats) {
    return SizedBox(
      height: 200,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        physics: const BouncingScrollPhysics(),
        children: [
          // Total Balance Card
          Container(
            width: MediaQuery.of(context).size.width * 0.85,
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppTheme.primaryColor,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryColor.withValues(alpha: 0.2),
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
                          'Total Balance',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.8),
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _formatCurrency(stats?.totalBalance ?? 0.0),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.account_balance_wallet_outlined,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.trending_up, size: 14, color: Colors.white),
                          const SizedBox(width: 4),
                          Text(
                            stats != null && stats.balanceChange >= 0
                                ? '+${stats.balanceChange.toStringAsFixed(1)}%'
                                : '${stats?.balanceChange.toStringAsFixed(1) ?? '0.0'}%',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'vs last month',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Expenses Card
          Container(
            width: MediaQuery.of(context).size.width * 0.85,
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.surfaceDark : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.05)
                    : AppTheme.borderLight.withValues(alpha: 0.1),
              ),
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
                          'Expenses',
                          style: TextStyle(
                            color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _formatCurrency(stats?.expenses ?? 0.0),
                          style: TextStyle(
                            color: isDark ? AppTheme.textDark : AppTheme.textLight,
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.05)
                            : AppTheme.borderLight.withValues(alpha: 0.3),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.credit_card_outlined,
                        color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                        size: 20,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildSparklineBar(40, isDark),
                    _buildSparklineBar(60, isDark),
                    _buildSparklineBar(30, isDark),
                    _buildSparklineBar(80, isDark, isPrimary: true),
                    _buildSparklineBar(50, isDark),
                    _buildSparklineBar(70, isDark),
                  ],
                ),
              ],
            ),
          ),
          
          // Pending Invoices Card
          Container(
            width: MediaQuery.of(context).size.width * 0.85,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.surfaceDark : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.05)
                    : AppTheme.borderLight.withValues(alpha: 0.1),
              ),
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
                          'Pending Invoices',
                          style: TextStyle(
                            color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${stats?.pendingInvoices ?? 0}',
                          style: TextStyle(
                            color: isDark ? AppTheme.textDark : AppTheme.textLight,
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.05)
                            : AppTheme.borderLight.withValues(alpha: 0.3),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.receipt_long_outlined,
                        color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                        size: 20,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                Row(
                  children: [
                    if (stats != null && stats.pendingInvoices > 0)
                      Text(
                        '${stats.pendingInvoices} Pending',
                        style: TextStyle(
                          color: AppTheme.warning,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    if (stats != null && stats.pendingInvoices > 0) ...[
                      const SizedBox(width: 8),
                      Container(
                        width: 4,
                        height: 4,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],
                    Text(
                      '${stats?.pendingInvoices ?? 0} Total',
                      style: TextStyle(
                        color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSparklineBar(double height, bool isDark, {bool isPrimary = false}) {
    return Container(
      width: 12,
      height: 32 * (height / 100),
      decoration: BoxDecoration(
        color: isPrimary
            ? AppTheme.primaryColor.withValues(alpha: 0.4)
            : (isDark ? Colors.white.withValues(alpha: 0.1) : AppTheme.borderLight),
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }

  Widget _buildActionsBar(BuildContext context, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            _buildActionButton(
              context,
              Icons.send_outlined,
              'Send\nInvoice',
              isDark,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.invoiceCreation);
              },
            ),
            const SizedBox(width: 12),
            _buildActionButton(
              context,
              Icons.check_circle_outlined,
              'Approve\nRequest',
              isDark,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.approvals);
              },
            ),
            const SizedBox(width: 12),
            _buildActionButton(
              context,
              Icons.people_outlined,
              'Customers',
              isDark,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.customers);
              },
            ),
            const SizedBox(width: 12),
            _buildActionButton(
              context,
              Icons.store_outlined,
              'Vendors',
              isDark,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.vendors);
              },
            ),
            const SizedBox(width: 12),
            _buildActionButton(
              context,
              Icons.more_horiz,
              'More',
              isDark,
              isSecondary: true,
              onTap: () {
                _showMoreActionsBottomSheet(context, isDark);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(
    BuildContext context,
    IconData icon,
    String label,
    bool isDark, {
    bool isSecondary = false,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isSecondary
                  ? (isDark ? AppTheme.surfaceDark : AppTheme.borderLight.withValues(alpha: 0.3))
                  : AppTheme.primaryColor.withValues(alpha: isDark ? 0.2 : 0.1),
            ),
            child: Icon(
              icon,
              color: isSecondary
                  ? (isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight)
                  : AppTheme.primaryColor,
              size: 24,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }

  void _showMoreActionsBottomSheet(BuildContext context, bool isDark) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (BuildContext context) {
        return Container(
          decoration: BoxDecoration(
            color: isDark ? AppTheme.surfaceDark : Colors.white,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
            ),
          ),
          child: SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Handle bar
                Container(
                  margin: const EdgeInsets.symmetric(vertical: 12),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                // Options
                _buildMoreActionItem(
                  context,
                  Icons.receipt_long_outlined,
                  'Expenses',
                  'Track and manage expenses',
                  isDark,
                  () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, AppRoutes.expenses);
                  },
                ),
                _buildMoreActionItem(
                  context,
                  Icons.account_balance_wallet_outlined,
                  'Bank Accounts',
                  'View bank accounts',
                  isDark,
                  () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, AppRoutes.bankAccounts);
                  },
                ),
                _buildMoreActionItem(
                  context,
                  Icons.people_outlined,
                  'Customers',
                  'Manage customer list',
                  isDark,
                  () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, AppRoutes.customers);
                  },
                ),
                _buildMoreActionItem(
                  context,
                  Icons.store_outlined,
                  'Vendors',
                  'Manage vendor list',
                  isDark,
                  () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, AppRoutes.vendors);
                  },
                ),
                _buildMoreActionItem(
                  context,
                  Icons.assessment_outlined,
                  'Reports',
                  'View financial reports',
                  isDark,
                  () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, AppRoutes.reports);
                  },
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildMoreActionItem(
    BuildContext context,
    IconData icon,
    String title,
    String subtitle,
    bool isDark,
    VoidCallback onTap,
  ) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppTheme.primaryColor.withValues(alpha: isDark ? 0.2 : 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          color: AppTheme.primaryColor,
          size: 20,
        ),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: isDark ? AppTheme.textDark : AppTheme.textLight,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(
          fontSize: 12,
          color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
        ),
      ),
      onTap: onTap,
    );
  }

  Widget _buildActionPanel(BuildContext context, bool isDark, DashboardStats? stats) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.surfaceDark : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark
                ? Colors.white.withValues(alpha: 0.1)
                : AppTheme.borderLight,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppTheme.warning.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.priority_high,
                color: AppTheme.warning,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Action Required',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isDark ? AppTheme.textDark : AppTheme.textLight,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    stats != null && stats.pendingInvoices > 0
                        ? '${stats.pendingInvoices} Invoice${stats.pendingInvoices == 1 ? '' : 's'} require${stats.pendingInvoices == 1 ? 's' : ''} attention'
                        : 'No pending items',
                    style: TextStyle(
                      fontSize: 14,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                    ),
                  ),
                ],
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, AppRoutes.approvals);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(999),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              child: const Text(
                'Review Reports',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChartsSection(BuildContext context, bool isDark, ChartData? revenueChart, DashboardStats? stats) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.surfaceDark : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark
                ? Colors.white.withValues(alpha: 0.05)
                : AppTheme.borderLight.withValues(alpha: 0.1),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Q3 Performance',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.trending_up,
                        color: AppTheme.success,
                        size: 14,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        stats != null && stats.balanceChange >= 0
                            ? '+${stats.balanceChange.toStringAsFixed(1)}%'
                            : '${stats?.balanceChange.toStringAsFixed(1) ?? '0.0'}%',
                        style: TextStyle(
                          color: stats != null && stats.balanceChange >= 0 ? AppTheme.success : AppTheme.error,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  stats != null && stats.revenue >= 1000000
                      ? '\$${(stats.revenue / 1000000).toStringAsFixed(2)}M'
                      : stats != null && stats.revenue >= 1000
                          ? '\$${(stats.revenue / 1000).toStringAsFixed(1)}K'
                          : _formatCurrency(stats?.revenue ?? 0.0),
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppTheme.textDark : AppTheme.textLight,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  'Revenue',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            // Revenue Performance Chart
            _buildQ3PerformanceChart(isDark, revenueChart),
          ],
        ),
      ),
    );
  }

  String _getTimeAgo(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays == 1 ? '' : 's'} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hour${difference.inHours == 1 ? '' : 's'} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minute${difference.inMinutes == 1 ? '' : 's'} ago';
    } else {
      return 'Just now';
    }
  }
  
  IconData _getActivityIcon(String type) {
    switch (type.toLowerCase()) {
      case 'transaction':
        return Icons.account_balance_wallet_outlined;
      case 'invoice':
        return Icons.receipt_long_outlined;
      case 'expense':
        return Icons.credit_card_outlined;
      case 'payment':
        return Icons.payments_outlined;
      default:
        return Icons.circle_outlined;
    }
  }

  Widget _buildRecentActivity(BuildContext context, bool isDark, List<RecentActivity> activities) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Recent Activity',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isDark ? AppTheme.textDark : AppTheme.textLight,
            ),
          ),
          const SizedBox(height: 16),
          if (activities.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.surfaceDark : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.05)
                      : AppTheme.borderLight.withValues(alpha: 0.3),
                ),
              ),
              child: Center(
                child: Text(
                  'No recent activity',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                  ),
                ),
              ),
            )
          else
            ...activities.take(3).map((activity) {
              final isExpense = activity.amount != null && activity.amount! < 0;
              final amount = activity.amount;
              final timeAgo = _getTimeAgo(activity.timestamp);
              
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildActivityItem(
                  context,
                  _getActivityIcon(activity.type),
                  activity.title,
                  '${activity.description} • $timeAgo',
                  amount != null
                      ? '${isExpense ? '-' : '+'}${_formatCurrency(amount.abs())}'
                      : '',
                  isDark,
                  isExpense: isExpense,
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildActivityItem(
    BuildContext context,
    IconData icon,
    String title,
    String subtitle,
    String amount,
    bool isDark, {
    bool isExpense = true,
  }) {
    return Container(
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
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: isDark
                  ? const Color(0xFF282E39)
                  : AppTheme.borderLight.withValues(alpha: 0.3),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
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
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
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
          Text(
            amount,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: isExpense
                  ? (isDark ? AppTheme.textDark : AppTheme.textLight)
                  : AppTheme.success,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNavigation(BuildContext context, bool isDark) {
    final currentRoute = ModalRoute.of(context)?.settings.name ?? '';
    
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1A1D24) : Colors.white,
        borderRadius: BorderRadius.circular(999),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(
              context,
              Icons.dashboard,
              AppRoutes.dashboard,
              currentRoute == AppRoutes.dashboard,
              isDark,
            ),
            _buildNavItem(
              context,
              Icons.bar_chart_outlined,
              AppRoutes.reports,
              currentRoute == AppRoutes.reports,
              isDark,
            ),
            GestureDetector(
              onTap: () {
                QuickActionsMenu.show(context);
              },
              child: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withValues(alpha: 0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                margin: const EdgeInsets.only(bottom: 16),
                child: const Icon(Icons.add, color: Colors.white),
              ),
            ),
            _buildNavItem(
              context,
              Icons.receipt_long_outlined,
              AppRoutes.invoices,
              currentRoute == AppRoutes.invoices,
              isDark,
            ),
            _buildNavItem(
              context,
              Icons.settings_outlined,
              AppRoutes.settings,
              currentRoute == AppRoutes.settings,
              isDark,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context,
    IconData icon,
    String route,
    bool isActive,
    bool isDark,
  ) {
    return GestureDetector(
      onTap: () {
        if (ModalRoute.of(context)?.settings.name != route) {
          Navigator.pushNamed(context, route);
        }
      },
      child: Icon(
        icon,
        color: isActive 
            ? AppTheme.primaryColor 
            : (isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight),
        size: 24,
      ),
    );
  }

  Widget _buildQ3PerformanceChart(bool isDark, ChartData? revenueChart) {
    // Use revenue chart data from backend if available, otherwise show empty state
    final chartData = revenueChart?.dataPoints ?? [];
    
    if (chartData.isEmpty) {
      return Container(
        height: 180,
        decoration: BoxDecoration(
          color: isDark ? AppTheme.surfaceDark.withValues(alpha: 0.5) : AppTheme.borderLight.withValues(alpha: 0.3),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: Text(
            'No chart data available',
            style: TextStyle(
              fontSize: 12,
              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
            ),
          ),
        ),
      );
    }
    
    // Take last 3 months if available, or use all data
    final displayData = chartData.length >= 3 ? chartData.sublist(chartData.length - 3) : chartData;
    
    final data = displayData.asMap().entries.map((entry) {
      final index = entry.key;
      final point = entry.value;
      final alpha = 0.6 + (index * 0.1);
      return {
        'month': point.label.length >= 3 ? point.label.substring(0, 3).toUpperCase() : point.label.toUpperCase(),
        'value': point.value / 1000000, // Convert to millions for display
        'color': AppTheme.primaryColor.withValues(alpha: alpha.clamp(0.6, 1.0)),
      };
    }).toList();
    
    final maxValue = data.map((d) => d['value'] as double).reduce((a, b) => a > b ? a : b);
    // Chart container height: accounting for value labels (30px), bars, and month labels (20px)
    final containerHeight = 180.0;
    final topLabelHeight = 30.0; // Value label height + margin
    final bottomLabelHeight = 20.0; // Month label height + spacing
    final barAreaHeight = containerHeight - topLabelHeight - bottomLabelHeight;
    final barWidth = 60.0;
    
    return SizedBox(
      height: containerHeight,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: data.map((item) {
            final value = item['value'] as double;
            final month = item['month'] as String;
            final color = item['color'] as Color;
            final barHeight = (value / maxValue) * barAreaHeight;
            
            return Column(
              mainAxisAlignment: MainAxisAlignment.end,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Value label on top of bar
                Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.surfaceDark : Colors.white,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.1)
                          : AppTheme.borderLight.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Text(
                    '\$${value.toStringAsFixed(2)}M',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: isDark ? AppTheme.textDark : AppTheme.textLight,
                    ),
                  ),
                ),
                // Bar
                Container(
                  width: barWidth,
                  height: barHeight,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        color,
                        color.withValues(alpha: 0.7),
                      ],
                    ),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(8),
                      topRight: Radius.circular(8),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: color.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                // Month label
                SizedBox(
                  height: 12,
                  child: Text(
                    month,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}

