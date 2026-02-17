# Dynamic Sidebar Implementation Guide

## Overview

The OASYS360 application now supports **dynamic, role-based, and portal-specific sidebars**. This system allows different user roles and portals to have completely customized navigation menus without disrupting the existing design or functionality.

## Architecture

### Components

1. **Navigation Configuration** (`lib/navigation/config.ts`)
   - Defines navigation items for different roles and portals
   - Handles permission-based filtering
   - Portal detection logic

2. **Navigation Hook** (`hooks/use-navigation.tsx`)
   - React hook that provides navigation items based on current user
   - Automatically detects portal and filters by role/permissions

3. **Dashboard Layout** (`components/dashboard-layout.tsx`)
   - Uses the `useNavigation` hook to render dynamic sidebar
   - Maintains existing UI/UX design
   - No breaking changes to existing functionality

## How It Works

### 1. Role-Based Navigation

Each role has its own navigation configuration:

- **platform_admin**: Full access to all modules + Admin panel
- **tenant_admin**: Full tenant access + Admin panel (limited)
- **firm_admin**: Firm-level access + Firm Management
- **cfo**: Financial modules (Accounting, Banking, Reports, Tax, Treasury)
- **accountant**: Most modules except Web3
- **staff/user**: Limited access (Dashboard, Documents, Mobile)

### 2. Portal Detection

The system automatically detects the current portal:

- **web**: Default web portal (detected by pathname not starting with `/mobile` or `/admin`)
- **mobile**: Mobile portal (detected by `/mobile` pathname or mobile user agent)
- **admin**: Admin portal (detected by `/admin` or `/platform-admin` pathname)
- **api**: API portal (detected by `/api` pathname)

### 3. Permission Filtering

Navigation items can be filtered by:
- **Role**: `requiresRole` array specifies which roles can see the item
- **Permission**: `requiresPermission` array specifies required permissions
- **Portal**: `visibleInPortals` and `hiddenInPortals` arrays control portal visibility

## Usage

### Basic Usage

The sidebar automatically adapts based on the logged-in user:

```tsx
import { DashboardLayout } from "@/components/dashboard-layout"

export default function Page() {
  return (
    <DashboardLayout>
      {/* Your page content */}
    </DashboardLayout>
  )
}
```

The `DashboardLayout` component automatically:
1. Gets the current user from `useAuth()`
2. Detects the current portal
3. Loads appropriate navigation items
4. Filters by role and permissions
5. Renders the sidebar

### Custom Navigation Hook

You can also use the navigation hook directly:

```tsx
import { useNavigation } from "@/hooks/use-navigation"

export default function CustomComponent() {
  const { navigationItems, portal, isLoading } = useNavigation()
  
  return (
    <div>
      <p>Current Portal: {portal}</p>
      <ul>
        {navigationItems.map(item => (
          <li key={item.title}>{item.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

## Adding New Navigation Items

### For a Specific Role

Edit `lib/navigation/config.ts` and add to the role-specific navigation array:

```typescript
export const accountantNavigation: NavigationItem[] = [
  ...baseNavigationItems,
  {
    title: "New Module",
    href: "/new-module",
    icon: YourIcon,
    description: "Module description",
    requiresRole: ["accountant", "cfo"],
    children: [
      { title: "Overview", href: "/new-module", icon: BarChart3 },
      { title: "Settings", href: "/new-module/settings", icon: Settings },
    ]
  },
]
```

### For a Specific Portal

Add to the `portalNavigationConfig`:

```typescript
export const portalNavigationConfig: Record<string, Record<string, NavigationItem[]>> = {
  web: {
    // ... existing configs
  },
  mobile: {
    accountant: [
      // Mobile-specific navigation for accountants
    ],
  },
  // ... other portals
}
```

### With Permission Requirements

```typescript
{
  title: "Sensitive Module",
  href: "/sensitive",
  icon: Lock,
  requiresRole: ["admin"],
  requiresPermission: ["sensitive.read", "sensitive.write"],
  children: [
    // ...
  ]
}
```

## Portal-Specific Navigation

### Web Portal

Default portal for desktop/web users. Shows full navigation based on role.

### Mobile Portal

Simplified navigation optimized for mobile devices:

```typescript
mobile: {
  accountant: [
    { title: "Dashboard", href: "/mobile/dashboard", icon: LayoutDashboard },
    { title: "Expenses", href: "/mobile/expenses", icon: Receipt },
    // ... mobile-optimized items
  ],
}
```

### Admin Portal

Admin-specific navigation for platform/tenant administrators:

```typescript
admin: {
  platform_admin: [
    { title: "Admin", href: "/admin", icon: Settings },
    { title: "Dashboard", href: "/", icon: LayoutDashboard },
  ],
}
```

## Role Hierarchy

The system respects role hierarchy:

1. **platform_admin** → Has access to everything
2. **tenant_admin** → Has access to tenant features
3. **firm_admin** → Has access to firm features
4. **cfo** → Has access to financial features
5. **accountant** → Has access to accounting features
6. **staff/user** → Limited access

Higher roles automatically inherit permissions from lower roles.

## Best Practices

### 1. Keep Navigation Configurations Separate

Don't mix role-specific items in base navigation. Use separate arrays for each role.

### 2. Use Permission Checks

Always specify `requiresRole` or `requiresPermission` for sensitive items.

### 3. Portal-Specific Optimization

Create simplified navigation for mobile/admin portals.

### 4. Maintain Consistency

Keep icon usage, naming conventions, and structure consistent across roles.

### 5. Test All Roles

Test navigation for each role to ensure proper filtering.

## Migration Notes

### Existing Code

**No changes required!** The existing `DashboardLayout` component automatically uses the new dynamic navigation system.

### Backward Compatibility

- All existing navigation items are preserved
- UI/UX remains unchanged
- No breaking changes to component APIs

### Custom Sidebars

If you have custom sidebar implementations, you can migrate them to use `useNavigation()`:

```tsx
// Before
const navigationItems = [
  { title: "Dashboard", href: "/" },
  // ...
]

