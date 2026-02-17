import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';

/// Barcode Scanner Screen
class BarcodeScannerScreen extends StatefulWidget {
  const BarcodeScannerScreen({super.key});

  @override
  State<BarcodeScannerScreen> createState() => _BarcodeScannerScreenState();
}

class _BarcodeScannerScreenState extends State<BarcodeScannerScreen> {
  bool _flashOn = false;

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    // For scanner screens, we use dark background but make AppBar theme-aware
    final appBarBgColor = isDark 
        ? AppTheme.surfaceDark.withValues(alpha: 0.9)
        : Colors.black.withValues(alpha: 0.8);
    final appBarTextColor = Colors.white; // Always white for visibility on dark scanner background
    
    return Scaffold(
      backgroundColor: Colors.black,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(
          'Scan Barcode',
          style: TextStyle(
            color: appBarTextColor,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: appBarBgColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
          color: appBarTextColor,
        ),
        iconTheme: IconThemeData(color: appBarTextColor),
      ),
      body: Stack(
        children: [
          // Camera view placeholder
          Center(
            child: Container(
              width: double.infinity,
              height: double.infinity,
              color: Colors.black,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 250,
                    height: 250,
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.primaryColor, width: 3),
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    'Position barcode within frame',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Bottom controls
          Positioned(
            bottom: 32,
            left: 0,
            right: 0,
            child: Column(
              children: [
                IconButton(
                  icon: Icon(
                    _flashOn ? Icons.flash_off : Icons.flash_on,
                    size: 48,
                    color: Colors.white,
                  ),
                  onPressed: () {
                    setState(() {
                      _flashOn = !_flashOn;
                    });
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(_flashOn ? 'Flash ON' : 'Flash OFF'),
                        duration: const Duration(seconds: 1),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor,
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.qr_code_scanner, color: Colors.white, size: 32),
                    onPressed: () {
                      // TODO: Implement actual barcode scanning when camera integration is ready
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Barcode scanning coming soon'),
                          duration: Duration(seconds: 2),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () {
                    // Show manual entry dialog
                    showDialog(
                      context: context,
                      builder: (context) {
                        final controller = TextEditingController();
                        return AlertDialog(
                          title: const Text('Enter Barcode Manually'),
                          content: TextField(
                            controller: controller,
                            decoration: const InputDecoration(
                              labelText: 'Barcode',
                              hintText: 'Enter barcode number',
                            ),
                            autofocus: true,
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context),
                              child: const Text('Cancel'),
                            ),
                            TextButton(
                              onPressed: () {
                                if (controller.text.isNotEmpty) {
                                  Navigator.pop(context);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('Barcode: ${controller.text}'),
                                    ),
                                  );
                                }
                              },
                              child: const Text('Submit'),
                            ),
                          ],
                        );
                      },
                    );
                  },
                  child: const Text(
                    'Enter Manually',
                    style: TextStyle(color: Colors.white, fontSize: 16),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
