# Add-on Coverage System - Comprehensive Analysis & Safe Integration Plan

## Executive Summary
The Vehicle Insurance Management System is a **backend-only Spring Boot application** (no Angular frontend detected). The system currently manages policies, policy subscriptions, claims, and users with role-based access control (ADMIN, CUSTOMER, CLAIM_OFFICER). This analysis provides a safe integration path for adding optional coverage (add-ons) without breaking existing functionality.

---

## 1. Current Project Structure Analysis

### Backend Architecture
```
Spring Boot 4.0.3 (Java 17)
├── Models (JPA Entities)
│   ├── Policy (Base policy with basePremium)
│   ├── PolicySubscription (Customer's policy application)
│   ├── Claim (Insurance claim)
│   └── MyUser (User with roles: ADMIN, CUSTOMER, CLAIM_OFFICER)
├── Services
│   ├── PolicyService (CRUD operations on policies)
│   ├── PolicySubscriptionService (Apply for policy)
│   ├── ClaimService (Apply, approve, reject claims)
│   └── MyUserService (User registration, login, role creation)
├── Controllers (REST APIs)
│   ├── PolicyController (GET/POST/PUT/DELETE policies)
│   ├── PolicySubscriptionController (Apply for policy, view subscriptions)
│   ├── ClaimController (Apply, view, manage claims)
│   ├── MyUserController (Register, login)
│   └── AdminController (Create claim officers)
├── Repositories (JPA)
│   ├── PolicyRepo
│   ├── PolicySubscriptionRepo
│   ├── ClaimRepo
│   └── MyUserRepo
├── Security
│   ├── SecurityConfig (Spring Security configuration)
│   ├── JwtFilter (JWT authentication)
│   └── JwtUtil (Token generation/validation)
└── Database (H2 In-Memory)
    └── Managed by JPA/Hibernate
```

### Frontend Status
- **NO ANGULAR FRONTEND DETECTED**
- Only Backend REST APIs are available
- The system is API-only and can be consumed by any frontend (web, mobile, etc.)

---

## 2. Current Policy & Premium Structure

### Policy Entity (Current)
```java
@Entity
public class Policy {
    - policyId (PK)
    - name (e.g., "Third-Party Basic")
    - policyType (THIRD_PARTY / COMPREHENSIVE)
    - vehicleType
    - basePremium (Double) ← Base cost of policy
    - coverageAmount (Double) ← IDV/Sum Insured
    - description
    - isActive (Boolean)
}
```

### Premium Calculation (Current)
```
Total Premium = basePremium (from Policy)
```

### Premium Calculation (After Add-ons)
```
Total Premium = basePremium + Sum of selected add-on prices
```

---

## 3. Proposed Add-on Coverage System Design

### 3.1 New AddOn Entity

```java
@Entity
@Table(name = "add_ons")
public class AddOn {
    - id (Long, PK, auto-generated)
    - name (String) [e.g., "Engine Protection", "Tyre Protection"]
    - description (String, 500 chars)
    - price (Double) [Premium cost of this add-on]
    - isActive (Boolean) [For soft delete/deactivation]
    - createdDate (LocalDateTime)
    - updatedDate (LocalDateTime)
}
```

### 3.2 Many-to-Many Relationship: Policy ↔ AddOn

**Join Table: policy_addon**
```sql
CREATE TABLE policy_addon (
    policy_id (FK → policies.policyId)
    addon_id (FK → add_ons.id)
    PRIMARY KEY (policy_id, addon_id)
);
```

**Why Many-to-Many:**
- ✅ One policy can have multiple add-ons
- ✅ One add-on can be included in multiple policies
- ✅ Admins can manage which add-ons are available for which policies
- ✅ Flexible and extensible

### 3.3 PolicySubscription Enhancement

```java
@Entity
public class PolicySubscription {
    // Existing fields...
    - id
    - policy
    - myUser
    - startDate
    - endDate
    - status
    
    // NEW: Many-to-Many with AddOn
    @ManyToMany
    @JoinTable(
        name = "policy_subscription_addon",
        joinColumns = @JoinColumn(name = "subscription_id"),
        inverseJoinColumns = @JoinColumn(name = "addon_id")
    )
    - selectedAddOns (Set<AddOn>) ← Customer's selected add-ons
    
    // NEW: Calculated field (not persisted)
    - totalPremium (Double) ← Computed at runtime
}
```

