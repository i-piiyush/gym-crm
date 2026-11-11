# Constants (`src/constants`)

Static enums, thresholds, and route identifiers.

## Modules
- `roles.ts`: System roles (`SUPER_ADMIN`, `ADMIN`, `TRAINER`, `CUSTOMER`) and role hierarchy logic.
- `status.ts`: Lifecycle status enums for gyms, users, customer memberships, payments, and receipt delivery.
- `attendance.ts`: Attendance constants:
  - `ATTENDANCE_RADIUS_METERS = 50`
  - `MAX_GPS_ACCURACY_METERS = 50`
  - `QR_WINDOW_SECONDS = 15`
  - `GEOLOCATION_TIMEOUT_MS = 10000`
- `routes.ts`: Centralized route paths and role-based redirect targets.

