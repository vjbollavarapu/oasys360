import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:camera/camera.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/routes/app_routes.dart';

/// Receipt Scanner Screen - Capture receipt image for OCR processing
class ReceiptScannerScreen extends StatefulWidget {
  const ReceiptScannerScreen({super.key});

  @override
  State<ReceiptScannerScreen> createState() => _ReceiptScannerScreenState();
}

class _ReceiptScannerScreenState extends State<ReceiptScannerScreen> {
  final ImagePicker _imagePicker = ImagePicker();
  CameraController? _cameraController;
  List<CameraDescription>? _cameras;
  bool _isInitialized = false;
  bool _isCapturing = false;
  File? _capturedImage;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras != null && _cameras!.isNotEmpty) {
        _cameraController = CameraController(
          _cameras![0],
          ResolutionPreset.high,
          enableAudio: false,
        );
        await _cameraController!.initialize();
        setState(() {
          _isInitialized = true;
        });
      }
    } catch (e) {
      debugPrint('Camera initialization error: $e');
      // If camera fails, allow user to pick from gallery
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  Future<void> _capturePhoto() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return;
    }

    setState(() {
      _isCapturing = true;
    });

    try {
      final XFile image = await _cameraController!.takePicture();
      setState(() {
        _capturedImage = File(image.path);
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error capturing photo: $e')),
      );
    } finally {
      setState(() {
        _isCapturing = false;
      });
    }
  }

  Future<void> _pickFromGallery() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _capturedImage = File(image.path);
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error picking image: $e')),
      );
    }
  }

  void _processReceipt() {
    if (_capturedImage != null) {
      Navigator.pushNamed(
        context,
        AppRoutes.receiptReview,
        arguments: _capturedImage,
      );
    }
  }

  void _retakePhoto() {
    setState(() {
      _capturedImage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    return Scaffold(
      backgroundColor: Colors.black,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Scan Receipt'),
        backgroundColor: (isDark ? AppTheme.surfaceDark : Colors.black).withValues(alpha: 0.7),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
          color: Colors.white,
        ),
        iconTheme: const IconThemeData(color: Colors.white),
        titleTextStyle: const TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.photo_library),
            onPressed: _pickFromGallery,
            color: Colors.white,
            tooltip: 'Pick from gallery',
          ),
        ],
      ),
      body: _capturedImage == null
          ? _buildCameraView(isDark)
          : _buildPreviewView(isDark),
    );
  }

  Widget _buildCameraView(bool isDark) {
    if (!_isInitialized || _cameraController == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(color: Colors.white),
            const SizedBox(height: 16),
            Text(
              'Initializing camera...',
              style: const TextStyle(color: Colors.white),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _pickFromGallery,
              icon: const Icon(Icons.photo_library),
              label: const Text('Pick from Gallery'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
              ),
            ),
          ],
        ),
      );
    }

    return Stack(
      children: [
        // Camera preview
        SizedBox.expand(
          child: CameraPreview(_cameraController!),
        ),
        
        // Overlay with guide lines
        Center(
          child: Container(
            width: MediaQuery.of(context).size.width * 0.85,
            height: MediaQuery.of(context).size.width * 0.85 * 1.4, // Receipt aspect ratio
            decoration: BoxDecoration(
              border: Border.all(color: AppTheme.primaryColor, width: 3),
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        
        // Instructions
        Positioned(
          top: MediaQuery.of(context).padding.top + 100,
          left: 0,
          right: 0,
          child: Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'Position receipt within frame',
                style: TextStyle(color: Colors.white, fontSize: 16),
              ),
            ),
          ),
        ),
        
        // Capture button
        Positioned(
          bottom: 40,
          left: 0,
          right: 0,
          child: Center(
            child: Column(
              children: [
                GestureDetector(
                  onTap: _isCapturing ? null : _capturePhoto,
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                      border: Border.all(color: AppTheme.primaryColor, width: 4),
                    ),
                    child: _isCapturing
                        ? const Padding(
                            padding: EdgeInsets.all(20),
                            child: CircularProgressIndicator(
                              strokeWidth: 3,
                              color: AppTheme.primaryColor,
                            ),
                          )
                        : Container(
                            margin: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppTheme.primaryColor,
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Tap to capture',
                  style: TextStyle(color: Colors.white, fontSize: 14),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPreviewView(bool isDark) {
    return Stack(
      children: [
        // Image preview
        Center(
          child: Image.file(
            _capturedImage!,
            fit: BoxFit.contain,
          ),
        ),
        
        // Action buttons
        Positioned(
          bottom: 40,
          left: 0,
          right: 0,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                // Retake button
                ElevatedButton.icon(
                  onPressed: _retakePhoto,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Retake'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey[800],
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  ),
                ),
                
                // Process button
                ElevatedButton.icon(
                  onPressed: _processReceipt,
                  icon: const Icon(Icons.check),
                  label: const Text('Process Receipt'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