**Why PolicySubscription needs add-ons:**
- Each customer subscription can have different add-ons
- Premium calculation must be done per subscription
- Supports future: different customers choosing different add-ons for same policy

---

## 4. Data Model - Entity Relationships

```
┌─────────────┐
│   Policy    │
│  (1 : Many) │
└──────┬──────┘
       │
       │ 1 : Many
       │
┌──────┴──────────────┐
│ policy_addon        │
│ (Join Table)        │
└──────┬──────────────┘
       │
       │ Many : 1
       │
┌──────▼──────┐
│   AddOn     │
│             │
└─────────────┘

┌──────────────┐
│ PolicySubscription│
│ (1 : Many)       │
└────┬─────────┬───┘
     │         │
     │ M : M  (NEW)
     │         │
     └─────────┘
          │
    ┌─────▼────────────────┐
    │policy_subscription_addon│
    │(Join Table - NEW)      │
    └─────┬────────────────┘
          │
          │ M : 1
          │
    ┌─────▼──────┐
    │   AddOn    │
    │            │
    └────────────┘
```

---

## 5. Files to Be Created (New)

### Backend (Java)

| File | Type | Purpose |
|------|------|---------|
| `AddOn.java` | Entity | Define the add-on coverage entity |
| `AddOnRepo.java` | Repository | JPA repository for add-on CRUD |
| `AddOnService.java` | Service | Business logic for add-ons |
| `AddOnController.java` | Controller | REST endpoints for add-ons |

**Location:** Same package structure as existing entities
```
src/main/java/org/hartford/vehicle_insurance/
├── model/AddOn.java
├── Repository/AddOnRepo.java
├── service/AddOnService.java
└── controller/AddOnController.java
```

---

## 6. Files to Be Modified (Existing)

### Backend (Java)

| File | Reason | Changes |
|------|--------|---------|
| `Policy.java` | Many-to-Many relationship | Add `@ManyToMany` field for add-ons |
| `PolicySubscription.java` | Support selected add-ons | Add `@ManyToMany` field for selected add-ons |
| `PolicyService.java` | Return available add-ons | Add method: `getAvailableAddOns(Long policyId)` |
| `PolicySubscriptionService.java` | Handle add-on selection | Modify `applyPolicy()` to accept add-on IDs |
| `PolicySubscriptionController.java` | Accept add-on selections | Modify request body structure |

### Why No DTOs Needed?
- Current system doesn't use DTOs
- Keeping consistency with existing architecture
- JPA handles serialization automatically with `@JsonIgnore` if needed

---

## 7. New REST API Endpoints

### Add-On Management (Admin Only)

```
1. Create Add-On
   POST /addon/create
   @PreAuthorize("hasRole('ADMIN')")
   Payload: { name, description, price, isActive }
   Response: AddOn object

2. Get All Add-Ons
   GET /addon/all
   @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
   Response: List<AddOn>

3. Get Add-On by ID
   GET /addon/{id}
   @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
   Response: AddOn object

4. Update Add-On
   PUT /addon/{id}
   @PreAuthorize("hasRole('ADMIN')")
   Payload: { name, description, price, isActive }
   Response: Updated AddOn

5. Delete Add-On
   DELETE /addon/{id}
   @PreAuthorize("hasRole('ADMIN')")
   Response: 204 No Content

6. Get Add-Ons for Policy
   GET /addon/policy/{policyId}
   @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
   Response: List<AddOn>
```

### Policy Application with Add-ons (Enhanced)

```
EXISTING: POST /policy/{policyId}/apply
MODIFIED Request Body:
{
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "selectedAddOnIds": [1, 2, 3]  ← NEW: List of add-on IDs
}

Response:
{
    "id": 1,
    "policy": { ... },
    "myUser": { ... },
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "status": "APPROVED",
    "selectedAddOns": [
        { "id": 1, "name": "Engine Protection", "price": 500.0 },
        { "id": 2, "name": "Tyre Protection", "price": 300.0 }
    ],
    "totalPremium": 5800.0  ← NEW: Calculated premium
}
```

---

## 8. Premium Calculation Logic

### Option A: Database Calculation (Recommended)
```java
// In PolicySubscriptionService.applyPolicy()
Double totalPremium = policy.getBasePremium() + 
                     selectedAddOns.stream()
                                  .mapToDouble(AddOn::getPrice)
                                  .sum();
```

