import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';

/// Invoice Creation Screen
/// Converted from stitch_transactions/invoice_creation/code.html
class InvoiceCreationScreen extends StatefulWidget {
  const InvoiceCreationScreen({super.key});

  @override
  State<InvoiceCreationScreen> createState() => _InvoiceCreationScreenState();
}

class InvoiceLineItem {
  String id;
  String description;
  double quantity;
  double unitPrice;
  
  InvoiceLineItem({
    required this.id,
    required this.description,
    required this.quantity,
    required this.unitPrice,
  });
  
  double get total => quantity * unitPrice;
}

class _InvoiceCreationScreenState extends State<InvoiceCreationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _customerController = TextEditingController();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  
  final List<InvoiceLineItem> _lineItems = [];
  double _subtotal = 0.0;
  double _tax = 0.0;
  double _total = 0.0;

  @override
  void initState() {
    super.initState();
    _updateTotals();
  }

  @override
  void dispose() {
    _customerController.dispose();
    _amountController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }
  
  void _updateTotals() {
    setState(() {
      _subtotal = _lineItems.fold(0.0, (sum, item) => sum + item.total);
      _tax = _subtotal * 0.20; // 20% VAT (can be made configurable)
      _total = _subtotal + _tax;
      _amountController.text = _total.toStringAsFixed(2);
    });
  }
  
  void _showAddLineItemDialog({InvoiceLineItem? item, int? index}) {
    final descriptionController = TextEditingController(text: item?.description ?? '');
    final quantityController = TextEditingController(text: item?.quantity.toString() ?? '1');
    final priceController = TextEditingController(text: item?.unitPrice.toString() ?? '0.00');
    final formKey = GlobalKey<FormState>();
    
    final themeProvider = Provider.of<ThemeProvider>(context, listen: false);
    final isDark = themeProvider.isDarkMode(context);
    
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: isDark ? AppTheme.surfaceDark : Colors.white,
              title: Text(
                item == null ? 'Add Line Item' : 'Edit Line Item',
                style: TextStyle(
                  color: isDark ? AppTheme.textDark : AppTheme.textLight,
                ),
              ),
              content: Form(
                key: formKey,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextFormField(
                        controller: descriptionController,
                        decoration: InputDecoration(
                          labelText: 'Description',
                          hintText: 'Enter item description',
                          filled: true,
                          fillColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter a description';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: quantityController,
                              decoration: InputDecoration(
                                labelText: 'Quantity',
                                hintText: '1',
                                filled: true,
                                fillColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
                              ),
                              keyboardType: TextInputType.number,
                              onChanged: (_) => setDialogState(() {}),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Required';
                                }
                                if (double.tryParse(value) == null || double.parse(value) <= 0) {
                                  return 'Invalid';
                                }
                                return null;
                              },
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: TextFormField(
                              controller: priceController,
                              decoration: InputDecoration(
                                labelText: 'Unit Price',
                                hintText: '0.00',
                                prefixText: '\$',
                                filled: true,
                                fillColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
                              ),
                              keyboardType: TextInputType.number,
                              onChanged: (_) => setDialogState(() {}),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Required';
                                }
                                if (double.tryParse(value) == null || double.parse(value) < 0) {
                                  return 'Invalid';
                                }
                                return null;
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      // Preview total
                      Builder(
                        builder: (context) {
                          final qty = double.tryParse(quantityController.text) ?? 0;
                          final price = double.tryParse(priceController.text) ?? 0;
                          final lineTotal = qty * price;
                          
                          if (quantityController.text.isNotEmpty && priceController.text.isNotEmpty && lineTotal > 0) {
                            return Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryColor.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Line Total:',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: isDark ? AppTheme.textDark : AppTheme.textLight,
                                    ),
                                  ),
                                  Text(
                                    '\$${lineTotal.toStringAsFixed(2)}',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: AppTheme.primaryColor,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }
                          return const SizedBox.shrink();
                        },
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    'Cancel',
                    style: TextStyle(color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight),
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    if (formKey.currentState!.validate()) {
                      final lineItem = InvoiceLineItem(
                        id: item?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
                        description: descriptionController.text,
                        quantity: double.parse(quantityController.text),
                        unitPrice: double.parse(priceController.text),
                      );
                      
                      setState(() {
                        if (item == null) {
                          _lineItems.add(lineItem);
                        } else if (index != null) {
                          _lineItems[index] = lineItem;
                        }
                        _updateTotals();
                      });
                      
                      Navigator.pop(context);
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                  ),
                  child: const Text('Save'),
                ),
              ],
            );
          },
        );
      },
    );
  }
  
  void _removeLineItem(int index) {
    setState(() {
      _lineItems.removeAt(index);
      _updateTotals();
    });
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Create Invoice'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          TextButton(
            onPressed: () {
              if (_formKey.currentState!.validate()) {
                Navigator.pop(context);
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Customer Selection
              _buildSectionHeader('Customer', isDark),
              const SizedBox(height: 12),
              TextFormField(
                controller: _customerController,
                decoration: InputDecoration(
                  labelText: 'Select Customer',
                  hintText: 'Search or select customer',
                  suffixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: isDark ? AppTheme.surfaceDark : Colors.white,
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please select a customer';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: 24),
              
              // Invoice Details
              _buildSectionHeader('Invoice Details', isDark),
              const SizedBox(height: 12),
              TextFormField(
                controller: _amountController,
                decoration: InputDecoration(
                  labelText: 'Amount',
                  hintText: '0.00',
                  prefixText: '\$',
                  filled: true,
                  fillColor: isDark ? AppTheme.surfaceDark : Colors.white,
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter an amount';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _descriptionController,
                decoration: InputDecoration(
                  labelText: 'Description',
                  hintText: 'Enter invoice description',
                  filled: true,
                  fillColor: isDark ? AppTheme.surfaceDark : Colors.white,
                ),
                maxLines: 3,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a description';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: 24),
              
              // Line Items Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildSectionHeader('Line Items', isDark),
                  if (_lineItems.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${_lineItems.length} item${_lineItems.length != 1 ? 's' : ''}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              // Line Items List
              if (_lineItems.isNotEmpty)
                ..._lineItems.asMap().entries.map((entry) {
                  final index = entry.key;
                  final item = entry.value;
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
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.description,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? AppTheme.textDark : AppTheme.textLight,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Qty: ${item.quantity} × \$${item.unitPrice.toStringAsFixed(2)}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                                ),
                              ),
                            ],
                          ),
                        ),
              Text(
                          '\$${item.total.toStringAsFixed(2)}',
                style: TextStyle(
                            fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppTheme.textDark : AppTheme.textLight,
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(Icons.edit_outlined, size: 20),
                          onPressed: () => _showAddLineItemDialog(item: item, index: index),
                          color: AppTheme.primaryColor,
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline, size: 20),
                          onPressed: () => _removeLineItem(index),
                          color: AppTheme.error,
                        ),
                      ],
                    ),
                  );
                }),
              // Add Line Item Button
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.surfaceDark : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? Colors.white.withValues(alpha: 0.05) : AppTheme.borderLight,
                    style: BorderStyle.solid,
                    width: 2,
                  ),
                ),
                child: InkWell(
                  onTap: () => _showAddLineItemDialog(),
                  borderRadius: BorderRadius.circular(12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.add_circle_outline,
                        color: AppTheme.primaryColor,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Add Line Item',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              
              if (_lineItems.isEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Center(
                    child: Text(
                      'No line items added',
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                      ),
                    ),
                  ),
                ),
              
              const SizedBox(height: 24),
              
              // Financial Summary
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.surfaceDark : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? Colors.white.withValues(alpha: 0.05) : AppTheme.borderLight,
                  ),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Subtotal',
                          style: TextStyle(
                            fontSize: 14,
                            color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                          ),
                        ),
                        Text(
                          '\$${_subtotal.toStringAsFixed(2)}',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppTheme.textDark : AppTheme.textLight,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
              Text(
                              'Tax (VAT 20%)',
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                ),
              ),
                            IconButton(
                              icon: const Icon(Icons.edit_outlined, size: 16),
                              onPressed: () {
                                showDialog(
                                  context: context,
                                  builder: (context) {
                                    final controller = TextEditingController(text: '20');
                                    return AlertDialog(
                                      title: const Text('Edit Tax Rate'),
                                      content: TextField(
                                        controller: controller,
                                        decoration: const InputDecoration(
                                          labelText: 'Tax Rate (%)',
                                          hintText: 'Enter tax rate',
                                        ),
                                        keyboardType: TextInputType.number,
                                      ),
                                      actions: [
                                        TextButton(
                                          onPressed: () => Navigator.pop(context),
                                          child: const Text('Cancel'),
                                        ),
                                        TextButton(
                                          onPressed: () {
                                            // TODO: Update tax rate when backend integration is ready
                                            Navigator.pop(context);
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(content: Text('Tax rate updated to ${controller.text}%')),
                                            );
                                          },
                                          child: const Text('Save'),
                                        ),
                                      ],
                                    );
                                  },
                                );
                              },
                              color: AppTheme.primaryColor,
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                            ),
                          ],
                        ),
                        Text(
                          '\$${_tax.toStringAsFixed(2)}',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppTheme.textDark : AppTheme.textLight,
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Total Amount',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: isDark ? AppTheme.textDark : AppTheme.textLight,
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '\$${_total.toStringAsFixed(2)}',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryColor,
                              ),
                            ),
              Text(
                              'USD',
                style: TextStyle(
                  fontSize: 12,
                                color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Create Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      Navigator.pop(context);
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text(
                    'Create Invoice',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isDark) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: isDark ? AppTheme.textDark : AppTheme.textLight,
      ),
    );
  }
}
