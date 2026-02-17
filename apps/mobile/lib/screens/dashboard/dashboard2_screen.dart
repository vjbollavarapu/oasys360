import 'package:flutter/material.dart';
import 'dashboard_screen.dart';

/// Dashboard 2 Screen - Alternative dashboard view
class Dashboard2Screen extends StatelessWidget {
  const Dashboard2Screen({super.key});

  @override
  Widget build(BuildContext context) {
    // For now, redirect to main dashboard since they're similar
    return const DashboardScreen();
  }
}
