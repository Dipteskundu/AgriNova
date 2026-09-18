# Mohiuddin — Farmer Portal AI Coding Agent Prompt

## 1. Project Context

This is a large agriculture platform divided among multiple developers.

**Mohiuddin is responsible ONLY for the Farmer Portal and the Admin Portal modules listed below.**

Another developer, Diptesh, is responsible for:
- Produce Marketplace
- Buyer Portal
- Supplier Portal
- Quality Inspector Portal

**IMPORTANT:** Do NOT implement Diptesh's modules. Do NOT create pages, components, APIs, database models, business logic, or UI for those modules unless a shared component is strictly required by Mohiuddin's modules.

---

# 2. Mohiuddin's Exact Scope

## Farmer Portal

Build ONLY these modules:

1. Farmer Dashboard
2. Profile
3. Farm Management
4. Field Management
5. Crop Recommendation
6. Crop Comparison
7. Crop Management
8. Crop Logs
9. Crop Calendar
10. Harvest Management
11. Farm Expenses
12. Profitability
13. Weather & Alerts
14. Agricultural Training
15. AI Recommendation Result UI
16. Farmer Notifications

## Admin Portal

Build ONLY these modules:

1. Admin Dashboard
2. User Management
3. Marketplace Management
4. Orders
5. Payments
6. Quality Management
7. Logistics
8. Training Management
9. Reports
10. Disputes

---

# 3. Core Technology Requirements

Use:

- Next.js
- TypeScript
- React
- Tailwind CSS
- Reusable React components
- Strong TypeScript types
- Clean and organized architecture
- Responsive design
- Mobile-first UI
- Accessible UI
- Proper loading states
- Proper empty states
- Proper error states
- Confirmation dialogs for destructive actions
- Toast notifications where appropriate

Do NOT introduce unnecessary libraries.

If an existing project already has a UI library, utility library, icon library, or API setup, reuse the existing setup instead of replacing it.

---

# 4. STRICT SCOPE RULE

This is the MOST IMPORTANT rule.

**AI MUST NOT WORK OUTSIDE MOHIUDDIN'S ASSIGNED MODULES.**

Do NOT build:

- Produce Marketplace frontend
- Buyer Portal
- Supplier Portal
- Quality Inspector Portal
- Buyer Dashboard
- Supplier Dashboard
- Inspector Dashboard
- Marketplace Home for public buyers
- Cart
- Checkout
- Buyer Demand Board
- Supplier Inventory
- Inspector Evaluation UI

Those belong to Diptesh.

If a requirement appears related to another developer's scope, do not implement it. Only create the minimum shared infrastructure needed by Mohiuddin's own modules.

---

# 5. Recommended Project Structure

Keep the project organized and modular.

Use a structure similar to:

src/
├── app/
│   ├── (farmer)/
│   │   └── farmer/
│   │       ├── dashboard/
│   │       ├── profile/
│   │       ├── farms/
│   │       ├── fields/
│   │       ├── crop-recommendation/
│   │       ├── crop-comparison/
│   │       ├── crops/
│   │       ├── crop-logs/
│   │       ├── crop-calendar/
│   │       ├── harvest/
│   │       ├── expenses/
│   │       ├── profitability/
│   │       ├── weather/
│   │       ├── training/
│   │       ├── ai-recommendations/
│   │       └── notifications/
│   │
│   └── (admin)/
│       └── admin/
│           ├── dashboard/
│           ├── users/
│           ├── marketplace/
│           ├── orders/
│           ├── payments/
│           ├── quality/
│           ├── logistics/
│           ├── training/
│           ├── reports/
│           └── disputes/
│
├── components/
│   ├── shared/
│   ├── farmer/
│   └── admin/
│
├── lib/
│   ├── api/
│   │   ├── farmer/
│   │   └── admin/
│   │
│   ├── actions/
│   │   ├── farmer/
│   │   └── admin/
│   │
│   └── core/
│       ├── fetch/
│       ├── auth/
│       └── session/
│
├── types/
│   ├── farmer/
│   ├── admin/
│   └── shared/
│
├── hooks/
├── utils/
└── constants/

The exact folder names may be adapted to the existing project, but the architecture must remain similarly organized.

