import 'dart:io';
import 'package:flutter/material.dart';
import '../../screens/auth/login_screen.dart';
import '../../screens/auth/forgot_password_screen.dart';
import '../../screens/auth/change_password_screen.dart';
import '../../screens/dashboard/dashboard_screen.dart';
import '../../screens/dashboard/dashboard2_screen.dart';
import '../../screens/dashboard/detailed_dashboard_screen.dart';
import '../../screens/expenses/expense_tracking_screen.dart';
import '../../screens/expenses/receipt_scanner_screen.dart';
import '../../screens/expenses/receipt_review_screen.dart';
import '../../screens/invoices/invoices_management_screen.dart';
import '../../screens/invoices/invoice_creation_screen.dart';
import '../../screens/invoices/invoice_list_management_screen.dart';
import '../../screens/approvals/approvals_management_screen.dart';
import '../../screens/notifications/notifications_screen.dart';
import '../../screens/settings/settings_screen.dart';
import '../../screens/offline/offline_mode1_screen.dart';
import '../../screens/offline/offline_mode2_screen.dart';
import '../../screens/accounting/chart_of_accounts_screen.dart';
import '../../screens/accounting/journal_entries_screen.dart';
import '../../screens/accounting/accounts_screen.dart';
import '../../screens/banking/bank_accounts_overview_screen.dart';
import '../../screens/banking/banking_transactions_screen.dart';
import '../../screens/banking/transactions_screen.dart';
import '../../screens/inventory/inventory_items_management_screen.dart';
import '../../screens/inventory/barcode_scanner_screen.dart';
import '../../screens/sales/customers_management_screen.dart';
import '../../screens/sales/sales_orders_screen.dart';
import '../../screens/purchase/vendors_management_screen.dart';
import '../../screens/reports/reports_screen.dart';
import '../../screens/reports/report_viewer_export_screen.dart';
import '../routes/app_routes.dart';

class AppRouter {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case AppRoutes.login:
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      case AppRoutes.forgotPassword:
        return MaterialPageRoute(builder: (_) => const ForgotPasswordScreen());
      case AppRoutes.changePassword:
        return MaterialPageRoute(builder: (_) => const ChangePasswordScreen());
      case AppRoutes.dashboard:
        return MaterialPageRoute(builder: (_) => const DashboardScreen());
      case AppRoutes.dashboard2:
        return MaterialPageRoute(builder: (_) => const Dashboard2Screen());
      case AppRoutes.detailedDashboard:
        return MaterialPageRoute(builder: (_) => const DetailedDashboardScreen());
      case AppRoutes.expenses:
        return MaterialPageRoute(builder: (_) => const ExpenseTrackingScreen());
      case AppRoutes.receiptScanner:
        return MaterialPageRoute(builder: (_) => const ReceiptScannerScreen());
      case AppRoutes.receiptReview:
        final image = settings.arguments as File;
        return MaterialPageRoute(
          builder: (_) => ReceiptReviewScreen(receiptImage: image),
        );
      case AppRoutes.invoices:
        return MaterialPageRoute(builder: (_) => const InvoicesManagementScreen());
      case AppRoutes.invoiceCreation:
        return MaterialPageRoute(builder: (_) => const InvoiceCreationScreen());
      case AppRoutes.invoiceList:
        return MaterialPageRoute(builder: (_) => const InvoiceListManagementScreen());
      case AppRoutes.approvals:
        return MaterialPageRoute(builder: (_) => const ApprovalsManagementScreen());
      case AppRoutes.notifications:
        return MaterialPageRoute(builder: (_) => const NotificationsScreen());
      case AppRoutes.settings:
        return MaterialPageRoute(builder: (_) => const SettingsScreen());
      case AppRoutes.offlineMode1:
        return MaterialPageRoute(builder: (_) => const OfflineMode1Screen());
      case AppRoutes.offlineMode2:
        return MaterialPageRoute(builder: (_) => const OfflineMode2Screen());
      case AppRoutes.chartOfAccounts:
        return MaterialPageRoute(builder: (_) => const ChartOfAccountsScreen());
      case AppRoutes.journalEntries:
        return MaterialPageRoute(builder: (_) => const JournalEntriesScreen());
      case AppRoutes.accounts:
        return MaterialPageRoute(builder: (_) => const AccountsScreen());
      case AppRoutes.bankAccounts:
        return MaterialPageRoute(builder: (_) => const BankAccountsOverviewScreen());
      case AppRoutes.bankingTransactions:
        return MaterialPageRoute(builder: (_) => const BankingTransactionsScreen());
      case AppRoutes.transactions:
        return MaterialPageRoute(builder: (_) => const TransactionsScreen());
      case AppRoutes.inventoryItems:
        return MaterialPageRoute(builder: (_) => const InventoryItemsManagementScreen());
      case AppRoutes.barcodeScanner:
        return MaterialPageRoute(builder: (_) => const BarcodeScannerScreen());
      case AppRoutes.customers:
        return MaterialPageRoute(builder: (_) => const CustomersManagementScreen());
      case AppRoutes.salesOrders:
        return MaterialPageRoute(builder: (_) => const SalesOrdersScreen());
      case AppRoutes.vendors:
        return MaterialPageRoute(builder: (_) => const VendorsManagementScreen());
      case AppRoutes.reports:
        return MaterialPageRoute(builder: (_) => const ReportsScreen());
      case AppRoutes.reportViewer:
        return MaterialPageRoute(builder: (_) => const ReportViewerExportScreen());
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('Route ${settings.name} not found'),
            ),
          ),
        );
    }
  }
}

