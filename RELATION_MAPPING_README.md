# Entity Relationship Mapping in Vehicle Insurance System

This document describes the main entities and their JPA/Hibernate relationship mappings in the Vehicle Insurance project.

---

## 1. MyUser
- **Table:** `my_user`
- **Fields:** id, username, password, roles, email, phoneNumber
- **Relationships:**
  - `@OneToMany` PolicySubscription (not shown in code, but PolicySubscription has `@ManyToOne` to MyUser)

---

## 2. Policy
- **Table:** `policies`
- **Fields:** policyId, name, policyType, vehicleType, basePremium, coverageAmount, description, isActive
- **Relationships:**
  - `@OneToMany` PolicySubscription (not shown in code, but PolicySubscription has `@ManyToOne` to Policy)

---

## 3. PolicySubscription
- **Table:** `policy_subscriptions`
- **Fields:** id, startDate, endDate, status, vehicleNumber, vehicleModel, vehicleYear, riskScore, totalPremium
- **Relationships:**
  - `@ManyToOne` Policy
  - `@ManyToOne` MyUser
  - `@OneToMany` PolicyDocument (PolicyDocument has `@ManyToOne` to PolicySubscription)
  - `@OneToMany` Claim (Claim has `@ManyToOne` to PolicySubscription)

---

## 4. PolicyDocument
- **Table:** `policy_documents`
- **Fields:** id, fileName, fileType, filePath, uploadedAt
- **Relationships:**
  - `@ManyToOne` PolicySubscription

---

## 5. Claim
- **Table:** `claims`
- **Fields:** id, claimAmount, reason, claimDate, status, riskScore, claimType, thirdPartyName, thirdPartyVehicleNumber, injuryType, garageEstimate, damageDescription
- **Relationships:**
  - `@ManyToOne` PolicySubscription
  - `@OneToMany` ClaimDocument (ClaimDocument has `@ManyToOne` to Claim)

---

## 6. ClaimDocument
- **Table:** `claim_documents`
- **Fields:** id, fileName, contentType, fileType, content, filePath, uploadedAt
- **Relationships:**
  - `@ManyToOne` Claim

---

## 7. AddOn
- **Table:** `add_ons`
- **Fields:** id, name, description, price, isActive, createdDate, updatedDate
- **Relationships:**
  - (No direct relationships shown in code)

---

## 8. ClaimType (Enum)
- **Values:** SELF, THIRD_PARTY

## 9. ClaimStatus (Enum)
- **Values:** PENDING, UNDER_INSPECTION, APPROVED, REJECTED

---

## Diagram (Textual)

- MyUser 1---* PolicySubscription *---1 Policy
- PolicySubscription 1---* PolicyDocument
- PolicySubscription 1---* Claim
- Claim 1---* ClaimDocument

---

**Note:** Some `@OneToMany` relationships are only present as `@ManyToOne` in the child entity. The parent entity may not have a collection field for the children.

This mapping covers the main entity relationships in the Vehicle Insurance project.
