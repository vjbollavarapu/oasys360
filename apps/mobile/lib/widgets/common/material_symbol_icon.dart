import 'package:flutter/material.dart';

/// Material Symbols Icon Widget
/// Uses Material Icons from Flutter as substitute for Material Symbols
/// Note: You may need to use a custom icon font for exact Material Symbols
class MaterialSymbolIcon extends StatelessWidget {
  final String icon;
  final double? size;
  final Color? color;
  final bool filled;

  const MaterialSymbolIcon(
    this.icon, {
    super.key,
    this.size,
    this.color,
    this.filled = false,
  });

  @override
  Widget build(BuildContext context) {
    // Map Material Symbols to Material Icons
    final iconData = _mapIcon(icon);
    
    return Icon(
      iconData,
      size: size ?? 24,
      color: color ?? Theme.of(context).iconTheme.color,
    );
  }

  IconData _mapIcon(String iconName) {
    // Map common Material Symbols to Material Icons
    // This is a basic mapping - you may want to use a custom icon font for exact matches
    switch (iconName) {
      case 'notifications':
        return Icons.notifications_outlined;
      case 'account_balance_wallet':
        return Icons.account_balance_wallet_outlined;
      case 'trending_up':
        return Icons.trending_up;
      case 'credit_card':
        return Icons.credit_card_outlined;
      case 'receipt_long':
        return Icons.receipt_long_outlined;
      case 'send':
        return Icons.send_outlined;
      case 'check_circle':
        return Icons.check_circle_outlined;
      case 'qr_code_scanner':
        return Icons.qr_code_scanner;
      case 'more_horiz':
        return Icons.more_horiz;
      case 'priority_high':
        return Icons.priority_high;
      case 'dashboard':
        return filled ? Icons.dashboard : Icons.dashboard_outlined;
      case 'bar_chart':
        return Icons.bar_chart_outlined;
      case 'add':
        return Icons.add;
      case 'settings':
        return Icons.settings_outlined;
      case 'search':
        return Icons.search;
      case 'tune':
        return Icons.tune;
      case 'expand_more':
        return Icons.expand_more;
      case 'cloud':
        return Icons.cloud_outlined;
      case 'payments':
        return Icons.payments_outlined;
      case 'flight':
        return Icons.flight_outlined;
      default:
        return Icons.help_outline;
    }
  }
}

