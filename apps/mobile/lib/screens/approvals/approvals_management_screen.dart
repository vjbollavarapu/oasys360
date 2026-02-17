import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/providers/approval_provider.dart';
import '../../core/models/approval_models.dart';

/// Approvals Management Screen
/// Converted from stitch_transactions/approvals_management/code.html
class ApprovalsManagementScreen extends StatefulWidget {
  const ApprovalsManagementScreen({super.key});

  @override
  State<ApprovalsManagementScreen> createState() => _ApprovalsManagementScreenState();
}

class _ApprovalsManagementScreenState extends State<ApprovalsManagementScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _selectedTab = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging || _tabController.index != _selectedTab) {
        setState(() {
          _selectedTab = _tabController.index;
        });
        // Load approvals for the selected tab
        _loadApprovalsForTab(_tabController.index);
      }
    });
    // Load initial approvals
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadApprovalsForTab(0);
    });
  }

  void _loadApprovalsForTab(int tabIndex) {
    final approvalProvider = Provider.of<ApprovalProvider>(context, listen: false);
    String? status;
    switch (tabIndex) {
      case 0: // Pending
        status = 'pending';
        break;
      case 2: // Approved
        status = 'approved';
        break;
      case 3: // Rejected
        status = 'rejected';
        break;
      default:
        // My Requests - will filter by current user later
        status = null;
        break;
    }
    approvalProvider.loadApprovals(refresh: true, status: status);
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays == 0) {
      if (diff.inHours == 0) {
        return '${diff.inMinutes} minutes ago';
      }
      return '${diff.inHours} hours ago';
    } else if (diff.inDays == 1) {
      return 'Yesterday';
    } else if (diff.inDays < 7) {
      return '${diff.inDays} days ago';
    } else {
      return DateFormat('MMM d, yyyy').format(date);
    }
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    return formatter.format(amount);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Approvals'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Filter functionality coming soon')),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Tabs
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TabBar(
                controller: _tabController,
                indicator: UnderlineTabIndicator(
                  borderSide: BorderSide(color: AppTheme.primaryColor, width: 2),
                ),
                labelColor: AppTheme.primaryColor,
                unselectedLabelColor: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                tabs: [
                  Consumer<ApprovalProvider>(
                    builder: (context, approvalProvider, _) {
                      return Tab(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('Pending'),
                            const SizedBox(width: 8),
                            if (approvalProvider.pendingCount > 0)
                              Badge(
                                label: Text(
                                  '${approvalProvider.pendingCount}',
                                  style: const TextStyle(fontSize: 10),
                                ),
                              ),
                          ],
                        ),
                      );
                    },
                  ),
                  const Tab(text: 'My Requests'),
                  const Tab(text: 'Approved'),
                  const Tab(text: 'Rejected'),
                ],
              ),
            ),
            
            // Filter Chips
            Container(
              padding: const EdgeInsets.all(16),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip('Type', isDark),
                    const SizedBox(width: 8),
                    _buildFilterChip('Date', isDark),
                    const SizedBox(width: 8),
                    _buildFilterChip('Amount', isDark),
                  ],
                ),
              ),
            ),
            
            // Approval List
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildApprovalList('pending', isDark),
                  _buildApprovalList('my_requests', isDark),
                  _buildApprovalList('approved', isDark),
                  _buildApprovalList('rejected', isDark),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceDark : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark ? Colors.white.withValues(alpha: 0.05) : AppTheme.borderLight,
        ),
      ),
      child: Row(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
            ),
          ),
          const SizedBox(width: 4),
          Icon(
            Icons.expand_more,
            size: 16,
            color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
          ),
        ],
      ),
    );
  }

  Widget _buildApprovalList(String type, bool isDark) {
    return Consumer<ApprovalProvider>(
      builder: (context, approvalProvider, _) {
        List<ApprovalRequestModel> filteredApprovals;
        if (type == 'my_requests') {
          // For my requests, filter by current user - this would need current user ID
          filteredApprovals = approvalProvider.approvals; // TODO: Filter by current user
        } else {
          filteredApprovals = approvalProvider.approvals.where((approval) {
            return approval.status == type;
          }).toList();
        }

        if (approvalProvider.isLoading && filteredApprovals.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (approvalProvider.errorMessage != null && filteredApprovals.isEmpty) {
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
                  approvalProvider.errorMessage ?? 'Error loading approvals',
                  style: TextStyle(
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => approvalProvider.refresh(),
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }

        if (filteredApprovals.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.check_circle_outline,
                  size: 64,
                  color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                ),
                const SizedBox(height: 16),
                Text(
                  'No approvals',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppTheme.textDark : AppTheme.textLight,
                  ),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => approvalProvider.refresh(),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: filteredApprovals.length,
            itemBuilder: (context, index) {
              return _buildApprovalCard(filteredApprovals[index], isDark);
            },
          ),
        );
      },
    );
  }

  Widget _buildApprovalCard(ApprovalRequestModel approval, bool isDark) {
    final canApproveReject = approval.status == 'pending';
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceDark : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? Colors.white.withValues(alpha: 0.05) : AppTheme.borderLight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.primaryColor.withValues(alpha: 0.1),
                ),
                child: Center(
                  child: Icon(
                    Icons.person,
                    color: AppTheme.primaryColor,
                    size: 24,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      approval.approvalType.replaceAll('_', ' ').toUpperCase(),
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppTheme.textDark : AppTheme.textLight,
                      ),
                    ),
                    Text(
                      '${approval.requestedByName} • ${_formatDate(approval.createdAt)}',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                      ),
                    ),
                  ],
                ),
              ),
              if (approval.amount != null)
                Text(
                  _formatCurrency(approval.amount!),
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppTheme.textDark : AppTheme.textLight,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          if (approval.notes != null && approval.notes!.isNotEmpty)
            Text(
              approval.notes!,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
              ),
            )
          else
            Text(
              'Purchase Order: ${approval.purchaseOrderNumber}',
              style: TextStyle(
                fontSize: 14,
                color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
              ),
            ),
          if (canApproveReject) ...[
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: () async {
                    final reasonController = TextEditingController();
                    final result = await showDialog<bool>(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Reject Request'),
                        content: TextField(
                          controller: reasonController,
                          decoration: const InputDecoration(
                            labelText: 'Reason for rejection',
                            hintText: 'Enter reason...',
                          ),
                          autofocus: true,
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context, false),
                            child: const Text('Cancel'),
                          ),
                          TextButton(
                            onPressed: () => Navigator.pop(context, true),
                            child: const Text('Reject', style: TextStyle(color: AppTheme.error)),
                          ),
                        ],
                      ),
                    );
                    if (result == true && reasonController.text.isNotEmpty) {
                      if (!mounted) return;
                      final approvalProvider = Provider.of<ApprovalProvider>(context, listen: false);
                      final success = await approvalProvider.rejectRequest(approval.id, reasonController.text);
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(success ? 'Request rejected' : 'Failed to reject request'),
                          backgroundColor: success ? AppTheme.success : AppTheme.error,
                        ),
                      );
                    }
                  },
                  child: const Text('Reject'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () async {
                    if (!mounted) return;
                    final approvalProvider = Provider.of<ApprovalProvider>(context, listen: false);
                    final success = await approvalProvider.approveRequest(approval.id);
                    if (!mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(success ? 'Request approved' : 'Failed to approve request'),
                        backgroundColor: success ? AppTheme.success : AppTheme.error,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                  ),
                  child: const Text('Approve'),
                ),
              ],
            ),
          ] else ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: approval.status == 'approved'
                    ? AppTheme.success.withValues(alpha: 0.1)
                    : AppTheme.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                approval.status.toUpperCase(),
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: approval.status == 'approved' ? AppTheme.success : AppTheme.error,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

}
