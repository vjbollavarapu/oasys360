import 'package:flutter/material.dart';
import 'transactions_screen.dart';

/// Banking Transactions Screen
class BankingTransactionsScreen extends StatelessWidget {
  final String? accountId;
  
  const BankingTransactionsScreen({super.key, this.accountId});

  @override
  Widget build(BuildContext context) {
    // Get accountId from route arguments if not provided directly
    final routeAccountId = accountId ?? 
        (ModalRoute.of(context)?.settings.arguments as String?);
    
    return TransactionsScreen(accountId: routeAccountId);
  }
}
