# Backend Integration Setup Guide

## ✅ Completed Setup

### 1. API Foundation
- **API Configuration** (`lib/core/config/api_config.dart`)
  - Configurable base URL (default: `http://localhost:8000`)
  - Centralized endpoint definitions
  - Timeout and header configurations

- **API Client** (`lib/core/api/api_client.dart`)
  - Dio-based HTTP client
  - Request/response logging
  - Error handling and conversion
  - Authorization token management
  - Automatic token injection in headers

- **API Exception Handling** (`lib/core/api/api_exception.dart`)
  - Custom exception class
  - User-friendly error messages
  - HTTP status code handling
  - Network error detection

### 2. Authentication Service
- **Token Storage** (`lib/core/services/token_storage_service.dart`)
  - Secure storage using `flutter_secure_storage`
  - Access and refresh token management
  - Platform-specific encryption (iOS Keychain, Android Keystore)

- **Auth Service** (`lib/core/services/auth_service.dart`)
  - Login with email/password
  - Logout with token blacklisting
  - Token refresh mechanism
  - Profile fetching
  - Authentication state management

- **Auth Provider** (`lib/core/providers/auth_provider.dart`)
  - State management using Provider
  - User and tenant state
  - Loading and error states
  - Reactive UI updates

### 3. Data Models
- **User Model** (`lib/core/models/user_model.dart`)
  - User profile representation
  - JSON serialization/deserialization

- **Tenant Model** (`lib/core/models/tenant_model.dart`)
  - Tenant information
  - Multi-tenant support

- **Auth Models** (`lib/core/models/auth_models.dart`)
  - Login request/response
  - Token pair (access/refresh)
  - Token refresh request/response

### 4. Login Screen Integration
- Updated login screen to use `AuthProvider`
- Real backend API integration
- Error handling and user feedback
- Loading states
- Email validation

## 🔧 Configuration

### Setting API Base URL

The API base URL can be configured in `lib/main.dart`:

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set API base URL for production
  ApiConfig.setBaseUrl('https://your-production-api.com');
  
  // Or use environment variables
  // final apiUrl = Platform.environment['API_BASE_URL'] ?? 'http://localhost:8000';
  // ApiConfig.setBaseUrl(apiUrl);
  
  runApp(/* ... */);
}
```

### Default Configuration
- **Base URL**: `http://localhost:8000`
- **API Base**: `http://localhost:8000/api/v1`
- **Timeout**: 30 seconds

### Authentication Endpoints
All authentication endpoints are configured in `ApiConfig`:
- Login: `/authentication/login/`
- Logout: `/authentication/logout/`
- Profile: `/authentication/profile/`
- Change Password: `/authentication/password/change/`
- Forgot Password: `/authentication/password/reset/`
- Token Refresh: `/authentication/token/refresh/`

## 🚀 Usage

### Login Example
The login screen now automatically uses the `AuthProvider`:

```dart
final authProvider = Provider.of<AuthProvider>(context, listen: false);
final success = await authProvider.login(email, password);
```

### Access Current User
```dart
final authProvider = Provider.of<AuthProvider>(context);
final user = authProvider.currentUser;
final tenant = authProvider.currentTenant;
final isAuthenticated = authProvider.isAuthenticated;
```

### Logout
```dart
final authProvider = Provider.of<AuthProvider>(context, listen: false);
await authProvider.logout();
```

### Making Authenticated API Calls
The `ApiClient` automatically includes the access token in the `Authorization` header:

```dart
final apiClient = ApiClient();
// Token is automatically included from secure storage
final response = await apiClient.get('/some-protected-endpoint/');
```

## 📦 Dependencies Added

- `dio: ^5.4.0` - HTTP client
- `flutter_secure_storage: ^9.0.0` - Secure token storage

## 🔐 Security Features

1. **Secure Token Storage**
   - Tokens stored in platform secure storage
   - iOS: Keychain
   - Android: EncryptedSharedPreferences

2. **Token Management**
   - Access tokens for API requests
   - Refresh tokens for token renewal
   - Automatic token refresh (to be implemented)

3. **Error Handling**
   - Network error detection
   - 401 handling (unauthorized)
   - User-friendly error messages

## 🧪 Testing

### Testing with Backend

1. **Start Backend Server**
   ```bash
   cd apps/backend
   python manage.py runserver
   ```

2. **Configure API URL** (if different from default)
   - Update `ApiConfig.setBaseUrl()` in `main.dart`

3. **Test Login**
   - Open the app
   - Enter valid credentials
   - Check if login succeeds and navigates to dashboard

### Testing Token Storage
- Login successfully
- Close and reopen app
- Check if user remains authenticated (tokens persisted)

## 📝 Next Steps

### Immediate Next Steps
1. **Token Refresh Implementation**
   - Add automatic token refresh on 401 errors
   - Refresh token before expiration

2. **Dashboard Integration**
   - Integrate dashboard stats API
   - Fetch recent activity
   - Display charts and graphs

3. **Profile Management**
   - Update user profile
   - Change password integration
   - Profile picture upload

### Phase 1: Core Features
- [ ] Dashboard stats integration
- [ ] Settings screen integration
- [ ] Notifications API integration

### Phase 2: Business Features
- [ ] Expenses API integration
- [ ] Invoices API integration
- [ ] Approvals API integration

### Phase 3: Advanced Features
- [ ] Banking transactions
- [ ] Inventory management
- [ ] Sales orders
- [ ] Reports generation

## 🐛 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if backend server is running
   - Verify API base URL is correct
   - Check network connectivity

2. **401 Unauthorized**
   - Tokens may be expired
   - Check if refresh token is valid
   - Re-login if necessary

3. **CORS Issues (Web)**
   - Configure CORS on backend
   - Check backend CORS settings

4. **SSL/TLS Issues (Production)**
   - Verify SSL certificate
   - Check certificate pinning if implemented

## 📚 Related Documentation

- [Mobile Integration Checklist](./MOBILE_INTEGRATION_CHECKLIST.md)
- [Backend API Documentation](../backend/README.md)
- [Dio Package Documentation](https://pub.dev/packages/dio)
- [Flutter Secure Storage](https://pub.dev/packages/flutter_secure_storage)

## 🔗 API Endpoint Reference

### Authentication Endpoints
- `POST /api/v1/authentication/login/` - User login
- `POST /api/v1/authentication/logout/` - User logout
- `GET /api/v1/authentication/profile/` - Get user profile
- `POST /api/v1/authentication/password/change/` - Change password
- `POST /api/v1/authentication/token/refresh/` - Refresh access token

See `MOBILE_INTEGRATION_CHECKLIST.md` for complete API reference.

---

**Last Updated**: December 2024  
**Status**: Phase 1 - Authentication Complete ✅