// After
const { navigationItems } = useNavigation()
```

## Troubleshooting

### Navigation Items Not Showing

1. Check user role: `user.role` must match a role in the config
2. Check permissions: User must have required permissions
3. Check portal: Portal must match the navigation config
4. Check console: Look for any errors in navigation loading

### Wrong Navigation for Role

1. Verify role name matches exactly (case-sensitive)
2. Check `portalNavigationConfig` has entry for role
3. Ensure role is in `requiresRole` array for items

### Portal Detection Issues

1. Check pathname starts with correct prefix (`/mobile`, `/admin`, etc.)
2. Verify user agent detection for mobile
3. Check `detectPortal()` function logic

## Future Enhancements

### Planned Features

1. **Backend-Driven Navigation**: Load navigation from API
2. **Custom Navigation**: Allow users to customize their sidebar
3. **Navigation Analytics**: Track which items are used most
4. **A/B Testing**: Test different navigation structures
5. **Multi-Language**: Support for localized navigation labels

### Extensibility

The system is designed to be easily extensible:

- Add new roles: Create new navigation array
- Add new portals: Add to `portalNavigationConfig`
- Add new permissions: Use `requiresPermission` array
- Custom filtering: Extend `filterNavigationByAccess()` function

## Examples

### Example 1: Adding a New Module for Accountants

```typescript
// In lib/navigation/config.ts
export const accountantNavigation: NavigationItem[] = [
  ...baseNavigationItems,
  {
    title: "Expense Management",
    href: "/expenses",
    icon: Receipt,
    description: "Track and manage expenses",
    requiresRole: ["accountant", "cfo"],
    children: [
      { title: "Overview", href: "/expenses", icon: BarChart3 },
      { title: "Create Expense", href: "/expenses/create", icon: Plus },
      { title: "Reports", href: "/expenses/reports", icon: FileText },
    ]
  },
]
```

### Example 2: Portal-Specific Navigation

```typescript
export const portalNavigationConfig = {
  web: {
    accountant: accountantNavigation, // Full navigation
  },
  mobile: {
    accountant: [
      // Simplified mobile navigation
      { title: "Dashboard", href: "/mobile/dashboard", icon: LayoutDashboard },
      { title: "Expenses", href: "/mobile/expenses", icon: Receipt },
    ],
  },
}
```

### Example 3: Permission-Based Item

```typescript
{
  title: "Sensitive Data",
  href: "/sensitive",
  icon: Lock,
  requiresPermission: ["sensitive.view"],
  children: [
    { title: "Overview", href: "/sensitive", icon: BarChart3 },
  ]
}
```

## Support

For questions or issues:
1. Check this documentation
2. Review `lib/navigation/config.ts` for examples
3. Check `hooks/use-navigation.tsx` for hook implementation
4. Review `components/dashboard-layout.tsx` for usage

---

**Last Updated**: 2024-12-25
**Version**: 1.0.0

