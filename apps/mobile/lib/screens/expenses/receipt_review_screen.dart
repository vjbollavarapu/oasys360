import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:path/path.dart' as path;
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/routes/app_routes.dart';

/// Receipt Review Screen - Review and edit OCR extracted data
class ReceiptReviewScreen extends StatefulWidget {
  final File receiptImage;

  const ReceiptReviewScreen({
    super.key,
    required this.receiptImage,
  });

  @override
  State<ReceiptReviewScreen> createState() => _ReceiptReviewScreenState();
}

class _ReceiptReviewScreenState extends State<ReceiptReviewScreen> {
  final _formKey = GlobalKey<FormState>();
  
  bool _isProcessing = true;
  bool _isSaving = false;
  
  // Extracted data
  final _merchantController = TextEditingController();
  final _amountController = TextEditingController();
  final _dateController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _categoryController = TextEditingController();
  String? _selectedCategory;
  
  final List<String> _categories = [
    'Food & Beverage',
    'Transportation',
    'Office Supplies',
    'Travel',
    'Entertainment',
    'Utilities',
    'Other',
  ];

  @override
  void initState() {
    super.initState();
    _processReceipt();
  }

  @override
  void dispose() {
    _merchantController.dispose();
    _amountController.dispose();
    _dateController.dispose();
    _descriptionController.dispose();
    _categoryController.dispose();
    super.dispose();
  }

