import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'core/routes/app_router.dart';
import 'core/routes/app_routes.dart';
import 'core/providers/auth_provider.dart';
import 'core/providers/dashboard_provider.dart';
import 'core/providers/expense_provider.dart';
import 'core/providers/invoice_provider.dart';
import 'core/providers/approval_provider.dart';
import 'core/providers/notification_provider.dart';
import 'core/providers/banking_provider.dart';
import 'core/providers/customer_provider.dart';
import 'core/providers/vendor_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set API base URL (can be configured from environment variables)
  // For development, default is http://localhost:8000
  // For production, this should be set via environment variable or config file
  // ApiConfig.setBaseUrl('https://your-production-api.com');
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
        ChangeNotifierProvider(create: (_) => ExpenseProvider()),
        ChangeNotifierProvider(create: (_) => InvoiceProvider()),
        ChangeNotifierProvider(create: (_) => ApprovalProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
        ChangeNotifierProvider(create: (_) => BankingProvider()),
        ChangeNotifierProvider(create: (_) => CustomerProvider()),
        ChangeNotifierProvider(create: (_) => VendorProvider()),
      ],
      child: const Oasys360App(),
    ),
  );
}

class Oasys360App extends StatelessWidget {
  const Oasys360App({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return MaterialApp(
          title: 'OASYS360',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme.copyWith(
            textTheme: GoogleFonts.manropeTextTheme(AppTheme.lightTheme.textTheme),
          ),
          darkTheme: AppTheme.darkTheme.copyWith(
            textTheme: GoogleFonts.manropeTextTheme(AppTheme.darkTheme.textTheme),
          ),
          themeMode: themeProvider.themeMode,
          initialRoute: AppRoutes.login,
          onGenerateRoute: AppRouter.generateRoute,
        );
      },
    );
  }
}