### Option B: Transient Field
```java
// In PolicySubscription entity
@Transient
public Double getTotalPremium() {
    Double addOnTotal = selectedAddOns.stream()
                                     .mapToDouble(AddOn::getPrice)
                                     .sum();
    return policy.getBasePremium() + addOnTotal;
}
```

**Recommended Approach:** Option B (Transient Field)
- ✅ Not stored in DB (avoids data redundancy)
- ✅ Calculated on-the-fly when needed
- ✅ Always accurate
- ✅ No schema changes needed for premium column

---

## 9. Safety Checks - What Won't Break

### ✅ Existing Policy Creation (Unaffected)
```
Admin: POST /policy/create
├── Creates policy with basePremium
├── No add-ons required
└── Existing code remains unchanged
```

### ✅ Policy Application Without Add-ons (Backward Compatible)
```
Customer: POST /policy/{policyId}/apply
├── Optional selectedAddOnIds field
├── If omitted → No add-ons selected
├── totalPremium = basePremium (default)
└── Backward compatible with existing requests
```

### ✅ Claim Processing (Completely Independent)
```
Claim operations don't depend on add-ons
├── Claims are linked to PolicySubscription
├── PolicySubscription has policy + add-ons
├── Add-ons don't affect claim eligibility
└── No changes to ClaimService needed
```

### ✅ Authentication & Authorization
```
No changes to:
├── SecurityConfig
├── JwtFilter
├── JwtUtil
├── Role-based access control (@PreAuthorize)
└── All existing endpoints still secure
```

### ✅ Existing Repositories & Queries
```
PolicyRepo - No custom queries affected
PolicySubscriptionRepo - No breaking changes
ClaimRepo - Unchanged
MyUserRepo - Unchanged
```

---

## 10. Implementation Roadmap (Step-by-Step)

### Phase 1: Core Infrastructure (Backend Only)
**Goal:** Create add-on entity, repository, and basic CRUD

**Step 1:** Create `AddOn.java` entity
- Define fields: id, name, description, price, isActive, timestamps
- Add getters/setters and constructors
- No relationships yet

**Step 2:** Create `AddOnRepo.java` interface
- Extend JpaRepository<AddOn, Long>
- Add query method: `findByIsActiveTrue()` (get only active add-ons)

**Step 3:** Create `AddOnService.java` class
- Methods: createAddOn(), getAllAddOns(), getAddOnById(), updateAddOn(), deleteAddOn()
- Constructor injection for AddOnRepo

**Step 4:** Create `AddOnController.java` controller
- Implement REST endpoints listed in Section 7
- Add @PreAuthorize annotations
- Follow existing code style

### Phase 2: Entity Relationships (Backend)
**Goal:** Connect Policy and AddOn via Many-to-Many

**Step 5:** Update `Policy.java` entity
- Add `@ManyToMany` field linking to AddOn
- Add `@JoinTable` annotation
- Don't modify existing fields

**Step 6:** Verify PolicyService
- No changes needed (relationships handled by JPA)
- Existing methods continue to work

### Phase 3: Policy Subscription Enhancement (Backend)
**Goal:** Allow customers to select add-ons during policy application

**Step 7:** Update `PolicySubscription.java` entity
- Add `@ManyToMany` field for selectedAddOns
- Add `@Transient` field for totalPremium calculation
- Add getter for totalPremium()

**Step 8:** Update `PolicySubscriptionService.applyPolicy()`
- Accept list of addOnIds from request
- Fetch AddOn entities by IDs
- Set selectedAddOns on PolicySubscription
- Calculate and return totalPremium

**Step 9:** Update `PolicySubscriptionController.applyForPolicy()`
- Modify request body to include selectedAddOnIds
- Pass to service
- Response includes totalPremium

**Step 10:** Add new endpoint in PolicyController
- GET `/policy/{policyId}/addons`
- Returns available add-ons for a specific policy

### Phase 4: Verification & Testing
**Goal:** Ensure no existing functionality is broken

**Step 11:** Test backward compatibility
- Old requests (without selectedAddOnIds) should work
- Policies without add-ons should have totalPremium = basePremium

**Step 12:** Test new functionality
- Create add-ons (admin)
- Apply for policy with add-ons (customer)
- Verify premium calculation
- Apply for claims (should still work)

**Step 13:** Verify compilation and runtime
- `mvn clean compile` should succeed
- No orphaned code or imports

### Phase 5: Database Migration (Optional)
**Goal:** Pre-populate add-ons if needed

- Insert sample add-ons into database via H2 console or SQL script
- Link policies to add-ons via join table

