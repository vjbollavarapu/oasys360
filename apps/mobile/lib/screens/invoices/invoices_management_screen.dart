import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/routes/app_routes.dart';
import '../../core/providers/invoice_provider.dart';
import '../../core/models/invoice_models.dart';

/// Invoices Management Screen
/// Converted from stitch_transactions/invoices_management/code.html
class InvoicesManagementScreen extends StatefulWidget {
  const InvoicesManagementScreen({super.key});

  @override
  State<InvoicesManagementScreen> createState() => _InvoicesManagementScreenState();
}

class _InvoicesManagementScreenState extends State<InvoicesManagementScreen>
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
        // Load invoices for the selected tab
        _loadInvoicesForTab(_tabController.index);
      }
    });
    // Load initial invoices
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadInvoicesForTab(0);
    });
  }

  void _loadInvoicesForTab(int tabIndex) {
    final invoiceProvider = Provider.of<InvoiceProvider>(context, listen: false);
    String? status;
    switch (tabIndex) {
      case 0: // Sent
        status = 'sent';
        break;
      case 1: // Received (paid)
        status = 'paid';
        break;
      case 2: // Drafts
        status = 'draft';
        break;
      case 3: // Overdue
        invoiceProvider.loadInvoices(refresh: true, status: 'overdue');
        return;
      default:
        break;
    }
    invoiceProvider.loadInvoices(refresh: true, status: status);
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    return formatter.format(amount);
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final invoiceDate = DateTime(date.year, date.month, date.day);
    final diff = invoiceDate.difference(today).inDays;

    if (diff == 0) {
      return 'Today';
    } else if (diff == 1) {
      return 'Tomorrow';
    } else if (diff == -1) {
      return 'Yesterday';
    } else if (diff < 0 && diff >= -7) {
      return '${diff.abs()} days ago';
    } else if (diff > 0 && diff <= 7) {
      return 'In $diff days';
    } else {
      return DateFormat('MMM d, yyyy').format(date);
    }
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
        title: const Text('Invoices'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
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
      body: SafeArea(
        child: Column(
          children: [
            // Tabs
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TabBar(
                controller: _tabController,
                indicator: UnderlineTabIndicator(
                  borderSide: BorderSide(
                    color: AppTheme.primaryColor,
                    width: 2,
                  ),
                ),
                labelColor: AppTheme.primaryColor,
                unselectedLabelColor: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                tabs: const [
                  Tab(text: 'Sent'),
                  Tab(text: 'Received'),
                  Tab(text: 'Drafts'),
                  Tab(text: 'Overdue'),
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
                    _buildFilterChip('Date: Newest', isDark, isSelected: false),
                    const SizedBox(width: 8),
                    _buildFilterChip('All Status', isDark, isSelected: true),
                    const SizedBox(width: 8),
                    _buildFilterChip('This Month', isDark, isSelected: false),
                    const SizedBox(width: 8),
                    _buildFilterChip('High Amount', isDark, isSelected: false),
                  ],
                ),
              ),
            ),
            
            // Invoice List
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildInvoiceList('sent', isDark),
                  _buildInvoiceList('paid', isDark),
                  _buildInvoiceList('draft', isDark),
                  _buildInvoiceList('overdue', isDark),
                ],
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.pushNamed(context, AppRoutes.invoiceCreation);
        },
        backgroundColor: AppTheme.primaryColor,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text(
          'New Invoice',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isDark, {bool isSelected = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isSelected
            ? AppTheme.primaryColor
            : (isDark ? AppTheme.surfaceDark : const Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: isSelected
                  ? Colors.white
                  : (isDark ? AppTheme.textSecondaryDark : const Color(0xFF475569)),
            ),
          ),
          if (isSelected) ...[
            const SizedBox(width: 4),
            const Icon(Icons.expand_more, size: 16, color: Colors.white),
          ],
        ],
      ),
    );
  }

  Widget _buildInvoiceList(String type, bool isDark) {
    return Consumer<InvoiceProvider>(
      builder: (context, invoiceProvider, _) {
        // Filter invoices by status
        List<InvoiceModel> filteredInvoices;
        if (type == 'overdue') {
          // For overdue, we need to check due_date < today and status != 'paid'
          filteredInvoices = invoiceProvider.invoices.where((invoice) {
            return invoice.status != 'paid' && invoice.dueDate.isBefore(DateTime.now());
          }).toList();
        } else {
          filteredInvoices = invoiceProvider.invoices.where((invoice) {
            return invoice.status == type;
          }).toList();
        }

        if (invoiceProvider.isLoading && filteredInvoices.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (invoiceProvider.errorMessage != null && filteredInvoices.isEmpty) {
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
                  invoiceProvider.errorMessage ?? 'Error loading invoices',
                  style: TextStyle(
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => invoiceProvider.refresh(),
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }

        if (filteredInvoices.isEmpty) {
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
                  'No invoices found',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppTheme.textDark : AppTheme.textLight,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Create your first invoice to get started',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                  ),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => invoiceProvider.refresh(),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: filteredInvoices.length + (invoiceProvider.hasMore && type == invoiceProvider.selectedStatus ? 1 : 0),
            itemBuilder: (context, index) {
              if (index == filteredInvoices.length) {
                // Load more trigger
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  invoiceProvider.loadMore();
                });
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.all(16.0),
                    child: CircularProgressIndicator(),
                  ),
                );
              }
              return _buildInvoiceCard(filteredInvoices[index], isDark);
            },
          ),
        );
      },
    );
  }

  Widget _buildInvoiceCard(InvoiceModel invoice, bool isDark) {
    final status = invoice.status;
    final statusColor = _getStatusColor(status, isDark);
    final isOverdue = status != 'paid' && invoice.dueDate.isBefore(DateTime.now());
    final effectiveStatus = isOverdue ? 'overdue' : status;
    
    return InkWell(
      onTap: () {
        // TODO: Navigate to invoice details screen when created
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Invoice: ${invoice.invoiceNumber}')),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceDark : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isOverdue
              ? AppTheme.error
              : (isDark
                  ? Colors.white.withValues(alpha: 0.05)
                  : const Color(0xFFE2E8F0)),
          width: isOverdue ? 4 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: statusColor.withValues(alpha: 0.2)),
                ),
                child: Row(
                  children: [
                    Icon(
                      _getStatusIcon(status),
                      size: 14,
                      color: statusColor,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      effectiveStatus.toUpperCase(),
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: statusColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          // Invoice Number
          Text(
            invoice.invoiceNumber,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
            ),
          ),
          
          const SizedBox(height: 8),
          
          // Client Info
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.primaryColor,
                      AppTheme.primaryColor.withValues(alpha: 0.7),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(
                    invoice.customerName.isNotEmpty 
                        ? invoice.customerName[0].toUpperCase()
                        : 'I',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      invoice.customerName,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppTheme.textDark : AppTheme.textLight,
                      ),
                    ),
                    if (invoice.notes != null && invoice.notes!.isNotEmpty)
                      Text(
                        invoice.notes!,
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                  ],
                ),
              ),
            ],
          ),
          
          const Divider(height: 32),
          
          // Due Date and Amount
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'DUE DATE',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        _getDueDateIcon(effectiveStatus),
                        size: 16,
                        color: isOverdue
                            ? AppTheme.error
                            : (invoice.dueDate.difference(DateTime.now()).inDays <= 3 && invoice.dueDate.difference(DateTime.now()).inDays >= 0
                                ? AppTheme.warning
                                : (isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight)),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _formatDate(invoice.dueDate),
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: isOverdue
                              ? AppTheme.error
                              : (invoice.dueDate.difference(DateTime.now()).inDays <= 3 && invoice.dueDate.difference(DateTime.now()).inDays >= 0
                                  ? AppTheme.warning
                                  : (isDark ? AppTheme.textDark : AppTheme.textLight)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Text(
                _formatCurrency(invoice.totalAmount),
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppTheme.textDark : AppTheme.textLight,
                ),
              ),
            ],
          ),
        ],
      ),
      ),
    );
  }

  Color _getStatusColor(String status, bool isDark) {
    switch (status.toLowerCase()) {
      case 'paid':
        return AppTheme.success;
      case 'overdue':
        return AppTheme.error;
      case 'sent':
      case 'viewed':
        return AppTheme.primaryColor;
      case 'draft':
        return isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight;
      default:
        return AppTheme.primaryColor;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return Icons.check_circle;
      case 'overdue':
        return Icons.error;
      case 'sent':
      case 'viewed':
        return Icons.send;
      case 'draft':
        return Icons.edit_note;
      default:
        return Icons.receipt_long;
    }
  }

  IconData _getDueDateIcon(String status) {
    switch (status.toLowerCase()) {
      case 'overdue':
        return Icons.event_busy;
      default:
        return Icons.calendar_month;
    }
  }
}
