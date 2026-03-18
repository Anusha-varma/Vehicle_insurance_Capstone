# DriveSure - Vehicle Insurance Management System

**DriveSure** is a comprehensive, full-stack insurance management platform designed to automate the lifecycle of vehicle insurance—from policy application and risk-based premium calculation to claim settlement and commission tracking.

---

## Key Features

### Customer Portal
- **Policy Discovery**: Browse various insurance policies tailored for Cars, Bikes, and Commercial vehicles.
- **Dynamic Quote Calculator**: Get instant premium quotes based on vehicle age, type, and coverage amount.
- **Smart Risk Assessment**: Automated risk scoring (1.0 - 5.0) that determines your final premium.
- **Secure Payments**: Mock payment integration with transaction IDs.
- **Claim Filing**: File `Self` or `Third-Party` claims with support for injury types (Minor, Serious, Death) and Vehicle Damage.
- **Document Portfolio**: Upload damage photos and estimates (supporting Image & PDF).

### Underwriter Dashboard
- **Application Review**: Process incoming policy requests.
- **Risk Verification**: Analyze system-generated risk scores and approve/reject applications.
- **Commission Tracking**: Integrated calculator for 5% commission on every approved policy.

### Claim Officer Dashboard
- **Incident Analysis**: Review claim reasons, injury types, and uploaded garage estimates.
- **Document Verification**: Directly view evidence submitted by the customer.
- **Settlement Logic**: Approve or reject payouts based on policy terms.
- **Commission Tracking**: Integrated calculator for 2% commission on claim settlements.

### Admin Control Panel
- **System Monitoring**: View total platform revenue and total staff commissions.
- **Notifications**: Access absolute notification history across all roles.
- **User & Policy Management**: Maintain the integrity of the insurance catalog.

### Real-time Notifications
- Global Bell Icon in every dashboard.
- Background polling with "Auto-suppress Spinner" logic for a smooth, flicker-free UI.
- Contextual alerts for status changes (Approved/Rejected/Paid).

---

## Tech Stack

### Frontend (Angular)
- **Core**: Angular 21 (Standalone Components, Signals-ready logic).
- **Styling**: Tailwind CSS (Modern, Responsive Design).
- **State Management**: RxJS (polling, interceptors, and behavioral subjects).

### Backend (Spring Boot)
- **Core**: Java 21, Spring Boot 4.x.
- **Security**: Spring Security 6, JWT (JSON Web Tokens) for stateless authentication.
- **Data**: Spring Data JPA, Hibernate.
- **Database**: H2 (In-memory for development).
- **Serialization**: Jackson (custom property mapping for boolean logic).

---

## Getting Started

### Prerequisites
- Node.js (v25)
- Java JDK 21
- Maven

### Backend Setup
1. Clone the project.
2. Navigate to `C:\Spring boot\Vehicle_insurance`.
3. Configure `application.properties` (Database credentials).
4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup
1. Navigate to `c:\Drivesure_Frontend\frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Access the app at `http://localhost:4200`.

---

## Business Logic Snippets

- **Risk Score Algorithm**: 
  - *Vehicle Age*: Vehicles older than 15 years incur a `+0.8` risk factor.
  - *Vehicle Type*: Commercial vehicles add `+0.6` risk, while cars add `+0.2`.
- **Commission Logic**: 
  - Underwriter: `Premium * 0.05`
  - Claim Officer: `Premium * 0.02`
- **Claim Validation**: Garage Estimate field is automatically disabled and greyed out when selecting "Death" or "Minor Injury" to ensure data accuracy.

---

## Project Structure

```text
├── backend (Spring Boot)
│   ├── controller/   # REST Endpoints (Auth, Policy, Claim, Notification)
│   ├── model/        # Entities (MyUser, Policy, Claim, Notification)
│   ├── service/      # Business Logic (Risk Calculation, Commission)
│   └── security/     # JWT & Role-based Guards
└── frontend (Angular)
    ├── components/   # Dashboards, Forms, Shared Navbar
    ├── services/     # API Integration (Notification, Claim, Policy)
    ├── guards/       # Role-based Navigation Access
    └── interceptors/ # Loading Spinner Management
```

---

## License
This project is developed as part of a **Vehicle Insurance Management** solution. All rights reserved.

---
**DriveSure** — *Insuring your journey with trust and technology.* 
