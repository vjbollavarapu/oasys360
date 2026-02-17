import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/routes/app_routes.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/services/settings_service.dart';

/// Settings Screen
/// Converted from stitch_transactions/settings_1/code.html
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final SettingsService _settingsService = SettingsService();
  bool _twoFactorEnabled = false;
  bool _isLoadingProfile = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
    // Refresh user data when screen is opened if user data is missing
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (authProvider.isAuthenticated && authProvider.currentUser == null) {
        // Only refresh if user data is missing
        authProvider.refreshProfile();
      }
    });
  }

  Future<void> _loadProfile() async {
    if (_isLoadingProfile) return;
    
    setState(() {
      _isLoadingProfile = true;
    });
    
    try {
      final profile = await _settingsService.getProfile();
      setState(() {
        _twoFactorEnabled = profile.twoFactorEnabled;
      });
    } catch (e) {
      // Profile loading failure is not critical, continue with default values
      debugPrint('Failed to load profile: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingProfile = false;
        });
      }
    }
  }

  Future<void> _toggleTwoFactor(bool value) async {
    try {
      final updatedProfile = await _settingsService.updateTwoFactor(value);
      setState(() {
        _twoFactorEnabled = updatedProfile.twoFactorEnabled;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Two-factor authentication ${value ? "enabled" : "disabled"}'),
            backgroundColor: AppTheme.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update two-factor authentication: ${e.toString()}'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
      // Revert toggle on error
      setState(() {
        _twoFactorEnabled = !value;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context, listen: true);
    final isDark = themeProvider.isDarkMode(context);
    
    // Refresh user data if authenticated but user data is missing
    if (authProvider.isAuthenticated && authProvider.currentUser == null && !_isLoadingProfile) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        authProvider.refreshProfile();
      });
    }
    
    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Profile Section
            _buildProfileSection(context, isDark, authProvider),
            const SizedBox(height: 24),
            
            // Theme Mode Section
            _buildThemeModeSection(context, themeProvider, isDark),
            const SizedBox(height: 24),
            
            // Account Settings
            _buildSectionHeader('Account', isDark),
            const SizedBox(height: 12),
            _buildSettingsItem(
              context,
              Icons.person_outline,
              'Profile',
              'Manage your profile information',
              isDark,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Profile management coming soon')),
                );
              },
            ),
            _buildSettingsItem(
              context,
              Icons.lock_outline,
              'Password & Security',
              'Update password and security settings',
              isDark,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.changePassword);
              },
            ),
            _buildSettingsItem(
              context,
              Icons.verified_user_outlined,
              'Two-Factor Authentication',
              'Add an extra layer of security',
              isDark,
              trailing: Switch(
                value: _twoFactorEnabled,
                onChanged: _toggleTwoFactor,
              ),
              onTap: () {
                // Toggle is handled by the switch
              },
            ),
            
            const SizedBox(height: 24),
            
            // Preferences
            _buildSectionHeader('Preferences', isDark),
            const SizedBox(height: 12),
            _buildSettingsItem(
              context,
              Icons.language_outlined,
              'Language',
              'English',
              isDark,
              showChevron: true,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Language selection coming soon')),
                );
              },
            ),
            _buildSettingsItem(
              context,
              Icons.currency_exchange_outlined,
              'Currency',
              'USD (\$)',
              isDark,
              showChevron: true,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Currency selection coming soon')),
                );
              },
            ),
            _buildSettingsItem(
              context,
              Icons.notifications_outlined,
              'Notifications',
              'Manage notification preferences',
              isDark,
              showChevron: true,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Notification settings coming soon')),
                );
              },
            ),
            
            const SizedBox(height: 24),
            
            // Data & Privacy
            _buildSectionHeader('Data & Privacy', isDark),
            const SizedBox(height: 12),
            _buildSettingsItem(
              context,
              Icons.backup_outlined,
              'Backup & Export',
              'Export your data',
              isDark,
              showChevron: true,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Backup & Export coming soon')),
                );
              },
            ),
            _buildSettingsItem(
              context,
              Icons.delete_outline,
              'Data Retention',
              '30 days',
              isDark,
              showChevron: true,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Data retention settings coming soon')),
                );
              },
            ),
            
            const SizedBox(height: 24),
            
            // About
            _buildSectionHeader('About', isDark),
            const SizedBox(height: 12),
            _buildSettingsItem(
              context,
              Icons.info_outline,
              'Version',
              '1.0.0',
              isDark,
              onTap: () {
                showAboutDialog(
                  context: context,
                  applicationName: 'OASYS360',
                  applicationVersion: '1.0.0',
                  applicationLegalese: '© 2024 OASYS360 Enterprise',
                );
              },
            ),
            _buildSettingsItem(
              context,
              Icons.description_outlined,
              'Terms of Service',
              null,
              isDark,
              showChevron: true,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Terms of Service coming soon')),
                );
              },
            ),
            _buildSettingsItem(
              context,
              Icons.privacy_tip_outlined,
              'Privacy Policy',
              null,
              isDark,
              showChevron: true,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Privacy Policy coming soon')),
                );
              },
            ),
            _buildSettingsItem(
              context,
              Icons.support_outlined,
              'Support',
              'Get help and support',
              isDark,
              showChevron: true,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Support coming soon')),
                );
              },
            ),
            
            const SizedBox(height: 32),
            
            // Logout Button
            _buildLogoutButton(context, isDark),
            
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileSection(BuildContext context, bool isDark, AuthProvider authProvider) {
    final currentUser = authProvider.currentUser;
    
    // Debug: Log what we're displaying
    debugPrint('[SettingsScreen] Current user: ${currentUser?.email}, ${currentUser?.fullName}');
    debugPrint('[SettingsScreen] User ID: ${currentUser?.id}');
    debugPrint('[SettingsScreen] First name: ${currentUser?.firstName}, Last name: ${currentUser?.lastName}');
    
    final userName = currentUser?.fullName ?? 'User';
    final userEmail = currentUser?.email ?? '';
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceDark : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.05)
              : AppTheme.borderLight,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: AppTheme.primaryColor.withValues(alpha: 0.2),
                width: 2,
              ),
              image: const DecorationImage(
                image: NetworkImage(
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuDroLl87p76TiaHZIdCPrbEzvQOrKlRiXC4fq2JkcEbGnTR1CoeYEyx3eNcMhohs1tJPIr16xO1lgSJv4aujq_7knN5tiwWhTnwgVQxyGT6VQ6BTNxe4TiHLitqPM2NKJOfna4Wqkgyqg6OHRV3ECpMLkcoin5_Yq8Tn-v-24yZqh2DqvRmFJKKVCrGUHXGtZhzIGYAxk_2x80WqMOwbriseX1ojPqcaEMwiA3N_VWx59g1NHdboJC0ouZir4UaVjKbxnrQoRTfUFw',
                ),
                fit: BoxFit.cover,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  userName,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppTheme.textDark : AppTheme.textLight,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  userEmail,
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                  ),
                ),
                if (authProvider.currentTenant != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    authProvider.currentTenant!.name,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppTheme.textMutedDark : AppTheme.textMutedLight,
                    ),
                  ),
                ],
              ],
            ),
          ),
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Profile editing coming soon')),
              );
            },
            icon: Icon(
              Icons.edit_outlined,
              color: AppTheme.primaryColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildThemeModeSection(
    BuildContext context,
    ThemeProvider themeProvider,
    bool isDark,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceDark : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.05)
              : AppTheme.borderLight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Theme',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? AppTheme.textDark : AppTheme.textLight,
            ),
          ),
          const SizedBox(height: 16),
          _buildThemeOption(
            context,
            themeProvider,
            ThemeModePreference.light,
            'Light',
            Icons.light_mode_outlined,
            isDark,
          ),
          const SizedBox(height: 12),
          _buildThemeOption(
            context,
            themeProvider,
            ThemeModePreference.dark,
            'Dark',
            Icons.dark_mode_outlined,
            isDark,
          ),
          const SizedBox(height: 12),
          _buildThemeOption(
            context,
            themeProvider,
            ThemeModePreference.system,
            'System',
            Icons.brightness_auto_outlined,
            isDark,
          ),
        ],
      ),
    );
  }

  Widget _buildThemeOption(
    BuildContext context,
    ThemeProvider themeProvider,
    ThemeModePreference preference,
    String label,
    IconData icon,
    bool isDark,
  ) {
    final isSelected = themeProvider.themeModePreference == preference;
    
    return InkWell(
      onTap: () {
        themeProvider.setThemeMode(preference);
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppTheme.primaryColor.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? AppTheme.primaryColor
                : (isDark
                    ? Colors.white.withValues(alpha: 0.05)
                    : AppTheme.borderLight),
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected
                  ? AppTheme.primaryColor
                  : (isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: isDark ? AppTheme.textDark : AppTheme.textLight,
                ),
              ),
            ),
            if (isSelected)
              Icon(
                Icons.check_circle,
                color: AppTheme.primaryColor,
                size: 20,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isDark) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.bold,
        color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
        letterSpacing: 0.5,
      ),
    );
  }

  Widget _buildSettingsItem(
    BuildContext context,
    IconData icon,
    String title,
    String? subtitle,
    bool isDark, {
    Widget? trailing,
    bool showChevron = false,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.surfaceDark : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDark
                ? Colors.white.withValues(alpha: 0.05)
                : AppTheme.borderLight.withValues(alpha: 0.3),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                icon,
                color: AppTheme.primaryColor,
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: isDark ? AppTheme.textDark : AppTheme.textLight,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            if (trailing != null) trailing,
            if (showChevron && trailing == null)
              Icon(
                Icons.chevron_right,
                color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLogoutButton(BuildContext context, bool isDark) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ElevatedButton(
        onPressed: () {
          // Show logout confirmation
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Logout'),
              content: const Text('Are you sure you want to logout?'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.pop(context); // Close dialog
                    Navigator.pushNamedAndRemoveUntil(
                      context,
                      AppRoutes.login,
                      (route) => false, // Remove all previous routes
                    );
                  },
                  child: const Text('Logout', style: TextStyle(color: AppTheme.error)),
                ),
              ],
            ),
          );
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: AppTheme.error.withValues(alpha: 0.1),
          foregroundColor: AppTheme.error,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.logout, size: 20),
            SizedBox(width: 8),
            Text(
              'Logout',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