---

# 6. API Architecture — MUST FOLLOW THIS

All API/data access code must be organized under:

src/lib/
├── api/        # Functions for reading/fetching data
├── actions/    # Server actions/functions for changing data
└── core/       # Shared fetch, auth header, session helpers

## src/lib/api/

Use this folder for read operations such as:

- getFarmerDashboard()
- getProfile()
- getFarms()
- getFarmById()
- getFields()
- getCrops()
- getCropLogs()
- getHarvests()
- getExpenses()
- getProfitability()
- getWeather()
- getTrainingList()
- getNotifications()

Admin examples:

- getAdminDashboard()
- getUsers()
- getMarketplaceProducts()
- getOrders()
- getPayments()
- getQualityRecords()
- getLogistics()
- getTraining()
- getReports()
- getDisputes()

Use proper TypeScript return types.

## src/lib/actions/

Use this folder for mutations/data-changing operations such as:

- updateProfile()
- createFarm()
- updateFarm()
- deleteFarm()
- createField()
- updateField()
- deleteField()
- createCrop()
- updateCrop()
- deleteCrop()
- createCropLog()
- createHarvest()
- createExpense()
- updateExpense()
- markNotificationAsRead()

Admin examples:

- updateUserStatus()
- approveMarketplaceItem()
- updateOrderStatus()
- updatePaymentStatus()
- updateQualityStatus()
- updateLogisticsStatus()
- createTraining()
- updateTraining()
- resolveDispute()

Use Server Actions only where the project/backend architecture supports them.

If the backend exposes REST APIs, actions should call the proper API endpoint through the shared core layer instead of duplicating fetch logic.

---

# 7. src/lib/core/

This folder MUST contain shared infrastructure.

Examples:

- API base URL handling
- fetch wrapper
- request headers
- authorization headers
- session/token helper
- common API error handling
- response parsing
- request timeout handling if required

Create reusable functions such as:

- apiFetch()
- getAuthHeaders()
- getSession()
- handleApiError()

Do NOT repeat fetch configuration in every API file.

Do NOT hard-code tokens.

Do NOT hard-code API URLs throughout components.

Use environment variables for API base URLs.

---

# 8. API RULES

Every API must have:

- Proper endpoint separation
- Proper HTTP method
- TypeScript request types
- TypeScript response types
- Error handling
- Loading handling in UI
- Empty state handling
- Authentication handling where required

Do NOT create fake API responses unless the task explicitly asks for mock data.

If the real backend endpoint is not available yet:

1. Create a clearly typed API function.
2. Keep the endpoint configurable.
3. Do not invent complicated backend behavior.
4. Do not create a fake backend.
5. Clearly isolate temporary mock data if mock data is absolutely required for UI development.

Never scatter mock data directly inside components.

---

# 9. TypeScript Rules

Avoid `any`.

Prefer:

- interface
- type
- union types
- generic types
- typed API responses
- typed form values
- typed component props

Example:

```ts
export interface Farm {
  id: string;
  name: string;
  location: string;
  totalArea: number;
  areaUnit: string;
}
```

Keep domain types in `src/types/`.

Do not duplicate the same interface in multiple components.

---

# 10. Reusable Components

Do NOT build the same UI repeatedly.

Create reusable components for common patterns such as:

- DataTable
- SearchInput
- FilterPanel
- Pagination
- PageHeader
- StatCard
- EmptyState
- ErrorState
- LoadingSkeleton
- ConfirmDialog
- StatusBadge
- FormField
- Modal
- DatePicker wrapper
- Select wrapper
- ChartCard
- NotificationItem
- File/Image upload UI where required

Then create domain-specific reusable components under:

src/components/farmer/
src/components/admin/

Examples:

Farmer:
- FarmCard
- FieldCard
- CropCard
- CropStatusBadge
- ExpenseSummary
- ProfitSummary
- WeatherCard
- RecommendationCard

Admin:
- UserStatusBadge
- OrderStatusBadge
- PaymentStatusBadge
- QualityStatusBadge
- LogisticsStatusBadge
- DisputeStatusBadge

---

# 11. Farmer Portal — Functional Expectations

