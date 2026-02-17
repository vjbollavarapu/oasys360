import 'package:flutter/material.dart';
import 'invoices_management_screen.dart';

/// Invoice List Management Screen
/// Similar to Invoices Management but with list-focused view
class InvoiceListManagementScreen extends StatelessWidget {
  const InvoiceListManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Redirect to main invoices screen since they're similar
    return const InvoicesManagementScreen();
  }
}