  Future<void> _processReceipt() async {
    setState(() {
      _isProcessing = true;
    });

    try {
      // Create multipart form data
      // ignore: unused_local_variable
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          widget.receiptImage.path,
          filename: path.basename(widget.receiptImage.path),
        ),
      });

      // TODO: Replace with actual backend OCR endpoint
      // For now, simulate API call
      await Future.delayed(const Duration(seconds: 2));
      
      // Mock OCR response - Replace with actual API call:
      /*
      final response = await _dio.post(
        'https://your-backend.com/api/v1/expenses/ocr/scan/',
        data: formData,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token', // Add auth token
          },
        ),
      );
      
      final ocrData = response.data;
      */
      
      // Simulated extracted data (remove when backend is ready)
      final ocrData = {
        'merchant': 'Restaurant Name',
        'date': '2024-12-24',
        'total': '45.99',
        'tax': '4.14',
        'subtotal': '41.85',
        'category': 'Food & Beverage',
        'items': [
          {'description': 'Burger', 'quantity': 2, 'price': 15.99},
          {'description': 'Fries', 'quantity': 1, 'price': 4.99},
        ],
        'confidence': 0.95,
      };

      setState(() {
        _merchantController.text = (ocrData['merchant'] as String?) ?? '';
        _amountController.text = (ocrData['total']?.toString()) ?? '';
        _dateController.text = (ocrData['date'] as String?) ?? '';
        _categoryController.text = (ocrData['category'] as String?) ?? '';
        _selectedCategory = ocrData['category'] as String?;
        _descriptionController.text = _buildDescriptionFromItems(ocrData['items']);
        _isProcessing = false;
      });
    } catch (e) {
      setState(() {
        _isProcessing = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error processing receipt: ${e.toString()}'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  String _buildDescriptionFromItems(dynamic items) {
    if (items == null || (items is List && items.isEmpty)) {
      return '';
    }
    
    if (items is List) {
      return items.map((item) => 
        '${item['description'] ?? ''} x${item['quantity'] ?? 1}'
      ).join(', ');
    }
    
    return '';
  }

  Future<void> _saveExpense() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSaving = true;
    });

    try {
      // Create form data with expense details
      // ignore: unused_local_variable
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          widget.receiptImage.path,
          filename: path.basename(widget.receiptImage.path),
        ),
        'merchant': _merchantController.text,
        'amount': double.parse(_amountController.text),
        'date': _dateController.text,
        'category': _selectedCategory ?? _categoryController.text,
        'description': _descriptionController.text.isEmpty
            ? 'Expense from receipt'
            : _descriptionController.text,
      });

      // TODO: Replace with actual backend endpoint
      // For now, simulate API call
      await Future.delayed(const Duration(seconds: 1));
      
      // Actual API call (uncomment when backend is ready):
      /*
      final response = await _dio.post(
        'https://your-backend.com/api/v1/accounting/journal-entries/',
        data: formData,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token', // Add auth token
            'Content-Type': 'multipart/form-data',
          },
        ),
      );
      */

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Expense saved successfully!'),
            backgroundColor: AppTheme.success,
          ),
        );
        
        // Navigate back to expenses screen
        Navigator.pushNamedAndRemoveUntil(
          context,
          AppRoutes.expenses,
          (route) => route.settings.name == AppRoutes.dashboard || 
                     route.settings.name == AppRoutes.expenses,
        );
      }
    } catch (e) {
      setState(() {
        _isSaving = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error saving expense: ${e.toString()}'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Review Receipt'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _isProcessing
          ? _buildProcessingView(isDark)
          : _buildReviewForm(isDark),
    );
  }

  Widget _buildProcessingView(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 24),
          Text(
            'Processing receipt...',
            style: TextStyle(
              fontSize: 16,
              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Extracting information from receipt',
            style: TextStyle(
              fontSize: 14,
              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewForm(bool isDark) {
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Receipt Image Preview
          Container(
            height: 200,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isDark ? Colors.white.withValues(alpha: 0.1) : AppTheme.borderLight,
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(
                widget.receiptImage,
                fit: BoxFit.cover,
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Merchant Name
          TextFormField(
            controller: _merchantController,
            decoration: InputDecoration(
              labelText: 'Merchant Name *',
              hintText: 'Restaurant/store name',
              prefixIcon: const Icon(Icons.store_outlined),
              filled: true,
              fillColor: isDark ? AppTheme.surfaceDark : Colors.white,
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter merchant name';
              }
              return null;
            },
          ),
          
          const SizedBox(height: 16),
          
          // Amount
          TextFormField(
            controller: _amountController,
            decoration: InputDecoration(
              labelText: 'Amount *',
              hintText: '0.00',
              prefixText: '\$',
              prefixIcon: const Icon(Icons.attach_money),
              filled: true,
              fillColor: isDark ? AppTheme.surfaceDark : Colors.white,
            ),
            keyboardType: TextInputType.number,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter amount';
              }
              if (double.tryParse(value) == null || double.parse(value) <= 0) {
                return 'Please enter a valid amount';
              }
              return null;
            },
          ),
          
          const SizedBox(height: 16),
          
          // Date
          TextFormField(
            controller: _dateController,
            decoration: InputDecoration(
              labelText: 'Date *',
              hintText: 'YYYY-MM-DD',
              prefixIcon: const Icon(Icons.calendar_today_outlined),
              filled: true,
              fillColor: isDark ? AppTheme.surfaceDark : Colors.white,
              suffixIcon: IconButton(
                icon: const Icon(Icons.calendar_month),
                onPressed: () async {
                  final DateTime? picked = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now(),
                    firstDate: DateTime(2020),
                    lastDate: DateTime.now(),
                  );
                  if (picked != null) {
                    _dateController.text = 
                        '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
                  }
                },
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter date';
              }
              return null;
            },
          ),
          
          const SizedBox(height: 16),
          
          // Category
          DropdownButtonFormField<String>(
            value: _selectedCategory,
            decoration: InputDecoration(
              labelText: 'Category *',
              prefixIcon: const Icon(Icons.category_outlined),
              filled: true,
              fillColor: isDark ? AppTheme.surfaceDark : Colors.white,
            ),
            items: _categories.map((category) {
              return DropdownMenuItem(
                value: category,
                child: Text(category),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                _selectedCategory = value;
                _categoryController.text = value ?? '';
              });
            },
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please select a category';
              }
              return null;
            },
          ),
          
          const SizedBox(height: 16),
          
          // Description
          TextFormField(
            controller: _descriptionController,
            decoration: InputDecoration(
              labelText: 'Description',
              hintText: 'Optional description or items',
              prefixIcon: const Icon(Icons.description_outlined),
              filled: true,
              fillColor: isDark ? AppTheme.surfaceDark : Colors.white,
            ),
            maxLines: 3,
          ),
          
          const SizedBox(height: 32),
          
          // Save Button
          SizedBox(
            height: 56,
            child: ElevatedButton(
              onPressed: _isSaving ? null : _saveExpense,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
              ),
              child: _isSaving
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Text(
                      'Save Expense',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Note about OCR
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.info_outline,
                  size: 20,
                  color: AppTheme.primaryColor,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Review and edit the extracted information before saving.',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                    ),
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