---

## 11. Detailed Code Modifications Guide

### Policy.java - Add Many-to-Many Relationship
```java
// Add this import at top
import java.util.Set;

// Add this field to Policy entity
@ManyToMany
@JoinTable(
    name = "policy_addon",
    joinColumns = @JoinColumn(name = "policy_id"),
    inverseJoinColumns = @JoinColumn(name = "addon_id")
)
private Set<AddOn> addOns = new HashSet<>();

// Add getter and setter
public Set<AddOn> getAddOns() {
    return addOns;
}

public void setAddOns(Set<AddOn> addOns) {
    this.addOns = addOns;
}
```

### PolicySubscription.java - Add Selected Add-ons
```java
// Add import
import java.util.Set;

// Add field for selected add-ons
@ManyToMany
@JoinTable(
    name = "policy_subscription_addon",
    joinColumns = @JoinColumn(name = "subscription_id"),
    inverseJoinColumns = @JoinColumn(name = "addon_id")
)
private Set<AddOn> selectedAddOns = new HashSet<>();

// Add transient field for calculated premium
@Transient
private Double totalPremium;

// Add getter for selectedAddOns
public Set<AddOn> getSelectedAddOns() {
    return selectedAddOns;
}

// Add setter for selectedAddOns
public void setSelectedAddOns(Set<AddOn> selectedAddOns) {
    this.selectedAddOns = selectedAddOns;
}

// Add calculated totalPremium getter
public Double getTotalPremium() {
    if (policy == null) return 0.0;
    Double addOnTotal = selectedAddOns.stream()
        .mapToDouble(AddOn::getPrice)
        .sum();
    return policy.getBasePremium() + addOnTotal;
}

// Add setter (for deserialization if needed)
public void setTotalPremium(Double totalPremium) {
    this.totalPremium = totalPremium;
}
```

### PolicySubscriptionService.applyPolicy() - Accept Add-ons
```java
// Modify method signature to accept addOnIds
public PolicySubscription applyPolicy(Long policyId, PolicySubscription policySubscription, List<Long> addOnIds) {
    
    // ... existing validation code ...
    
    // Fetch add-ons by IDs if provided
    Set<AddOn> selectedAddOns = new HashSet<>();
    if (addOnIds != null && !addOnIds.isEmpty()) {
        selectedAddOns = addOnRepo.findAllById(addOnIds).stream()
            .collect(Collectors.toSet());
    }
    
    policySubscription.setMyUser(user);
    policySubscription.setPolicy(policy);
    policySubscription.setSelectedAddOns(selectedAddOns);
    policySubscription.setStatus(PolicySubscription.STATUS_APPROVED);
    
    return policySubscriptionRepo.save(policySubscription);
}
```

### PolicySubscriptionController.applyForPolicy() - Enhanced
```java
// Create a simple wrapper class or modify the request
// Option 1: Extend the PolicySubscription request with addOnIds
@PostMapping("{policyId}/apply")
@PreAuthorize("hasRole('CUSTOMER')")
public PolicySubscription applyForPolicy(
    @PathVariable Long policyId,
    @RequestBody PolicySubscription policySubscription,
    @RequestParam(required = false) List<Long> addOnIds) {
    return policySubscriptionService.applyPolicy(policyId, policySubscription, addOnIds);
}

// Option 2: Create a request wrapper class (if JSON body is needed)
class PolicyApplicationRequest {
    PolicySubscription subscription;
    List<Long> addOnIds;
}
```

---

## 12. Risk Analysis & Mitigation

### ⚠️ Risk: Database Schema Changes
**Mitigation:**
- Use Hibernate's `spring.jpa.hibernate.ddl-auto=update`
- Existing tables remain unchanged
- New join tables created automatically
- No data loss

### ⚠️ Risk: Backward Compatibility
**Mitigation:**
- Make addOnIds optional in requests
- If omitted, totalPremium = basePremium
- Old API calls continue to work

### ⚠️ Risk: Premium Calculation Errors
**Mitigation:**
- Use `@Transient` field (calculated at runtime)
- No storage of premium (single source of truth)
- Validated in service layer

### ⚠️ Risk: Circular JSON Serialization
**Mitigation:**
- Add `@JsonIgnore` on Policy.addOns or PolicySubscription.selectedAddOns if needed
- Or use `@JsonManagedReference` and `@JsonBackReference`