## Dashboard

Show useful farming overview:

- Total farms
- Total fields
- Active crops
- Upcoming harvests
- Total expenses
- Estimated/reported profitability
- Weather summary
- Important alerts
- Recent notifications
- Recent farming activities

Use cards, charts, tables, and summaries where appropriate.

---

## Profile

Allow farmer to:

- View profile
- Edit profile
- Update contact information
- Update farm-related profile information if supported
- Update profile image if backend supports it

---

## Farm Management

Support:

- Farm list
- Farm details
- Create farm
- Edit farm
- Delete farm
- Farm status
- Farm location
- Farm area
- Relevant farm information

---

## Field Management

Support:

- Field list
- Field details
- Create field
- Edit field
- Delete field
- Area
- Soil information
- Irrigation information
- Current crop relationship

---

## Crop Recommendation

Provide UI for:

- Selecting farm/field
- Providing relevant crop conditions
- Requesting recommendation
- Showing recommended crops
- Recommendation reason
- Expected benefits
- Relevant farming considerations

The UI must clearly distinguish recommendation results from user input.

---

## Crop Comparison

Allow comparison of crops using structured information such as:

- Growing duration
- Water requirement
- Estimated cost
- Expected yield
- Expected revenue
- Expected profitability
- Season
- Soil suitability

Use a comparison table or responsive comparison cards.

---

## Crop Management

Support:

- Crop list
- Crop details
- Add crop
- Edit crop
- Delete crop
- Planting date
- Expected harvest date
- Farm/field relation
- Crop status
- Relevant crop metadata

---

## Crop Logs

Allow farmers to record activities such as:

- Irrigation
- Fertilizer
- Pesticide
- Pest observation
- Disease observation
- General crop activity
- Notes
- Date/time

Show history in a timeline/table.

---

## Crop Calendar

Show farming activities in calendar format.

Examples:

- Planting
- Irrigation
- Fertilization
- Pest inspection
- Disease monitoring
- Harvest preparation
- Harvest

Calendar data should come from API/domain data where applicable.

---

## Harvest Management

Support:

- Harvest list
- Add harvest
- Harvest details
- Harvest date
- Crop
- Field
- Quantity
- Quality
- Selling information if supported
- Harvest history

---

## Farm Expenses

Support:

- Expense list
- Add expense
- Edit expense
- Delete expense
- Expense category
- Amount
- Date
- Farm/crop relation
- Notes

Show total and category-wise summaries.

---

## Profitability

Show:

- Revenue
- Expenses
- Profit
- Profit margin if available
- Crop-wise profitability
- Farm-wise profitability
- Relevant charts

Do not invent financial formulas that are not defined by the backend/business requirements.

---

## Weather & Alerts

Show:

- Current weather
- Forecast
- Temperature
- Rainfall
- Humidity
- Wind
- Weather alerts

Use API-provided weather data.

Do not expose API keys in client-side code.

---

## Agricultural Training

Farmer should be able to:

- Browse training
- Search/filter training
- View training details
- Read/watch training content
- Track relevant training state if backend supports it

---

## AI Recommendation Result UI

Create a polished result UI for AI-generated recommendations.

Possible sections:

- Recommendation title
- Summary
- Reasoning/explanation
- Suggested actions
- Risk/alert level
- Relevant crop/farm/field
- Confidence score if the backend provides it
- Generated date/time
- Disclaimer where appropriate

Do not create an AI model or unrelated AI backend unless explicitly requested.

The assigned task is primarily the **AI recommendation result UI/integration**.

---

## Farmer Notifications

Support:

- Notification list
- Read/unread state
- Mark as read
- Notification details if required
- Notification categories
- Relevant timestamps
- Empty state

---

# 12. Admin Portal — Functional Expectations

## Admin Dashboard

Show system-level overview:

- Total farmers/users
- Active users
- Marketplace statistics relevant to admin
- Orders
- Payments
- Quality status
- Logistics status
- Training statistics
- Disputes
- Reports/analytics

---

## User Management

Support:

- User list
- Search
- Filter
- User details
- User status
- Activate/deactivate if supported
- Role information
- Pagination

---

## Marketplace Management

IMPORTANT:

This does NOT mean building Diptesh's Marketplace frontend.

Admin Marketplace Management means admin-side management such as:

- View products/listings
- Approve/reject listings
- Update listing status
- Manage categories if required
- Review marketplace-related information
- Manage marketplace records

Do not build customer marketplace browsing, cart, checkout, buyer portal, supplier portal, or inspector portal.

---

## Orders

Admin-side order management:

- Order list
- Order details
- Search/filter
- Order status
- Update order status
- Relevant farmer/buyer/product information
- Pagination

Do not build Buyer Portal order pages.

---

## Payments

Admin-side payment management:

- Payment list
- Payment details
- Payment status
- Transaction information
- Search/filter
- Payment reporting

---

## Quality Management

Admin-side quality management:

- Quality records
- Quality status
- Review quality information
- Approve/reject where defined
- Quality history
- Related product/order information

Do not build the Quality Inspector Portal.

---

## Logistics

Admin-side logistics management:

- Shipment/delivery records
- Delivery status
- Logistics information
- Update logistics status
- Tracking information if API provides it

Do not build a separate logistics partner portal.

---

## Training Management

Admin can:

- Create training
- Edit training
- Delete/archive training
- Publish/unpublish
- Manage title
- Description
- Category
- Content
- Media if supported

This content is then consumed by Farmer Portal.

---

## Reports

Admin reports can include:

- User reports
- Crop/farm reports
- Marketplace reports
- Order reports
- Payment reports
- Quality reports
- Logistics reports
- Training reports
- Dispute reports

Use tables and charts where useful.

Implement export only if explicitly required by the project/backend requirements.

---

## Disputes

Support:

- Dispute list
- Dispute details
- Search/filter
- Related order/user information
- Evidence/details if API provides it
- Status
- Resolution/update action
- Dispute history

Example status flow:

Pending → Investigating → Resolved

Do not invent additional business rules without requirements.

---

# 13. Authentication & Authorization

Farmer and Admin areas must be protected.

Use the project's existing authentication system if one exists.

The UI must respect roles.

Farmer users should not access Admin pages.

Admin users should have access according to their permissions.

Do not implement a completely new authentication system if the project already has one.

Keep auth/session logic centralized in:

src/lib/core/

---

# 14. Responsive Design

The entire Farmer Portal and Admin Portal must be responsive.

It must work properly on:

- Mobile
- Tablet
- Laptop
- Desktop

Pay special attention to:

- Sidebar
- Tables
- Forms
- Modals
- Charts
- Cards
- Filters
- Calendar
- Dashboard layout

On mobile, large tables should become horizontally scrollable or transform into suitable card/list layouts.

Do not make a desktop-only admin panel.

---

# 15. UI/UX Requirements

Every page should have:

- Clear page title
- Breadcrumb where useful
- Loading state
- Empty state
- Error state
- Responsive layout
- Consistent spacing
- Consistent typography
- Consistent buttons
- Consistent status indicators

For forms:

- Validation
- Clear labels
- Error messages
- Disabled/loading submit state
- Success feedback
- Cancel option where appropriate

For destructive actions:

- Confirmation dialog
- Clear warning
- Proper API call
- Success/error feedback

---

# 16. Data Flow

Prefer this architecture:

UI Component
    ↓
Page / Container
    ↓
