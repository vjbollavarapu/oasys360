#!/usr/bin/env python3
"""
HTML to Flutter Converter Script
Converts HTML files from stitch_transactions to Flutter Dart screens
"""

import os
import re
from pathlib import Path

def convert_html_to_flutter(html_file_path, output_dir):
    """Convert an HTML file to a Flutter screen widget"""
    
    with open(html_file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Extract screen name from path
    screen_name = Path(html_file_path).stem
    # Convert to Dart class name (CamelCase)
    class_name = ''.join(word.capitalize() for word in screen_name.split('_'))
    class_name = class_name.replace('-', '')
    # Convert to file name (snake_case)
    file_name = re.sub(r'(?<!^)(?=[A-Z])', '_', class_name).lower()
    
    # Basic template
    dart_code = f'''import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';

/// {class_name} Screen
/// Converted from stitch_transactions/{Path(html_file_path).parent.name}/code.html
class {class_name}Screen extends StatefulWidget {{
  const {class_name}Screen({{super.key}});

  @override
  State<{class_name}Screen> createState() => _{class_name}ScreenState();
}}

class _{class_name}ScreenState extends State<{class_name}Screen> {{
  @override
  Widget build(BuildContext context) {{
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // TODO: Convert HTML structure to Flutter widgets
            // Reference: lib/utils/html_to_flutter_converter.md
            SliverToBoxAdapter(
              child: Center(
                child: Text(
                  '{class_name} Screen',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppTheme.textDark : AppTheme.textLight,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }}
}}
'''
    
    # Write to output file
    output_file = output_dir / f'{file_name}_screen.dart'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(dart_code)
    
    return output_file

def main():
    """Main conversion function"""
    script_dir = Path(__file__).parent
    stitch_dir = script_dir / 'stitch_transactions'
    output_base = script_dir / 'lib' / 'screens'
    
    # Find all HTML files
    html_files = list(stitch_dir.rglob('code.html'))
    
    print(f'Found {len(html_files)} HTML files to convert')
    
    # Screen name mappings
    screen_mappings = {
        'dashboard_1': ('dashboard', 'Dashboard'),
        'dashboard_2': ('dashboard', 'Dashboard2'),
        'detailed_dashboard': ('dashboard', 'DetailedDashboard'),
        'expense_tracking': ('expenses', 'ExpenseTracking'),
        'invoices_management': ('invoices', 'InvoicesManagement'),
        'invoice_creation': ('invoices', 'InvoiceCreation'),
        'invoice_list_management': ('invoices', 'InvoiceListManagement'),
        'approvals_management': ('approvals', 'ApprovalsManagement'),
        'notifications': ('notifications', 'Notifications'),
        'offline_mode_1': ('offline', 'OfflineMode1'),
        'offline_mode_2': ('offline', 'OfflineMode2'),
        'settings_1': ('settings', 'Settings1'),
        'settings_2': ('settings', 'Settings2'),
        'chart_of_accounts': ('accounting', 'ChartOfAccounts'),
        'journal_entries': ('accounting', 'JournalEntries'),
        'accounts': ('accounting', 'Accounts'),
        'bank_accounts_overview': ('banking', 'BankAccountsOverview'),
        'banking_transactions': ('banking', 'BankingTransactions'),
        'transactions': ('banking', 'Transactions'),
        'inventory_items_management': ('inventory', 'InventoryItemsManagement'),
        'barcode_scanner': ('inventory', 'BarcodeScanner'),
        'customers_management': ('sales', 'CustomersManagement'),
        'sales_orders': ('sales', 'SalesOrders'),
        'reports': ('reports', 'Reports'),
        'report_viewer_&_export': ('reports', 'ReportViewerExport'),
    }
    
    converted = []
    
    for html_file in html_files:
        folder_name = html_file.parent.name
        
        if folder_name in screen_mappings:
            module, class_name = screen_mappings[folder_name]
            output_dir = output_base / module
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Read HTML to analyze structure
            with open(html_file, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # Generate Dart code
            file_name = re.sub(r'(?<!^)(?=[A-Z])', '_', class_name).lower()
            
            # Check if file already exists (skip if converted manually)
            output_file = output_dir / f'{file_name}_screen.dart'
            if output_file.exists():
                print(f'⚠️  Skipping {folder_name} - already exists')
                continue
            
            # Basic template - user needs to manually complete
            dart_code = f'''import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';

/// {class_name} Screen
/// Converted from stitch_transactions/{folder_name}/code.html
/// 
/// TODO: Complete the conversion by:
/// 1. Reading the HTML structure from stitch_transactions/{folder_name}/code.html
/// 2. Converting HTML elements to Flutter widgets
/// 3. Using the conversion guide: lib/utils/html_to_flutter_converter.md
/// 4. Testing dark/light/system theme modes
class {class_name}Screen extends StatefulWidget {{
  const {class_name}Screen({{super.key}});

  @override
  State<{class_name}Screen> createState() => _{class_name}ScreenState();
}}

class _{class_name}ScreenState extends State<{class_name}Screen> {{
  @override
  Widget build(BuildContext context) {{
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('{class_name}'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.info_outline,
                size: 64,
                color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
              ),
              const SizedBox(height: 16),
              Text(
                '{class_name} Screen',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppTheme.textDark : AppTheme.textLight,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'TODO: Convert HTML to Flutter widgets',
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Reference: stitch_transactions/{folder_name}/code.html',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppTheme.textMutedDark : AppTheme.textMutedLight,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }}
}}
'''
            
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(dart_code)
            
            converted.append((folder_name, output_file))
            print(f'✅ Created stub for {folder_name} -> {output_file.name}')
        else:
            print(f'⚠️  Skipping {folder_name} - no mapping found')
    
    print(f'\\n✅ Created {len(converted)} screen stubs')
    print('\\n📝 Next steps:')
    print('   1. Review each stub file')
    print('   2. Convert HTML structure using the conversion guide')
    print('   3. Test dark/light/system theme modes')
    print('   4. Implement navigation between screens')

if __name__ == '__main__':
    main()

