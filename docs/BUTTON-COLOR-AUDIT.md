# Button color audit

Updated 16 November 2026.

Audited 160 source definitions: 75 shared Buttons, 8 animated Buttons, 4 native buttons, 2 tab triggers, 2 close buttons, 5 menu items, 2 command items, and 62 links. Also checked all six shared variants and two Clerk button appearance rules. Repeated controls created by mapping over records share their source definition.

## Results

- The initial compiled CSS audit found contrast failures in 18 source definitions. Receipt download and gym invitation resend controls included identical background and text colors. Selected attendance and people tabs inherited a primary hover background with incompatible text.
- Corrected controls use explicit ghost, outline, link, secondary, or destructive variants. Selected tabs preserve their selected surface on hover. Status actions keep their semantic foreground on hover.
- Animated buttons now use the shared Button variants. Shared variants explicitly pair hover backgrounds and foregrounds.
- Darkened destructive backgrounds and camera retry backgrounds to keep small text readable. Status action icons inherit their button foreground. Clerk now specifies primary foregrounds for both themes and explicit primary/social button hover pairs.
- 1910 static combinations of class branches, theme, and normal/hover/focus/selected/pressed state passed the 4.5:1 text contrast threshold. Lowest calculated contrast, including fixed child foreground colors, was 4.70:1.
- TypeScript and Tailwind compilation passed. Whitespace validation passed.

## Scope of verification

These are source and compiled CSS checks, not browser measurements. Transparent backgrounds are composited over source containing surfaces; their final color can vary with the actual rendered backdrop. Conditional class branches are inspected separately. Shared variant definitions use the page background as their backdrop. Disabled opacity is excluded from the contrast requirement.

The browser connection was unavailable, so rendered pages, live Clerk-generated UI, loading transitions, and vendor-internal styles were not visually verified. Clerk entries below verify the configured appearance rules.

## Color inventory

Each pair is **background / text**. Normal and hover colors are shown for both themes. Conditional definitions have one row per class branch. The minimum also includes focus, selected, pressed, and fixed child foreground colors.

