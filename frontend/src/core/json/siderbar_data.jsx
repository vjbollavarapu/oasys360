import React from "react";

import * as Icon from "react-feather";
import { label } from "yet-another-react-lightbox";

export const SidebarData = [
  {
    label: "Main",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Main",
    submenuItems: [
      {
        label: "Dashboard",
        icon: <Icon.Grid />,
        submenu: false,
        showSubRoute: false,
        /*

        submenuItems: [
          { label: "Admin Dashboard", link: "/admin-dashboard" },
          { label: "Sales Dashboard", link: "/sales-dashboard" },
        ],*/
      },
      /*
      {
        label: "Application",
        icon: <Icon.Smartphone />,
        submenu: true,
        showSubRoute: false,
        submenuItems: [
          { label: "Chat", link: "/chat", showSubRoute: false },
          {
            label: "Call",
            submenu: true,
            submenuItems: [
              { label: "Video Call", link: "/video-call" },
              { label: "Audio Call", link: "/audio-call" },
              { label: "Call History", link: "/call-history" },
            ],
          },
          { label: "Calendar", link: "/calendar", showSubRoute: false },
          { label: "Email", link: "/email", showSubRoute: false },
          { label: "To Do", link: "/todo", showSubRoute: false },
          { label: "Notes", link: "/notes", showSubRoute: false },
          { label: "File Manager", link: "/file-manager", showSubRoute: false },
        ],
      },*/
    ],
  },
  {
    label: "Inventory",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Inventory",
    submenuItems: [
      {
        label: "Products",
        link: "/product-list",
        icon: <Icon.Box />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Create Product",
        link: "/add-product",
        icon: <Icon.PlusSquare />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Expired Products",
        link: "/expired-products",
        icon: <Icon.Codesandbox />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Low Stocks",
        link: "/low-stocks",
        icon: <Icon.TrendingDown />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Category",
        link: "/category-list",
        icon: <Icon.Codepen />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Sub Category",
        link: "/sub-categories",
        icon: <Icon.Speaker />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Brands",
        link: "/brand-list",
        icon: <Icon.Tag />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Units",
        link: "/units",
        icon: <Icon.Speaker />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Variant Attributes",
        link: "/variant-attributes",
        icon: <Icon.Layers />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Warranties",
        link: "/warranty",
        icon: <Icon.Bookmark />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Print Barcode",
        link: "/barcode",
        icon: <Icon.AlignJustify />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Print QR Code",
        link: "/qrcode",
        icon: <Icon.Maximize />,
        showSubRoute: false,
        submenu: false,
      },
    ],
  },
  {
    label: "Stock",
    submenuOpen: true,
    submenuHdr: "Stock",
    submenu: true,
    showSubRoute: false,
    submenuItems: [
      {
        label: "Manage Stock",
        link: "/manage-stocks",
        icon: <Icon.Package />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Stock Adjustment",
        link: "/stock-adjustment",
        icon: <Icon.Clipboard />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Stock Transfer",
        link: "/stock-transfer",
        icon: <Icon.Truck />,
        showSubRoute: false,
        submenu: false,
      },
    ],
  },
  {
    label: "Sales",
    submenuOpen: true,
    submenuHdr: "Sales",
    submenu: false,
    showSubRoute: false,
    submenuItems: [
      {
        label: "Sales",
        link: "/sales-list",
        icon: <Icon.ShoppingCart />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Invoices",
        link: "/invoice-report",
        icon: <Icon.FileText />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Sales Return",
        link: "/sales-returns",
        icon: <Icon.Copy />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Quotation",
        link: "/quotation-list",
        icon: <Icon.Save />,
        showSubRoute: false,
        submenu: false,
      },
      /*
      {
        label: "POS",
        link: "/pos",
        icon: <Icon.HardDrive />,
        showSubRoute: false,
        submenu: false,
      },*/
    ],
  },
  /*
  {
    label: "Promo",
    submenuOpen: true,
    submenuHdr: "Promo",
    showSubRoute: false,
    submenuItems: [
      {
        label: "Coupons",
        link: "/coupons",
        icon: <Icon.ShoppingCart />,
        showSubRoute: false,
        submenu: false,
      },
    ],
  },*/
  {
    label: "Procurement",
    submenuOpen: true,
    submenuHdr: "Purchases",
    showSubRoute: false,
    submenuItems: [
      {
        label: "Purchases",
        link: "/purchase-list",
        icon: <Icon.ShoppingBag />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Purchase Order",
        link: "/purchase-order-report",
        icon: <Icon.FileMinus />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Purchase Return",
        link: "/purchase-returns",
        icon: <Icon.RefreshCw />,
        showSubRoute: false,
        submenu: false,
      },
    ],
  },

  {
    label: "Finance Desk",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Finance & Accounts",
    submenuItems: [
      {
        label: "Accounts",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.FileText />,
        submenuItems: [
          {
            label: "Bank Account",
            link: "/bank-account",
            showSubRoute: false,
          },
          {
            label: "Bank Clearance",
            link: "/bank-clearance",
            showSubRoute: false,
          },
        ]
      },
      {
        label: "Pay",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.FileText />,
        submenuItems: [
          {
            label: "Purchase Invoice",
            link: "/expense-category",
            showSubRoute: false,
          },
          {
            label: "Payment Entry",
            link: "/payment-entry",
            showSubRoute: false,
          },
          {
            label: "Payment Reconciliation",
            link: "/payment-reconciliation",
            showSubRoute: false,
          },
        ],
      },
      {
        label: "Receive",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.FileText />,
        submenuItems: [
          { label: "Expenses", link: "/expense-list", showSubRoute: false },
          {
            label: "Sales Invoice",
            link: "/sales-invoice",
            showSubRoute: false,
          },
          {
            label: "Payment Entry",
            link: "/payment-entry",
            showSubRoute: false,
          },
          {
            label: "Payment Reconciliation",
            link: "/payment-reconciliation",
            showSubRoute: false,
          },
        ],
      },
    ],
  },
  {
    label: "People",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "People",

    submenuItems: [
      {
        label: "Customer",
        link: "/customer",
        icon: <Icon.User />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Supplier",
        link: "/supplier",
        icon: <Icon.Users />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Employee",
        link: "/empoyee",
        icon: <Icon.Users />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Share Holder",
        link: "/share-holder",
        icon: <Icon.Users />,
        showSubRoute: false,
        submenu: false,
      },
      /*
      {
        label: "Stores",
        link: "/store-list",
        icon: <Icon.Home />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Warehouses",
        link: "/warehouse",
        icon: <Icon.Archive />,
        showSubRoute: false,
        submenu: false,
      },*/
    ],
  },
  /*
  {
    label: "HRM",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "HRM",
    submenuItems: [
      {
        label: "Employees",
        link: "/employees-grid",
        icon: <Icon.Users />,
        showSubRoute: false,
      },
      {
        label: "Departments",
        link: "/department-grid",
        icon: <Icon.User />,
        showSubRoute: false,
      },
      {
        label: "Designations",
        link: "/designation",
        icon: <Icon.UserCheck />,
        showSubRoute: false,
      },
      {
        label: "Shifts",
        link: "/shift",
        icon: <Icon.Shuffle />,
        showSubRoute: false,
      },

      {
        label: "Attendance",
        link: "#",
        icon: <Icon.Clock />,
        showSubRoute: false,
        submenu: true,

        submenuItems: [
          { label: "Employee", link: "/attendance-employee" },
          { label: "Admin", link: "/attendance-admin" },
        ],
      },
      {
        label: "Leaves",
        link: "#",
        icon: <Icon.Calendar />,
        showSubRoute: false,
        submenu: true,
        submenuItems: [
          { label: "Employee Leaves", link: "/leaves-employee" },
          { label: "Admin Leaves", link: "/leaves-admin" },
          { label: "Leave Types", link: "/leave-types" },
        ],
      },
      {
        label: "Holidays",
        link: "/holidays",
        icon: <Icon.CreditCard />,
        showSubRoute: false,
      },

      {
        label: "Payroll",
        link: "#",
        icon: <Icon.DollarSign />,
        showSubRoute: false,
        submenu: true,
        submenuItems: [
          { label: "Employee Salary", link: "/payroll-list" },
          { label: "Payslip", link: "/payslip" },
        ],
      },
    ],
  },*/
  {
    label: "Reports",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Reports",
    submenuItems: [
      {
        label: "Sales Report",
        link: "/sales-report",
        icon: <Icon.BarChart2 />,
        showSubRoute: false,
      },
      {
        label: "Purchase Report",
        link: "/purchase-report",
        icon: <Icon.PieChart />,
        showSubRoute: false,
      },
      {
        label: "Inventory Report",
        link: "/inventory-report",
        icon: <Icon.Inbox />,
        showSubRoute: false,
      },
      {
        label: "Invoice Report",
        link: "/invoice-report",
        icon: <Icon.File />,
        showSubRoute: false,
      },
      {
        label: "Supplier Report",
        link: "/supplier-report",
        icon: <Icon.UserCheck />,
        showSubRoute: false,
      },
      {
        label: "Customer Report",
        link: "/customer-report",
        icon: <Icon.User />,
        showSubRoute: false,
      },
      {
        label: "Expense Report",
        link: "/expense-report",
        icon: <Icon.FileText />,
        showSubRoute: false,
      },
      {
        label: "Income Report",
        link: "/income-report",
        icon: <Icon.BarChart />,
        showSubRoute: false,
      },
      {
        label: "Tax Report",
        link: "/tax-report",
        icon: <Icon.Database />,
        showSubRoute: false,
      },
      {
        label: "Profit & Loss",
        link: "/profit-loss-report",
        icon: <Icon.TrendingDown />,
        showSubRoute: false,
      },
    ],
  },

  {
    label: "User Management",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "User Management",
    submenuItems: [
      {
        label: "Users",
        link: "/users",
        icon: <Icon.UserCheck />,
        showSubRoute: false,
      },
      {
        label: "Roles & Permissions",
        link: "/roles-permissions",
        icon: <Icon.UserCheck />,
        showSubRoute: false,
      },
      {
        label: "Delete Account Request",
        link: "/delete-account",
        icon: <Icon.Lock />,
        showSubRoute: false,
      },
    ],
  },
  /*
  {
    label: "Pages",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Pages",
    submenuItems: [
      {
        label: "Profile",
        link: "/profile",
        icon: <Icon.User />,
        showSubRoute: false,
      },
      {
        label: "Authentication",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.Shield />,
        submenuItems: [
          {
            label: "Login",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              { label: "Cover", link: "/signin", showSubRoute: false },
              { label: "Illustration", link: "/signin-2", showSubRoute: false },
              { label: "Basic", link: "/signin-3", showSubRoute: false },
            ],
          },
          {
            label: "Register",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              { label: "Cover", link: "/register", showSubRoute: false },
              {
                label: "Illustration",
                link: "/register-2",
                showSubRoute: false,
              },
              { label: "Basic", link: "/register-3", showSubRoute: false },
            ],
          },
          {
            label: "Forgot Password",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              { label: "Cover", link: "/forgot-password", showSubRoute: false },
              {
                label: "Illustration",
                link: "/forgot-password-2",
                showSubRoute: false,
              },
              {
                label: "Basic",
                link: "/forgot-password-3",
                showSubRoute: false,
              },
            ],
          },
          {
            label: "Reset Password",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              { label: "Cover", link: "/reset-password", showSubRoute: false },
              {
                label: "Illustration",
                link: "/reset-password-2",
                showSubRoute: false,
              },
              {
                label: "Basic",
                link: "/reset-password-3",
                showSubRoute: false,
              },
            ],
          },
          {
            label: "Email Verification",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              {
                label: "Cover",
                link: "/email-verification",
                showSubRoute: false,
              },
              {
                label: "Illustration",
                link: "/email-verification-2",
                showSubRoute: false,
              },
              {
                label: "Basic",
                link: "/email-verification-3",
                showSubRoute: false,
              },
            ],
          },
          {
            label: "2 Step Verification",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              {
                label: "Cover",
                link: "/two-step-verification",
                showSubRoute: false,
              },
              {
                label: "Illustration",
                link: "/two-step-verification-2",
                showSubRoute: false,
              },
              {
                label: "Basic",
                link: "/two-step-verification-3",
                showSubRoute: false,
              },
            ],
          },
          { label: "Lock Screen", link: "/lock-screen", showSubRoute: false },
        ],
      },
      {
        label: "Error Pages",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.FileMinus />,
        submenuItems: [
          { label: "404 Error", link: "/error-404", showSubRoute: false },
          { label: "500 Error", link: "/error-500", showSubRoute: false },
        ],
      },
      // {
      //   label: "Places",
      //   submenu: true,
      //   showSubRoute: false,
      //   icon: <Icon.Map />,
      //   submenuItems: [
      //     { label: "Countries", link: "countries",showSubRoute: false },
      //     { label: "States", link: "states",showSubRoute: false }
      //   ]
      // },
      {
        label: "Blank Page",
        link: "/blank-page",
        icon: <Icon.File />,
        showSubRoute: false,
      },
      {
        label: "Coming Soon",
        link: "/coming-soon",
        icon: <Icon.Send />,
        showSubRoute: false,
      },
      {
        label: "Under Maintenance",
        link: "/under-maintenance",
        icon: <Icon.AlertTriangle />,
        showSubRoute: false,
      },
    ],
  },*/

  {
    label: "Settings",
    submenu: true,
    showSubRoute: false,
    submenuHdr: "Settings",
    submenuItems: [
      {
        label: "General Settings",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.Settings />,
        submenuItems: [
          { label: "Profile", link: "/general-settings" },
          { label: "Security", link: "/security-settings" },
          { label: "Notifications", link: "/notification" },
          /*{ label: "Connected Apps", link: "/connected-apps" },*/
        ],
      },
      {
        label: "Website Settings",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.Globe />,
        submenuItems: [
          {
            label: "System Settings",
            link: "/system-settings",
            showSubRoute: false,
          },
          {
            label: "Company Settings",
            link: "/company-settings",
            showSubRoute: false,
          },
          {
            label: "Localization",
            link: "/localization-settings",
            showSubRoute: false,
          },
          { label: "Prefixes", link: "/prefixes", showSubRoute: false },
          { label: "Preference", link: "/preference", showSubRoute: false },
          { label: "Appearance", link: "/appearance", showSubRoute: false },
          {
            label: "Social Authentication",
            link: "/social-authentication",
            showSubRoute: false,
          },
          {
            label: "Language",
            link: "/language-settings",
            showSubRoute: false,
          },
        ],
      },
      {
        label: "App Settings",
        submenu: true,

        showSubRoute: false,
        icon: <Icon.Smartphone />,
        submenuItems: [
          { label: "Invoice", link: "/invoice-settings", showSubRoute: false },
          { label: "Printer", link: "/printer-settings", showSubRoute: false },
          { label: "POS", link: "/pos-settings", showSubRoute: false },
          {
            label: "Custom Fields",
            link: "/custom-fields",
            showSubRoute: false,
          },
        ],
      },
      {
        label: "System Settings",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.Monitor />,
        submenuItems: [
          { label: "Email", link: "/email-settings", showSubRoute: false },
          { label: "SMS Gateways", link: "/sms-gateway", showSubRoute: false },
          { label: "OTP", link: "/otp-settings", showSubRoute: false },
          {
            label: "GDPR Cookies",
            link: "/gdpr-settings",
            showSubRoute: false,
          },
        ],
      },
      {
        label: "Financial Settings",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.DollarSign />,
        submenuItems: [
          {
            label: "Party Type",
            link: "/party-type",
            showSubRoute: false,
          },
          {
            label: "Payment Gateway",
            link: "/payment-gateway-settings",
            showSubRoute: false,
          },
          { label: "Tax Rates", link: "/tax-rates", showSubRoute: false },
          {
            label: "Currencies",
            link: "/currency-settings",
            showSubRoute: false,
          },
          {
            label: "Fiscal Year",
            link: "/fiscal-year",
            showSubRoute: false,
          },
          {
            label: "Payment Term",
            link: "/payment-term",
            showSubRoute: false,
          },
          {
            label: "Mode of Payment",
            link: "/mode-of-payment",
            showSubRoute: false,
          },
          {
            label: "Tax Category",
            link: "/tax-category",
            showSubRoute: false,
          },
          {
            label: "Bank",
            link: "/bank",
            showSubRoute: false,
          },
          {
            label: "Bank Account",
            link: "/bank-settings-grid",
            showSubRoute: false,
          },
          {
            label: "Cost Centre",
            link: "/cost-centre",
            showSubRoute: false,
          },
          {
            label: "Project",
            link: "/project",
            showSubRoute: false,
          },
          {
            label: "Chart of Accounts",
            link: "/chart-of-accounts",
            showSubRoute: false,
          }
        ],
      },
      {
        label: "Other Settings",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.Hexagon />,
        submenuItems: [
          { label: "Storage", link: "/storage-settings", showSubRoute: false },
          {
            label: "Ban IP Address",
            link: "/ban-ip-address",
            showSubRoute: false,
          },
        ],
      },
      {
        label: "Logout",
        link: "/signin",
        icon: <Icon.LogOut />,
        showSubRoute: false,
      },
    ],
  },

  /*{
    label: "UI Interface",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "UI Interface",
    submenuItems: [
      {
        label: "Base UI",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.Layers />,
        submenuItems: [
          { label: "Alerts", link: "/ui-alerts", showSubRoute: false },
          { label: "Accordion", link: "/ui-accordion", showSubRoute: false },
          { label: "Avatar", link: "/ui-avatar", showSubRoute: false },
          { label: "Badges", link: "/ui-badges", showSubRoute: false },
          { label: "Border", link: "/ui-borders", showSubRoute: false },
          { label: "Buttons", link: "/ui-buttons", showSubRoute: false },
          {
            label: "Button Group",
            link: "/ui-buttons-group",
            showSubRoute: false,
          },
          { label: "Breadcrumb", link: "/ui-breadcrumb", showSubRoute: false },
          { label: "Card", link: "/ui-cards", showSubRoute: false },
          { label: "Carousel", link: "/ui-carousel", showSubRoute: false },
          { label: "Colors", link: "/ui-colors", showSubRoute: false },
          { label: "Dropdowns", link: "/ui-dropdowns", showSubRoute: false },
          { label: "Grid", link: "/ui-grid", showSubRoute: false },
          { label: "Images", link: "/ui-images", showSubRoute: false },
          { label: "Lightbox", link: "/ui-lightbox", showSubRoute: false },
          { label: "Media", link: "/ui-media", showSubRoute: false },
          { label: "Modals", link: "/ui-modals", showSubRoute: false },
          { label: "Offcanvas", link: "/ui-offcanvas", showSubRoute: false },
          { label: "Pagination", link: "/ui-pagination", showSubRoute: false },
          { label: "Popovers", link: "/ui-popovers", showSubRoute: false },
          { label: "Progress", link: "/ui-progress", showSubRoute: false },
          {
            label: "Placeholders",
            link: "/ui-placeholders",
            showSubRoute: false,
          },
          {
            label: "Range Slider",
            link: "/ui-rangeslider",
            showSubRoute: false,
          },
          { label: "Spinner", link: "/ui-spinner", showSubRoute: false },
          {
            label: "Sweet Alerts",
            link: "/ui-sweetalerts",
            showSubRoute: false,
          },
          { label: "Tabs", link: "/ui-nav-tabs", showSubRoute: false },
          { label: "Toasts", link: "/ui-toasts", showSubRoute: false },
          { label: "Tooltips", link: "/ui-tooltips", showSubRoute: false },
          { label: "Typography", link: "/ui-typography", showSubRoute: false },
          { label: "Video", link: "/ui-video", showSubRoute: false },
        ],
      },
      {
        label: "Advanced UI",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.Layers />,
        submenuItems: [
          { label: "Ribbon", link: "/ui-ribbon", showSubRoute: false },
          { label: "Clipboard", link: "/ui-clipboard", showSubRoute: false },
          { label: "Drag & Drop", link: "/ui-drag-drop", showSubRoute: false },
          {
            label: "Range Slider",
            link: "/ui-rangeslider",
            showSubRoute: false,
          },
          { label: "Rating", link: "/ui-rating", showSubRoute: false },
          {
            label: "Text Editor",
            link: "/ui-text-editor",
            showSubRoute: false,
          },
          { label: "Counter", link: "/ui-counter", showSubRoute: false },
          { label: "Scrollbar", link: "/ui-scrollbar", showSubRoute: false },
          { label: "Sticky Note", link: "/ui-stickynote", showSubRoute: false },
          { label: "Timeline", link: "/ui-timeline", showSubRoute: false },
        ],
      },
      {
        label: "Charts",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.BarChart2 />,
        submenuItems: [
          { label: "Apex Charts", link: "/chart-apex", showSubRoute: false },
          { label: "Chart Js", link: "/chart-js", showSubRoute: false },
        ],
      },
      {
        label: "Icons",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.Database />,
        submenuItems: [
          {
            label: "Fontawesome Icons",
            link: "/icon-fontawesome",
            showSubRoute: false,
          },
          {
            label: "Feather Icons",
            link: "/icon-feather",
            showSubRoute: false,
          },
          { label: "Ionic Icons", link: "/icon-ionic", showSubRoute: false },
          {
            label: "Material Icons",
            link: "/icon-material",
            showSubRoute: false,
          },
          { label: "Pe7 Icons", link: "/icon-pe7", showSubRoute: false },
          {
            label: "Simpleline Icons",
            link: "/icon-simpleline",
            showSubRoute: false,
          },
          {
            label: "Themify Icons",
            link: "/icon-themify",
            showSubRoute: false,
          },
          {
            label: "Weather Icons",
            link: "/icon-weather",
            showSubRoute: false,
          },
          {
            label: "Typicon Icons",
            link: "/icon-typicon",
            showSubRoute: false,
          },
          { label: "Flag Icons", link: "/icon-flag", showSubRoute: false },
        ],
      },
      {
        label: "Forms",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.Edit />,
        submenuItems: [
          {
            label: "Form Elements",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              {
                label: "Basic Inputs",
                link: "/form-basic-inputs",
                showSubRoute: false,
              },
              {
                label: "Checkbox & Radios",
                link: "/form-checkbox-radios",
                showSubRoute: false,
              },
              {
                label: "Input Groups",
                link: "/form-input-groups",
                showSubRoute: false,
              },
              {
                label: "Grid & Gutters",
                link: "/form-grid-gutters",
                showSubRoute: false,
              },
              {
                label: "Form Select",
                link: "/form-select",
                showSubRoute: false,
              },
              { label: "Input Masks", link: "/form-mask", showSubRoute: false },
              {
                label: "File Uploads",
                link: "/form-fileupload",
                showSubRoute: false,
              },
            ],
          },
          {
            label: "Layouts",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              { label: "Horizontal Form", link: "/form-horizontal" },
              { label: "Vertical Form", link: "/form-vertical" },
              { label: "Floating Labels", link: "/form-floating-labels" },
            ],
          },
          { label: "Form Validation", link: "/form-validation" },
          { label: "Select", link: "/form-select2" },
          { label: "Form Wizard", link: "/form-wizard" },
        ],
      },
      {
        label: "Tables",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.Columns />,
        submenuItems: [
          { label: "Basic Tables", link: "/tables-basic" },
          { label: "Data Table", link: "/data-tables" },
        ],
      },
    ],
  },
  {
    label: "Help",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Help",
    submenuItems: [
      {
        label: "Documentation",
        link: "#",
        icon: <Icon.FileText />,
        showSubRoute: false,
      },
      {
        label: "Changelog v2.0.7",
        link: "#",
        icon: <Icon.Lock />,
        showSubRoute: false,
      },
      {
        label: "Multi Level",
        showSubRoute: false,
        submenu: true,
        icon: <Icon.FileMinus />,
        submenuItems: [
          { label: "Level 1.1", link: "#", showSubRoute: false },
          {
            label: "Level 1.2",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              { label: "Level 2.1", link: "#", showSubRoute: false },
              {
                label: "Level 2.2",
                submenu: true,
                showSubRoute: false,
                submenuItems: [
                  { label: "Level 3.1", link: "#", showSubRoute: false },
                  { label: "Level 3.2", link: "#", showSubRoute: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },*/
];