src/lib/api/* or src/lib/actions/*
    ↓
src/lib/core/*
    ↓
Backend API

Do NOT do this:

UI Component
    ↓
fetch("hard-coded-url")

Every API call must go through the organized API/core layer.

---

# 17. Avoid Overengineering

Keep the implementation practical.

Do NOT add:

- Unnecessary state-management libraries
- Unnecessary abstraction layers
- Complex design patterns
- Unnecessary dependencies
- Duplicate API clients
- Duplicate types
- Huge components
- Giant utility files

If simple code can solve a problem, use simple code.

---

# 18. Component Size

Avoid very large components.

If a page becomes difficult to understand, extract reusable sections into components.

For example:

Dashboard page:

- DashboardHeader
- DashboardStats
- WeatherSummary
- CropSummary
- UpcomingHarvests
- RecentActivities
- NotificationsPreview

Keep page files focused on composition rather than containing every UI detail.

---

# 19. Error & Loading Handling

Every data-driven page must consider:

### Loading

Show:

- Skeleton
- Spinner
- Loading text

depending on the UI.

### Error

Show:

- User-friendly error message
- Retry action when appropriate

### Empty

Example:

"No farms found."

Then provide:

"Add Farm"

Do not leave blank screens.

---

# 20. API Error Handling

Use a centralized error format where possible.

Do not expose raw server errors directly to users.

Bad:

"AxiosError: Request failed with status code 500"

Better:

"Something went wrong while loading your farms. Please try again."

Log useful technical information appropriately without exposing secrets.

---

# 21. Security Rules

Never:

- Hard-code API secrets
- Expose private tokens
- Put server secrets in NEXT_PUBLIC_ variables
- Trust client-side role checks alone
- Store sensitive credentials in components

Authentication and authorization must also be enforced by the backend.

---

# 22. Environment Variables

Use environment variables for configurable values such as:

- API base URL
- Public configuration
- Weather API configuration where appropriate

Never hard-code environment-specific URLs throughout the project.

---

# 23. Shared Code Rules

If Farmer and Admin use the same component:

Put it under:

src/components/shared/

If it is Farmer-specific:

src/components/farmer/

If it is Admin-specific:

src/components/admin/

Do not duplicate components just because two pages use them.

---

# 24. Naming Conventions

Use clear names.

Components:

PascalCase

Examples:

- FarmCard.tsx
- CropTable.tsx
- WeatherCard.tsx

Functions:

camelCase

Examples:

- getFarms()
- createFarm()
- updateCrop()

Types:

PascalCase

Examples:

- Farm
- Crop
- CropLog
- Harvest
- Expense

Avoid meaningless names such as:

- data.ts
- helper.ts
- stuff.ts
- temp.ts

unless their purpose is genuinely generic.

---

# 25. Before Creating New Code

Before implementing anything:

1. Inspect the existing project structure.
2. Identify existing UI components.
3. Identify existing auth/session setup.
4. Identify existing API utilities.
5. Identify existing types.
6. Reuse existing components/utilities where possible.
7. Check whether the requested feature already exists.
8. Do not create duplicate implementations.

---

# 26. If Backend APIs Are Not Clearly Defined

Do NOT invent a full backend.

Instead:

- Keep API functions isolated.
- Define clean request/response types.
- Use configurable endpoint constants.
- Clearly identify missing API contracts.
- Implement the UI using the available API contract.
- Do not fabricate business rules.

If an endpoint is genuinely unknown, leave a clearly marked TODO at the API boundary rather than scattering assumptions across the UI.

---

# 27. Definition of Done

A Mohiuddin module is considered complete only when:

- The page exists.
- Routing works.
- Authentication/authorization is respected.
- UI is responsive.
- API integration is organized.
- Types are defined.
- Loading state exists.
- Error state exists.
- Empty state exists where applicable.
- Forms have validation where applicable.
- Mutations provide success/error feedback.
- Reusable components are extracted.
- No unnecessary duplicate code exists.
- No secrets are exposed.
- No unrelated Diptesh module has been implemented.
- Code is clean and understandable.

---

# 28. Final Scope Reminder

## YOU ARE MOHIUDDIN'S AI CODING AGENT.

Your job is ONLY:

### Farmer Portal
Dashboard → Profile → Farm → Field → Crop → Recommendation → Comparison → Logs → Calendar → Harvest → Expenses → Profitability → Weather → Training → AI Recommendation Result → Notifications

### Admin Portal
Dashboard → Users → Marketplace Management → Orders → Payments → Quality Management → Logistics → Training Management → Reports → Disputes

Everything else belongs to Diptesh.

**Do not expand the scope.**

When asked to implement a feature, first verify that it belongs to Mohiuddin's scope. If it does not, do not implement it.

Follow the architecture:

src/lib/
├── api/        # read/fetch functions
├── actions/    # data-changing server actions/mutation functions
└── core/       # fetch, auth header, session helpers

Use Next.js + TypeScript + React + reusable components + organized code.

**Do not work outside this scope unless the user explicitly changes the scope.**
