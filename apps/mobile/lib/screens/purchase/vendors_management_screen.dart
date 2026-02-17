import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/providers/vendor_provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/models/vendor_model.dart';
import 'package:intl/intl.dart';

/// Vendors Management Screen
class VendorsManagementScreen extends StatefulWidget {
  const VendorsManagementScreen({super.key});

  @override
  State<VendorsManagementScreen> createState() => _VendorsManagementScreenState();
}

class _VendorsManagementScreenState extends State<VendorsManagementScreen> {
  final _searchController = TextEditingController();
  String _selectedSort = 'name';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<VendorProvider>(context, listen: false).loadVendors();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    final provider = Provider.of<VendorProvider>(context, listen: false);
    if (query.isEmpty) {
      provider.clearSearch();
    } else {
      provider.searchVendors(query);
    }
  }

  void _showSortOptions(BuildContext context, bool isDark) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: BoxDecoration(
          color: isDark ? AppTheme.surfaceDark : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Sort By',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppTheme.textDark : AppTheme.textLight,
                  ),
                ),
              ),
              _buildSortOption(context, 'name', 'Name', isDark),
              _buildSortOption(context, 'email', 'Email', isDark),
              _buildSortOption(context, 'total_spent', 'Total Spent', isDark),
              SizedBox(height: MediaQuery.of(context).padding.bottom),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSortOption(BuildContext context, String value, String label, bool isDark) {
    final provider = Provider.of<VendorProvider>(context, listen: false);
    final isSelected = _selectedSort == value;
    
    return ListTile(
      title: Text(
        label,
        style: TextStyle(
          color: isDark ? AppTheme.textDark : AppTheme.textLight,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      trailing: isSelected
          ? Icon(Icons.check, color: AppTheme.primaryColor)
          : null,
      onTap: () {
        setState(() {
          _selectedSort = value;
        });
        provider.setSortBy(value);
        Navigator.pop(context);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Vendors'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.sort),
            onPressed: () => _showSortOptions(context, isDark),
            tooltip: 'Sort',
          ),
        ],
      ),
      body: Consumer<VendorProvider>(
        builder: (context, vendorProvider, child) {
          if (vendorProvider.isLoading && vendorProvider.allVendors.isEmpty) {
            return Center(
              child: CircularProgressIndicator(
                color: AppTheme.primaryColor,
              ),
            );
          }

          if (vendorProvider.errorMessage != null && vendorProvider.allVendors.isEmpty) {
            final authProvider = Provider.of<AuthProvider>(context, listen: false);
            final userRole = authProvider.currentUser?.role ?? 'unknown';
            final isPermissionError = vendorProvider.errorMessage?.toLowerCase().contains('permission') ?? false;
            
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      isPermissionError ? Icons.lock_outline : Icons.error_outline,
                      size: 64,
                      color: AppTheme.error,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      vendorProvider.errorMessage ?? 'Failed to load vendors',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppTheme.textDark : AppTheme.textLight,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    if (isPermissionError) ...[
                      const SizedBox(height: 12),
                      Text(
                        'Your current role: $userRole\n\nThis feature requires one of these roles:\n• Accountant\n• CFO\n• Firm Admin\n• Tenant Admin\n• Platform Admin',
                        style: TextStyle(
                          fontSize: 14,
                          color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => vendorProvider.loadVendors(forceRefresh: true),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                      ),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search vendors...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              vendorProvider.clearSearch();
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: isDark ? AppTheme.surfaceDark : Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.1)
                            : AppTheme.borderLight,
                      ),
                    ),
                  ),
                  onChanged: _onSearchChanged,
                ),
              ),
              if (vendorProvider.vendors.isEmpty && !vendorProvider.isLoading)
                Expanded(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.store_outlined,
                          size: 64,
                          color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          vendorProvider.searchQuery.isNotEmpty
                              ? 'No vendors found'
                              : 'No vendors yet',
                          style: TextStyle(
                            fontSize: 16,
                            color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: () => vendorProvider.loadVendors(forceRefresh: true),
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: vendorProvider.vendors.length,
                      itemBuilder: (context, index) {
                        final vendor = vendorProvider.vendors[index];
                        return _buildVendorItem(vendor, isDark);
                      },
                    ),
                  ),
                ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Add vendor functionality coming soon')),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildVendorItem(VendorModel vendor, bool isDark) {
    final formatter = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    
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
          CircleAvatar(
            backgroundColor: AppTheme.warning.withValues(alpha: 0.1),
            child: Text(
              vendor.name[0].toUpperCase(),
              style: TextStyle(
                color: AppTheme.warning,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  vendor.name,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppTheme.textDark : AppTheme.textLight,
                  ),
                ),
                if (vendor.email != null && vendor.email!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    vendor.email!,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                    ),
                  ),
                ],
                if (vendor.totalSpent != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Total Spent: ${formatter.format(vendor.totalSpent)}',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTheme.info,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ],
            ),
          ),
          Icon(
            Icons.chevron_right,
            color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
          ),
        ],
      ),
    );
  }
}
