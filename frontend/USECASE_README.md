# Drivesure Frontend

## Project Overview

Drivesure is a comprehensive vehicle insurance management platform. The frontend is built with Angular and provides role-based dashboards and workflows for customers, administrators, and claim officers. The application streamlines the process of policy management, insurance purchase, claim submission, and administrative approvals.

## Key Features
- User authentication and registration
- Policy browsing, application, and renewal
- Quote generation and document upload
- Claim submission and tracking
- Admin dashboard for policy and user management
- Claim officer dashboard for claim processing
- Toast notifications and responsive UI

## Main Use Case Flows

### 1. Customer Policy Purchase & Renewal Flow
1. **Register/Login**: User creates an account or logs in.
2. **Browse Policies**: User views available insurance policies.
3. **Get Quote**: User fills out the quote form, uploads required documents (RC, license, vehicle photo, ID proof), and receives a premium estimate.
4. **Apply for Policy**: User selects add-ons, reviews premium, and submits the application.
5. **Renew Policy**: User can renew existing policies from the dashboard.

### 2. Claim Submission Flow
1. **Login**: Customer logs in and navigates to their dashboard.
2. **Initiate Claim**: User selects a policy subscription and opens the claim form.
3. **Submit Claim**: User fills out claim details, uploads supporting documents (damage photos, FIR, etc.), and submits.
4. **Track Claim**: User can view claim status and receive notifications.

### 3. Admin Policy & User Management Flow
1. **Login as Admin**: Admin accesses the admin dashboard.
2. **View Policy Requests**: Admin reviews pending policy applications and approvals.
3. **Manage Policies**: Admin can create, edit, or delete insurance policies.
4. **Manage Users**: Admin can create claim officer accounts and monitor user statistics.

### 4. Claim Officer Processing Flow
1. **Login as Claim Officer**: Officer accesses the claim officer dashboard.
2. **View Pending Claims**: Officer reviews submitted claims and attached documents.
3. **Process Claims**: Officer updates claim status, requests additional documents, or approves/rejects claims.
4. **Document Management**: Officer can view and download claim-related documents.

## Project Structure
- `src/app/components/` — Contains all feature components (dashboards, forms, etc.)
- `src/app/services/` — Service classes for API communication and business logic
- `src/app/interceptors/` — HTTP interceptors for authentication
- `src/app/app.routes.ts` — Application routing configuration
- `src/app/app.ts` — Main application bootstrap

## Technologies Used
- Angular 17+
- RxJS
- Angular Forms (Reactive & Template-driven)
- Angular Router
- TypeScript
- CSS

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   ng serve
   ```
3. Open [http://localhost:4200](http://localhost:4200) in your browser.

## Contribution & Testing
- Use `ng test` for unit tests.
- Use `ng e2e` for end-to-end tests (configure your preferred e2e framework).

---
For more details, see the existing README or contact the project maintainers.
