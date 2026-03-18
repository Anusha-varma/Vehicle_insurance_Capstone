# UML Diagram Generation Guide for Vehicle Insurance Project

This guide provides all necessary information to generate UML diagrams for the Vehicle Insurance project.

## Project Overview
- **Project Name:** Vehicle Insurance
- **Technology Stack:**
  - Java (Spring Boot)
  - Maven
  - JUnit, Mockito (Testing)
  - Spring Security
  - H2 Database (or similar)
- **Directory Structure:**
  - `src/main/java/org/hartford/vehicle_insurance/` — Main source code
  - `src/test/java/org/hartford/vehicle_insurance/` — Test code
  - `src/main/resources/` — Configuration and static files
  - `uploads/` — Uploaded documents
  - `pom.xml` — Maven configuration

## Key Components
- **Controllers:** Handle HTTP requests (e.g., `MyUserController`)
- **Services:** Business logic (e.g., `MyUserService`)
- **Models/Entities:** Data representation (e.g., `MyUser`)
- **Repositories:** Data access (typically interfaces extending Spring Data JPA)
- **Security:** JWT authentication, user roles

## How to Generate UML Diagrams

### 1. Class Diagrams
- Include all classes in `src/main/java/org/hartford/vehicle_insurance/`.
- Show relationships between controllers, services, models, and repositories.
- Highlight inheritance, composition, and dependencies.

### 2. Sequence Diagrams
- Focus on user registration, login, and policy management flows.
- Show interactions between controllers, services, and repositories.

### 3. Use Case Diagrams
- Identify main actors: User, Admin, Insurer
- Main use cases: Register, Login, File Claim, View Policy, Upload Documents

### 4. Component Diagrams
- Show major components: Web Layer, Service Layer, Data Layer, Security Layer

## Tools for UML Generation
- **IntelliJ IDEA:** Built-in UML support
- **PlantUML:** Use `.puml` files or integrate with IDE
- **Visual Paradigm, StarUML, Lucidchart:** External tools

## Steps to Generate UML
1. **Extract Classes:** Use IDE or command-line tools to list all classes and interfaces.
2. **Analyze Relationships:** Identify associations, dependencies, and inheritance.
3. **Document Flows:** For sequence diagrams, trace method calls for key features.
4. **Export Diagrams:** Use preferred tool to generate and export diagrams.

## Example PlantUML Command
```
@startuml
class MyUserController {
  +register()
  +login()
}
class MyUserService {
  +register()
  +login()
}
MyUserController --> MyUserService
@enduml
```

## Additional Information
- Review `pom.xml` for dependencies
- Check `application.properties` for configuration
- Refer to documentation files in the root directory for feature details

---

**For comprehensive UML diagrams, ensure all source files and relationships are included.**