### ⚠️ Risk: Add-on Deletion Affecting Subscriptions
**Mitigation:**
- Use `DELETE RESTRICT` or `ON DELETE RESTRICT` (cascade carefully)
- Soft delete: Mark add-ons as `isActive = false` instead of deleting
- Check subscriptions before deleting active add-ons

---

## 13. Testing Strategy

### Unit Tests (Required)
```
✓ AddOnService CRUD operations
✓ Policy-AddOn relationship creation
✓ Premium calculation logic
✓ PolicySubscription add-on selection
```

### Integration Tests (Required)
```
✓ GET /addon/all returns active add-ons only
✓ POST /addon/create creates and persists
✓ POST /policy/{id}/apply with add-ons saves correctly
✓ Claims still work with add-on policies
```

### Backward Compatibility Tests (Required)
```
✓ POST /policy/{id}/apply WITHOUT addOnIds still works
✓ totalPremium = basePremium for no add-ons
✓ Existing policies unaffected
```

---

## 14. Security Considerations

### ✅ Authentication
- All endpoints require JWT token
- Existing JwtFilter validates all requests

### ✅ Authorization
- Admin: Create/Update/Delete add-ons
- Customer: View add-ons, select during application
- Claim Officer: Unaffected

### ✅ Input Validation
- Add-on name: Not empty, length limit
- Price: Positive number
- Policy ID & Add-on ID: Existence validation

### ✅ No Security Breaches
- No changes to SecurityConfig
- No changes to authentication logic
- Existing @PreAuthorize annotations sufficient

---

## 15. Performance Considerations

### Database Indexing
```sql
-- Add indexes for better query performance
CREATE INDEX idx_addon_isactive ON add_ons(is_active);
CREATE INDEX idx_policy_addon_policy ON policy_addon(policy_id);
CREATE INDEX idx_policy_subscription_addon_subscription ON policy_subscription_addon(subscription_id);
```

### Lazy vs Eager Loading
```java
// Recommendation: Use FetchType.LAZY (default)
@ManyToMany(fetch = FetchType.LAZY)
private Set<AddOn> selectedAddOns;

// Justification:
// - Avoid N+1 query problems
// - Load add-ons only when accessed
// - Better performance for list operations
```

---

## 16. Migration Path for Existing Data

### For Existing Policies
```
- Policies created before add-ons feature: No add-ons linked
- Join table remains empty for these policies
- They can still be applied for (backward compatible)
```

### For Existing Subscriptions
```
- Subscriptions created before feature: selectedAddOns empty
- totalPremium = basePremium
- No changes to existing records
```

---

## 17. Summary - What Gets Created vs Modified

### ✅ NEW FILES (4 Total)
1. `AddOn.java` - Entity
2. `AddOnRepo.java` - Repository
3. `AddOnService.java` - Service
4. `AddOnController.java` - Controller

### ✅ MODIFIED FILES (3 Total)
1. `Policy.java` - Add Many-to-Many relationship
2. `PolicySubscription.java` - Add Many-to-Many relationship + calculated premium
3. `PolicySubscriptionService.java` - Handle add-on selection
4. `PolicySubscriptionController.java` - Accept add-on IDs

### ❌ UNCHANGED FILES (No breaking changes)
- SecurityConfig.java
- JwtFilter.java
- JwtUtil.java
- PolicyController.java (mostly)
- ClaimController.java
- ClaimService.java
- MyUserController.java
- MyUserService.java
- AdminController.java
- pom.xml
- application.properties

---

## 18. Next Steps

1. **Review this analysis** - Ensure approach aligns with requirements
2. **Approve schema design** - Many-to-Many relationships
3. **Plan database migration** - Test with H2 first
4. **Create AddOn entity** - Start Phase 1
5. **Add repository & service** - Complete Phase 1
6. **Update relationships** - Phase 2 & 3
7. **Test comprehensively** - Phase 4
8. **Deploy safely** - Monitor for issues

---

## Conclusion

The proposed **Add-on Coverage System** design:
- ✅ **Maintains backward compatibility** - Old requests still work
- ✅ **Doesn't break existing features** - Claims, auth, users unaffected
- ✅ **Follows existing patterns** - Same code style & architecture
- ✅ **Uses JPA relationships** - No DTOs or mappers needed
- ✅ **Scales easily** - Many-to-Many is flexible
- ✅ **Calculates premiums correctly** - Base + Add-ons
- ✅ **Keeps the system simple** - Minimal modifications needed

**Ready for implementation!**