| Source definition | Class branch | Light normal | Light hover | Dark normal | Dark hover | Minimum contrast |
| --- | --- | --- | --- | --- | --- | --- |
| `src/app/not-found.tsx:20` | — | `#242424 / #ffffff` | `#393939 / #ffffff` | `#e3e7d0 / #1b221f` | `#ccd0bd / #1b221f` | 10.30:1 |
| `src/app/(auth)/layout.tsx:37` | — | `#ffffff / #6d6779` | `#ffffff / #242424` | `#1f2321 / #abafa7` | `#1f2321 / #f2f2ee` | 5.41:1 |
| `src/app/(auth)/layout.tsx:53` | — | `#ffffff / #6d6779` | `#ffffff / #6d6779` | `#1f2321 / #abafa7` | `#1f2321 / #abafa7` | 5.41:1 |
| `src/app/(auth)/layout.tsx:54` | — | `#ffffff / #6d6779` | `#ffffff / #6d6779` | `#1f2321 / #abafa7` | `#1f2321 / #abafa7` | 5.41:1 |
| `src/app/(auth)/layout.tsx:55` | — | `#ffffff / #6d6779` | `#ffffff / #6d6779` | `#1f2321 / #abafa7` | `#1f2321 / #abafa7` | 5.41:1 |
| `src/app/checkin/page.tsx:42` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/app/help/page.tsx:13` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/app/not-invited/page.tsx:14` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #242424` | `#151917 / #abafa7` | `#151917 / #f2f2ee` | 5.22:1 |
| `src/app/not-invited/page.tsx:23` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/components/layout/BottomNav.tsx:31` | 1 of 2 | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/components/layout/BottomNav.tsx:31` | 2 of 2 | `#fbfbf9 / #6d6779` | `#fbfbf9 / #242424` | `#151917 / #abafa7` | `#151917 / #f2f2ee` | 5.22:1 |
| `src/components/layout/Sidebar.tsx:59` | 1 of 4 | `#f1f5dc / #242424` | `#f1f5dc / #242424` | `#373a2a / #f2f2ee` | `#373a2a / #f2f2ee` | 10.36:1 |
| `src/components/layout/Sidebar.tsx:59` | 2 of 4 | `#f1f5dc / #242424` | `#f1f5dc / #242424` | `#373a2a / #f2f2ee` | `#373a2a / #f2f2ee` | 10.36:1 |
| `src/components/layout/Sidebar.tsx:59` | 3 of 4 | `#fbfbf9 / #6d6779` | `#f6f5f4 / #242424` | `#151917 / #abafa7` | `#2c302e / #f2f2ee` | 5.22:1 |
| `src/components/layout/Sidebar.tsx:59` | 4 of 4 | `#fbfbf9 / #6d6779` | `#f6f5f4 / #242424` | `#151917 / #abafa7` | `#2c302e / #f2f2ee` | 5.22:1 |
| `src/components/layout/Sidebar.tsx:129` | 1 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #6d6779` | `#2c302e / #abafa7` | `#2c302e / #abafa7` | 4.97:1 |
| `src/components/layout/Sidebar.tsx:129` | 2 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #6d6779` | `#2c302e / #abafa7` | `#2c302e / #abafa7` | 4.97:1 |
| `src/components/layout/Sidebar.tsx:174` | — | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/components/layout/Topbar.tsx:113` | — | `#fbfbf9 / #6d6779` | `#f6f5f4 / #242424` | `#151917 / #abafa7` | `#2c302e / #f2f2ee` | 5.22:1 |
| `src/components/layout/Topbar.tsx:134` | — | `#fbfbf9 / #6d6779` | `#f6f5f4 / #242424` | `#151917 / #abafa7` | `#2c302e / #f2f2ee` | 5.22:1 |
| `src/components/layout/Topbar.tsx:150` | — | `#fbfbf9 / #6d6779` | `#f6f5f4 / #242424` | `#151917 / #abafa7` | `#2c302e / #f2f2ee` | 5.22:1 |
| `src/components/layout/Topbar.tsx:167` | — | `#fbfbf9 / #6d6779` | `#f6f5f4 / #242424` | `#151917 / #abafa7` | `#2c302e / #f2f2ee` | 5.22:1 |
| `src/components/layout/Topbar.tsx:182` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/components/layout/Topbar.tsx:204` | — | `#f6f5f4 / #6d6779` | `#f6f5f4 / #6d6779` | `#2c302e / #abafa7` | `#2c302e / #abafa7` | 4.97:1 |
| `src/components/layout/Topbar.tsx:248` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 11.88:1 |
| `src/components/layout/Topbar.tsx:272` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 11.88:1 |
| `src/components/shared/ConfirmDialog.tsx:49` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/components/shared/ConfirmDialog.tsx:53` | 1 of 2 | `#ce2222 / #ffffff` | `#d33838 / #ffffff` | `#ce2c2c / #ffffff` | `#bd2b2b / #ffffff` | 4.79:1 |
| `src/components/shared/ConfirmDialog.tsx:53` | 2 of 2 | `#242424 / #ffffff` | `#454545 / #ffffff` | `#e3e7d0 / #1b221f` | `#c6c9b6 / #1b221f` | 9.60:1 |
| `src/components/shared/InfoPage.tsx:18` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #6d6779` | `#151917 / #abafa7` | `#151917 / #abafa7` | 5.22:1 |
| `src/components/shared/InfoPage.tsx:35` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #6d6779` | `#151917 / #abafa7` | `#151917 / #abafa7` | 5.22:1 |
| `src/components/shared/InfoPage.tsx:36` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #6d6779` | `#151917 / #abafa7` | `#151917 / #abafa7` | 5.22:1 |
| `src/components/shared/InfoPage.tsx:37` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #6d6779` | `#151917 / #abafa7` | `#151917 / #abafa7` | 5.22:1 |
| `src/components/shared/PageError.tsx:20` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/components/shared/Pagination.tsx:24` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/components/shared/Pagination.tsx:36` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/components/theme/ThemeToggle.tsx:20` | — | `#fbfbf9 / #6d6779` | `#f6f5f4 / #242424` | `#151917 / #abafa7` | `#2c302e / #f2f2ee` | 5.22:1 |
| `src/components/theme/ThemeToggle.tsx:26` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 11.88:1 |
| `src/components/ui/dialog.tsx:49` | — | `#ffffff / #6d6779` | `#f6f5f4 / #6d6779` | `#1f2321 / #abafa7` | `#2c302e / #abafa7` | 4.97:1 |
| `src/components/ui/sheet.tsx:30` | — | `#ffffff / #6d6779` | `#f6f5f4 / #6d6779` | `#1f2321 / #abafa7` | `#2c302e / #abafa7` | 4.97:1 |
| `src/app/(super-admin)/super-admin/page.tsx:14` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/app/(super-admin)/super-admin/page.tsx:25` | — | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/attendance/components/CheckInCard.tsx:333` | — | `#242424 / #fbfbf9` | `#3a3a3a / #ffffff` | `#f2f2ee / #151917` | `#ddddd9 / #1b221f` | 11.44:1 |
| `src/features/attendance/components/CheckInCard.tsx:342` | — | `#fbfbf9 / #242424` | `#ffffff / #242424` | `#151917 / #f2f2ee` | `#1f2321 / #f2f2ee` | 5.22:1 |
| `src/features/attendance/components/CheckInCard.tsx:380` | — | `#e11d48 / #ffffff` | `#be123c / #ffffff` | `#e11d48 / #ffffff` | `#be123c / #ffffff` | 4.70:1 |
| `src/features/attendance/components/CheckInCard.tsx:390` | — | `#ffffff / #b51739` | `#fef1f1 / #b51739` | `#1f2321 / #f19daf` | `#48282f / #f19daf` | 6.06:1 |
| `src/features/attendance/components/CheckInCard.tsx:446` | 1 of 2 | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/attendance/components/CheckInCard.tsx:446` | 2 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/attendance/components/CheckInCard.tsx:460` | 1 of 2 | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/attendance/components/CheckInCard.tsx:460` | 2 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/attendance/components/CheckInCard.tsx:544` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/features/attendance/components/CheckInCard.tsx:552` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/features/attendance/components/CheckInCard.tsx:560` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/features/attendance/components/CheckInCard.tsx:568` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/features/attendance/components/CheckInCard.tsx:580` | — | `#242424 / #fbfbf9` | `#3a3a3a / #ffffff` | `#f2f2ee / #151917` | `#ddddd9 / #1b221f` | 11.44:1 |
| `src/features/attendance/components/LiveAttendanceView.tsx:120` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/features/attendance/components/LiveAttendanceView.tsx:163` | 1 of 2 | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/attendance/components/LiveAttendanceView.tsx:163` | 2 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/attendance/components/LiveAttendanceView.tsx:177` | 1 of 2 | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/attendance/components/LiveAttendanceView.tsx:177` | 2 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/attendance/components/QrCameraScanner.tsx:488` | — | `#047857 / #ffffff` | `#065f46 / #ffffff` | `#047857 / #ffffff` | `#065f46 / #ffffff` | 5.48:1 |
| `src/features/attendance/components/QrCameraScanner.tsx:498` | — | `#2e2e2e / #ffffff` | `#454545 / #ffffff` | `#2e2e2e / #ffffff` | `#454545 / #ffffff` | 9.53:1 |
| `src/features/attendance/components/QrCameraScanner.tsx:514` | — | `#171717 / #d4d4d4` | `#262626 / #ffffff` | `#171717 / #d4d4d4` | `#262626 / #ffffff` | 12.09:1 |
| `src/features/attendance/components/QrCameraScanner.tsx:525` | 1 of 2 | `#3a2e0f / #fcd34d` | `#3a2e0f / #fcd34d` | `#3a2e0f / #fcd34d` | `#3a2e0f / #fcd34d` | 9.21:1 |
| `src/features/attendance/components/QrCameraScanner.tsx:525` | 2 of 2 | `#171717 / #d4d4d4` | `#262626 / #ffffff` | `#171717 / #d4d4d4` | `#262626 / #ffffff` | 12.09:1 |
| `src/features/attendance/components/QrCodeStation.tsx:121` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/features/customer/components/CustomerAttendanceView.tsx:114` | — | `#242424 / #ffffff` | `#393939 / #ffffff` | `#e3e7d0 / #1b221f` | `#ced2bd / #1b221f` | 10.48:1 |
| `src/features/customer/components/CustomerOverview.tsx:93` | — | `#242424 / #fbfbf9` | `#3a3a3a / #fbfbf9` | `#f2f2ee / #151917` | `#ddddd9 / #151917` | 11.02:1 |
| `src/features/customer/components/CustomerOverview.tsx:237` | — | `#ffffff / #6d6779` | `#ffffff / #242424` | `#1f2321 / #abafa7` | `#1f2321 / #f2f2ee` | 5.41:1 |
| `src/features/customer/components/CustomerPaymentsTable.tsx:176` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 10.55:1 |
| `src/features/dashboard/components/DashboardOverview.tsx:87` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/features/dashboard/components/DashboardOverview.tsx:93` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/features/dashboard/components/DashboardOverview.tsx:137` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #242424` | `#151917 / #abafa7` | `#151917 / #f2f2ee` | 5.22:1 |
| `src/features/dashboard/components/DashboardOverview.tsx:160` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/features/dashboard/components/DashboardOverview.tsx:174` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/features/dashboard/components/DashboardOverview.tsx:262` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/features/marketing/components/LandingPage.tsx:23` | — | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/marketing/components/LandingPage.tsx:47` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/features/marketing/components/LandingPage.tsx:52` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/features/marketing/components/LandingPage.tsx:215` | — | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/marketing/components/LandingPage.tsx:349` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/features/marketing/components/LandingPage.tsx:370` | — | `#242424 / #ffffff` | `#42433e / #ffffff` | `#e3e7d0 / #1b221f` | `#cbceb8 / #1b221f` | 9.99:1 |
| `src/features/marketing/components/LandingPage.tsx:389` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #242424` | `#151917 / #abafa7` | `#151917 / #f2f2ee` | 5.22:1 |
| `src/features/marketing/components/LandingPage.tsx:395` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #242424` | `#151917 / #abafa7` | `#151917 / #f2f2ee` | 5.22:1 |
| `src/features/marketing/components/LandingPage.tsx:401` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #242424` | `#151917 / #abafa7` | `#151917 / #f2f2ee` | 5.22:1 |
| `src/features/marketing/components/LandingPage.tsx:407` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #242424` | `#151917 / #abafa7` | `#151917 / #f2f2ee` | 5.22:1 |
| `src/features/marketing/components/LandingPage.tsx:413` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #242424` | `#151917 / #abafa7` | `#151917 / #f2f2ee` | 5.22:1 |
| `src/features/marketing/components/LandingPage.tsx:425` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #6d6779` | `#151917 / #abafa7` | `#151917 / #abafa7` | 5.22:1 |
| `src/features/marketing/components/LandingPage.tsx:426` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #6d6779` | `#151917 / #abafa7` | `#151917 / #abafa7` | 5.22:1 |
| `src/features/marketing/components/MarketingNav.tsx:24` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #242424` | `#151917 / #abafa7` | `#151917 / #f2f2ee` | 5.22:1 |
| `src/features/marketing/components/MarketingNav.tsx:27` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #242424` | `#151917 / #abafa7` | `#151917 / #f2f2ee` | 5.22:1 |
| `src/features/marketing/components/MarketingNav.tsx:30` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #242424` | `#151917 / #abafa7` | `#151917 / #f2f2ee` | 5.22:1 |
| `src/features/marketing/components/MarketingNav.tsx:36` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/features/marketing/components/MarketingNav.tsx:39` | — | `#fbfbf9 / #6d6779` | `#f6f5f4 / #242424` | `#151917 / #abafa7` | `#2c302e / #f2f2ee` | 5.22:1 |
| `src/features/marketing/components/MarketingNav.tsx:58` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/features/marketing/components/MarketingNav.tsx:67` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/features/payments/components/PaymentsTable.tsx:274` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/payments/components/PaymentsTable.tsx:291` | — | `#fbfbf9 / #6d6779` | `#f6f5f4 / #242424` | `#151917 / #abafa7` | `#2c302e / #f2f2ee` | 5.22:1 |
| `src/features/payments/components/PaymentsView.tsx:68` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/features/payments/components/RecordPaymentDialog.tsx:244` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/features/payments/components/RecordPaymentDialog.tsx:253` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/features/people/components/AddPersonDialog.tsx:145` | 1 of 2 | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/people/components/AddPersonDialog.tsx:145` | 2 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/people/components/AddPersonDialog.tsx:157` | 1 of 2 | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/people/components/AddPersonDialog.tsx:157` | 2 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/people/components/AddPersonDialog.tsx:482` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/features/people/components/AddPersonDialog.tsx:491` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/features/people/components/CustomersTable.tsx:184` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/features/people/components/CustomersTable.tsx:229` | — | `#fbfbf9 / #6d6779` | `#f6f5f4 / #242424` | `#151917 / #abafa7` | `#2c302e / #f2f2ee` | 5.22:1 |
| `src/features/people/components/CustomersTable.tsx:239` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 11.88:1 |
| `src/features/people/components/CustomersTable.tsx:240` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/features/people/components/CustomersTable.tsx:245` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 11.88:1 |
| `src/features/people/components/CustomersTable.tsx:246` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/features/people/components/CustomersTable.tsx:251` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 11.88:1 |
| `src/features/people/components/CustomersTable.tsx:261` | — | `#fbfbf9 / #b51739` | `#fbfbf9 / #b51739` | `#151917 / #f19daf` | `#151917 / #f19daf` | 6.06:1 |
| `src/features/people/components/CustomersTable.tsx:288` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/features/people/components/MemberProfile.tsx:73` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #242424` | `#151917 / #abafa7` | `#151917 / #f2f2ee` | 5.22:1 |
| `src/features/people/components/MemberProfile.tsx:99` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/features/people/components/MemberProfile.tsx:108` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #6d6779` | `#151917 / #abafa7` | `#151917 / #abafa7` | 5.22:1 |
| `src/features/people/components/MemberProfile.tsx:116` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #6d6779` | `#151917 / #abafa7` | `#151917 / #abafa7` | 5.22:1 |
| `src/features/people/components/MemberProfile.tsx:145` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #6d6779` | `#151917 / #abafa7` | `#151917 / #abafa7` | 5.22:1 |
| `src/features/people/components/MemberProfile.tsx:146` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #6d6779` | `#151917 / #abafa7` | `#151917 / #abafa7` | 5.22:1 |
| `src/features/people/components/MemberProfile.tsx:199` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/features/people/components/PeopleView.tsx:128` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/features/people/components/PeopleView.tsx:150` | 1 of 2 | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/people/components/PeopleView.tsx:150` | 2 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/people/components/PeopleView.tsx:164` | 1 of 2 | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/people/components/PeopleView.tsx:164` | 2 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/people/components/PeopleView.tsx:178` | 1 of 2 | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/people/components/PeopleView.tsx:178` | 2 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/people/components/PeopleView.tsx:245` | — | `#fef1f1 / #b51739` | `#fef1f1 / #b51739` | `#48282f / #f19daf` | `#48282f / #f19daf` | 6.06:1 |
| `src/features/people/components/TrainersTable.tsx:156` | — | `#fbfbf9 / #b51739` | `#fef1f1 / #b51739` | `#151917 / #f19daf` | `#48282f / #f19daf` | 6.06:1 |
| `src/features/reports/components/ReportsView.tsx:38` | 1 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/reports/components/ReportsView.tsx:38` | 2 of 2 | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/reports/components/ReportsView.tsx:51` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/features/salaries/components/SalariesTable.tsx:277` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/features/settings/components/AccountSettings.tsx:26` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/features/settings/components/PlansCrud.tsx:203` | — | `#242424 / #fbfbf9` | `#3a3a3a / #ffffff` | `#f2f2ee / #151917` | `#ddddd9 / #1b221f` | 11.44:1 |
| `src/features/settings/components/PlansCrud.tsx:224` | — | `#242424 / #fbfbf9` | `#393939 / #ffffff` | `#f2f2ee / #151917` | `#dcddd9 / #1b221f` | 11.48:1 |
| `src/features/settings/components/PlansCrud.tsx:254` | 1 of 2 | `#d0e1d5 / #285336` | `#dae7dd / #285336` | `#374e3d / #abd4b5` | `#324537 / #abd4b5` | 5.54:1 |
| `src/features/settings/components/PlansCrud.tsx:254` | 2 of 2 | `#fbfbf9 / #6d6779` | `#f6f5f4 / #242424` | `#151917 / #abafa7` | `#2c302e / #f2f2ee` | 5.22:1 |
| `src/features/settings/components/PlansCrud.tsx:294` | — | `#fbfbf9 / #242424` | `#ffffff / #242424` | `#151917 / #f2f2ee` | `#1f2321 / #f2f2ee` | 5.22:1 |
| `src/features/settings/components/PlansCrud.tsx:446` | — | `#fbfbf9 / #242424` | `#ffffff / #242424` | `#151917 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/settings/components/PlansCrud.tsx:454` | — | `#242424 / #fbfbf9` | `#3a3a3a / #ffffff` | `#f2f2ee / #151917` | `#ddddd9 / #1b221f` | 11.44:1 |
| `src/features/settings/components/PlansCrud.tsx:605` | — | `#fbfbf9 / #242424` | `#ffffff / #242424` | `#151917 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/settings/components/PlansCrud.tsx:613` | — | `#242424 / #fbfbf9` | `#3a3a3a / #ffffff` | `#f2f2ee / #151917` | `#ddddd9 / #1b221f` | 11.44:1 |
| `src/features/subscriptions/components/SubscriptionsView.tsx:86` | — | `#fbfbf9 / #6d6779` | `#fbfbf9 / #242424` | `#151917 / #abafa7` | `#151917 / #f2f2ee` | 5.22:1 |
| `src/features/subscriptions/components/SubscriptionsView.tsx:112` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/features/subscriptions/components/SubscriptionsView.tsx:128` | 1 of 2 | `#ffffff / #63391d` | `#ffffff / #63391d` | `#1f2321 / #e8bf96` | `#1f2321 / #e8bf96` | 9.34:1 |
| `src/features/subscriptions/components/SubscriptionsView.tsx:128` | 2 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/subscriptions/components/SubscriptionsView.tsx:143` | 1 of 2 | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/subscriptions/components/SubscriptionsView.tsx:143` | 2 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/subscriptions/components/SubscriptionsView.tsx:158` | 1 of 2 | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/subscriptions/components/SubscriptionsView.tsx:158` | 2 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/subscriptions/components/SubscriptionsView.tsx:173` | 1 of 2 | `#ffffff / #b51739` | `#ffffff / #b51739` | `#1f2321 / #f19daf` | `#1f2321 / #f19daf` | 6.69:1 |
| `src/features/subscriptions/components/SubscriptionsView.tsx:173` | 2 of 2 | `#f6f5f4 / #6d6779` | `#f6f5f4 / #242424` | `#2c302e / #abafa7` | `#2c302e / #f2f2ee` | 4.97:1 |
| `src/features/subscriptions/components/SubscriptionsView.tsx:306` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/features/super-admin/components/CreateGymForm.tsx:262` | — | `#f4f2ec / #242424` | `#f6f5f4 / #242424` | `#2b362f / #f2f2ee` | `#2c302e / #f2f2ee` | 11.15:1 |
| `src/features/super-admin/components/CreateGymForm.tsx:375` | — | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #e3e7d0` | `#1f2321 / #e3e7d0` | 12.53:1 |
| `src/features/super-admin/components/CreateGymForm.tsx:429` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/features/super-admin/components/CreateGymForm.tsx:437` | — | `#242424 / #ffffff` | `#454545 / #ffffff` | `#e3e7d0 / #1b221f` | `#c6c9b6 / #1b221f` | 9.60:1 |
| `src/features/super-admin/components/EditGymForm.tsx:256` | — | `#f4f2ec / #242424` | `#f6f5f4 / #242424` | `#2b362f / #f2f2ee` | `#2c302e / #f2f2ee` | 11.15:1 |
| `src/features/super-admin/components/EditGymForm.tsx:361` | — | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #e3e7d0` | `#1f2321 / #e3e7d0` | 12.53:1 |
| `src/features/super-admin/components/EditGymForm.tsx:375` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/features/super-admin/components/EditGymForm.tsx:383` | — | `#242424 / #ffffff` | `#454545 / #ffffff` | `#e3e7d0 / #1b221f` | `#c6c9b6 / #1b221f` | 9.60:1 |
| `src/features/super-admin/components/GymsTable.tsx:161` | — | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #e3e7d0` | `#1f2321 / #e3e7d0` | 12.53:1 |
| `src/features/super-admin/components/GymsTable.tsx:216` | — | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #e3e7d0` | `#1f2321 / #e3e7d0` | 12.53:1 |
| `src/features/super-admin/components/GymsTable.tsx:227` | — | `#ffffff / #b51739` | `#ffffff / #b51739` | `#1f2321 / #f19daf` | `#1f2321 / #f19daf` | 6.69:1 |
| `src/features/super-admin/components/GymsTable.tsx:252` | — | `#ffffff / #6d6779` | `#f6f5f4 / #242424` | `#1f2321 / #abafa7` | `#2c302e / #f2f2ee` | 5.41:1 |
| `src/features/super-admin/components/GymsTable.tsx:260` | 1 of 2 | `#ffffff / #b51739` | `#fef1f1 / #b51739` | `#1f2321 / #f19daf` | `#48282f / #f19daf` | 6.06:1 |
| `src/features/super-admin/components/GymsTable.tsx:260` | 2 of 2 | `#ffffff / #285336` | `#d0e1d5 / #285336` | `#1f2321 / #abd4b5` | `#283e2f / #abd4b5` | 6.52:1 |
| `src/features/trainer/components/TrainerAttendanceView.tsx:101` | — | `#242424 / #ffffff` | `#393939 / #ffffff` | `#e3e7d0 / #1b221f` | `#ced2bd / #1b221f` | 10.48:1 |
| `src/features/trainer/components/TrainerOverview.tsx:74` | — | `#242424 / #fbfbf9` | `#3a3a3a / #fbfbf9` | `#f2f2ee / #151917` | `#ddddd9 / #151917` | 11.02:1 |
| `src/features/trainer/components/TrainerOverview.tsx:86` | — | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/trainer/components/TrainerOverview.tsx:103` | — | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/trainer/components/TrainerOverview.tsx:125` | — | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/trainer/components/TrainerOverview.tsx:148` | — | `#ffffff / #242424` | `#ffffff / #242424` | `#1f2321 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/features/trainer/components/TrainerOverview.tsx:184` | — | `#ffffff / #6d6779` | `#ffffff / #242424` | `#1f2321 / #abafa7` | `#1f2321 / #f2f2ee` | 5.41:1 |
| `src/features/trials/components/TrialsTable.tsx:197` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/app/(admin)/admin/attendance/page.tsx:30` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/app/(admin)/admin/settings/page.tsx:152` | — | `#fbfbf9 / #242424` | `#ffffff / #242424` | `#151917 / #f2f2ee` | `#1f2321 / #f2f2ee` | 14.10:1 |
| `src/app/(admin)/admin/staff/page.tsx:21` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/app/(super-admin)/super-admin/gyms/page.tsx:20` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/components/ui/button.tsx (Shared variant: default)` | — | `#242424 / #ffffff` | `#444444 / #ffffff` | `#e3e7d0 / #1b221f` | `#c4c8b4 / #1b221f` | 9.44:1 |
| `src/components/ui/button.tsx (Shared variant: secondary)` | — | `#f4f2ec / #242424` | `#f5f3ee / #242424` | `#2b362f / #f2f2ee` | `#26302a / #f2f2ee` | 11.15:1 |
| `src/components/ui/button.tsx (Shared variant: outline)` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
| `src/components/ui/button.tsx (Shared variant: ghost)` | — | `#fbfbf9 / #6d6779` | `#f6f5f4 / #242424` | `#151917 / #abafa7` | `#2c302e / #f2f2ee` | 5.22:1 |
| `src/components/ui/button.tsx (Shared variant: destructive)` | — | `#ce2222 / #ffffff` | `#d33737 / #ffffff` | `#ce2c2c / #ffffff` | `#bc2a2a / #ffffff` | 4.81:1 |
| `src/components/ui/button.tsx (Shared variant: link)` | — | `#fbfbf9 / #242424` | `#fbfbf9 / #242424` | `#151917 / #f2f2ee` | `#151917 / #f2f2ee` | 15.01:1 |
| `src/config/auth-appearance.ts:21` | — | `#242424 / #ffffff` | `#454545 / #ffffff` | `#e3e7d0 / #1b221f` | `#c6c9b6 / #1b221f` | 9.60:1 |
| `src/config/auth-appearance.ts:28` | — | `#ffffff / #242424` | `#f6f5f4 / #242424` | `#1f2321 / #f2f2ee` | `#2c302e / #f2f2ee` | 11.88:1 |
