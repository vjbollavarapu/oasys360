# HTML to Flutter Conversion Guide

This guide explains how to convert HTML files from Google Stitch to Flutter widgets.

## Conversion Pattern

### 1. Basic Structure

**HTML:**
```html
<div class="bg-white dark:bg-surface-dark p-4 rounded-lg">
  <p class="text-slate-900 dark:text-white">Hello</p>
</div>
```

**Flutter:**
```dart
Container(
  padding: EdgeInsets.all(16),
  decoration: BoxDecoration(
    color: isDark ? AppTheme.surfaceDark : Colors.white,
    borderRadius: BorderRadius.circular(12),
  ),
  child: Text(
    'Hello',
    style: TextStyle(
      color: isDark ? AppTheme.textDark : AppTheme.textLight,
    ),
  ),
)
```

### 2. Colors

| HTML Class | Flutter (Light) | Flutter (Dark) |
|------------|----------------|----------------|
| `bg-background-light` | `AppTheme.backgroundLight` | `AppTheme.backgroundDark` |
| `bg-white` | `Colors.white` | `AppTheme.surfaceDark` |
| `bg-surface-dark` | `AppTheme.surfaceLight` | `AppTheme.surfaceDark` |
| `text-slate-900` | `AppTheme.textLight` | `AppTheme.textDark` |
| `text-white` | `Colors.white` | `Colors.white` |
| `text-slate-500` | `AppTheme.textSecondaryLight` | `AppTheme.textSecondaryDark` |
| `bg-primary` | `AppTheme.primaryColor` | `AppTheme.primaryColor` |

### 3. Spacing

| HTML Class | Flutter |
|------------|---------|
| `p-4` | `EdgeInsets.all(16)` |
| `px-4` | `EdgeInsets.symmetric(horizontal: 16)` |
| `py-4` | `EdgeInsets.symmetric(vertical: 16)` |
| `gap-4` | `SizedBox(width/height: 16)` or use `Wrap` with spacing |
| `mb-4` | `SizedBox(height: 16)` after widget |

### 4. Border Radius

| HTML Class | Flutter |
|------------|---------|
| `rounded-lg` | `BorderRadius.circular(16)` |
| `rounded-full` | `BorderRadius.circular(999)` or `Shape.circle` |
| `rounded-xl` | `BorderRadius.circular(24)` |

### 5. Flex Layouts

**HTML:**
```html
<div class="flex items-center justify-between">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

**Flutter:**
```dart
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  crossAxisAlignment: CrossAxisAlignment.center,
  children: [
    Text('Item 1'),
    Text('Item 2'),
  ],
)
```

**HTML:**
```html
<div class="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

**Flutter:**
```dart
Column(
  children: [
    Text('Item 1'),
    SizedBox(height: 16),
    Text('Item 2'),
  ],
)
```

### 6. Grid Layouts

**HTML:**
```html
<div class="grid grid-cols-4 gap-4">
  <div>Item</div>
</div>
```

**Flutter:**
```dart
Row(
  children: List.generate(4, (index) => Expanded(
    child: Container(
      margin: EdgeInsets.all(4),
      child: Text('Item'),
    ),
  )),
)
```

Or use `GridView.count(crossAxisCount: 4, ...)`

### 7. Cards

**HTML:**
```html
<div class="bg-white dark:bg-surface-dark rounded-lg p-6 shadow-sm">
  Card content
</div>
```

**Flutter:**
```dart
Card(
  color: isDark ? AppTheme.surfaceDark : Colors.white,
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(16),
  ),
  elevation: 0,
  child: Padding(
    padding: EdgeInsets.all(24),
    child: Text('Card content'),
  ),
)
```

### 8. Buttons

**HTML:**
```html
<button class="bg-primary text-white rounded-full px-6 py-3">
  Click me
</button>
```

**Flutter:**
```dart
ElevatedButton(
  onPressed: () {},
  style: ElevatedButton.styleFrom(
    backgroundColor: AppTheme.primaryColor,
    foregroundColor: Colors.white,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(999),
    ),
    padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
  ),
  child: Text('Click me'),
)
```

### 9. Icons (Material Symbols)

**HTML:**
```html
<span class="material-symbols-outlined">notifications</span>
```

**Flutter:**
```dart
Icon(Icons.notifications_outlined)
// Or use MaterialSymbolIcon widget for better mapping
MaterialSymbolIcon('notifications')
```

### 10. Images

**HTML:**
```html
<img src="url" class="rounded-full size-10" />
```

**Flutter:**
```dart
ClipRRect(
  borderRadius: BorderRadius.circular(999),
  child: Image.network(
    'url',
    width: 40,
    height: 40,
    fit: BoxFit.cover,
  ),
)
```

### 11. Scrollable Lists

**HTML:**
```html
<div class="overflow-x-auto">
  <div class="flex gap-4">
    <!-- Items -->
  </div>
</div>
```

**Flutter:**
```dart
SingleChildScrollView(
  scrollDirection: Axis.horizontal,
  child: Row(
    children: [
      // Items
    ],
  ),
)
```

### 12. Sticky Headers

**HTML:**
```html
<div class="sticky top-0 z-20 bg-white/90 backdrop-blur-md">
  Header content
</div>
```

**Flutter:**
Use `SliverAppBar` with `pinned: true`:
```dart
CustomScrollView(
  slivers: [
    SliverAppBar(
      pinned: true,
      flexibleSpace: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.9),
        ),
        child: // Header content
      ),
    ),
    // Other content
  ],
)
```

### 13. Dark Mode Conditionals

Always use:
```dart
final isDark = themeProvider.isDarkMode(context);
```

Then conditionally apply colors:
```dart
color: isDark ? AppTheme.surfaceDark : Colors.white
```

### 14. Common Patterns

#### Bottom Navigation
Use a `Container` with rounded corners positioned at the bottom, or use Flutter's `BottomNavigationBar`.

#### Floating Action Button
Use Flutter's `FloatingActionButton` widget.

#### Search Bar
Use `TextField` with appropriate decoration.

#### Filter Chips
Use `Chip` widgets or custom containers with tap handlers.

#### Status Badges
Use `Container` with rounded corners and colored backgrounds.

## Screen Conversion Checklist

For each screen:
1. [ ] Create screen file in `lib/screens/[module]/[screen_name]_screen.dart`
2. [ ] Import theme and provider
3. [ ] Get `isDark` from ThemeProvider
4. [ ] Convert all HTML elements to Flutter widgets
5. [ ] Map all colors using `isDark` conditionals
6. [ ] Convert all spacing (padding, margin, gap)
7. [ ] Convert icons using Material Icons or MaterialSymbolIcon
8. [ ] Test dark mode toggle
9. [ ] Test light mode
10. [ ] Test system mode (should follow device settings)

## Helper Functions

Create reusable widgets for common patterns:
- Metric cards
- Action buttons
- List items
- Filter chips
- Status badges
- etc.

## Notes

- Always use `ThemeProvider` to access theme mode
- Use `AppTheme` constants for colors
- Test all three theme modes (light, dark, system)
- Material Icons may not exactly match Material Symbols - consider using a custom icon font
- Use `GoogleFonts.manrope()` for typography
- Remember touch targets should be at least 44x44 points

