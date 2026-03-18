# Beginner-Friendly Guide: Unit Testing in Your Spring Boot Project

This file explains the unit testing code implemented for your backend, following the JUnit + Mockito best practices. It is designed for beginners and covers the structure, annotations, and logic of the tests for both controllers and services.

---

## 1. Why Unit Testing?

- **Unit tests** check that each part of your code works as expected, in isolation.
- They help catch bugs early, make refactoring safer, and document your code's behavior.
- In Spring Boot, we use **JUnit** for writing tests and **Mockito** for mocking dependencies.

---

## 2. Project Setup

- **JUnit 5** and **Mockito** are included in your `pom.xml` as test dependencies.
- No extra setup is needed if you use Spring Boot Starter Test.

---

## 3. Controller Unit Tests

### Example: PolicyControllerTest

#### a. What is being tested?
- The REST endpoints in `PolicyController`.
- We want to check that the controller returns the correct HTTP responses for different scenarios.

#### b. Key Annotations
- `@WebMvcTest(PolicyController.class)`: Loads only the web layer for `PolicyController`.
- `@MockBean`: Creates a mock of the service layer dependency (e.g., `PolicyService`).
- `@Autowired MockMvc`: Lets you simulate HTTP requests to the controller.

#### c. Example Test
```java
@WebMvcTest(PolicyController.class)
class PolicyControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private PolicyService policyService;

    @Test
    void getAllPolicies_shouldReturnList() throws Exception {
        List<Policy> policies = List.of(new Policy(1L, ...), new Policy(2L, ...));
        when(policyService.getAllPolicies()).thenReturn(policies);
        mockMvc.perform(get("/policy/all"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)));
    }
}
```
- **What happens?**
    - The test fakes the service response and checks that the controller returns the expected JSON and status code.

---

## 4. Service Unit Tests

### Example: PolicyServiceTest

#### a. What is being tested?
- The business logic in `PolicyService`.
- We want to check that methods return correct results for given inputs.

#### b. Key Annotations
- `@ExtendWith(MockitoExtension.class)`: Enables Mockito in JUnit 5 tests.
- `@Mock`: Creates a mock for a dependency (e.g., `PolicyRepo`).
- `@InjectMocks`: Creates the service and injects the mocks.

#### c. Example Test
```java
@ExtendWith(MockitoExtension.class)
class PolicyServiceTest {
    @Mock
    private PolicyRepo policyRepo;
    @InjectMocks
    private PolicyService policyService;

    @Test
    void getPolicyById_shouldReturnPolicy() {
        Policy policy = new Policy(1L, ...);
        when(policyRepo.findById(1L)).thenReturn(Optional.of(policy));
        Policy result = policyService.getPolicyById(1L);
        assertEquals(policy, result);
    }
}
```
- **What happens?**
    - The test fakes the repository response and checks that the service returns the correct policy.

---

## 5. Mocking Explained
- **Mock**: A fake object that returns what you tell it to, instead of doing real work (like DB calls).
- **Stubbing**: Programming a mock to return a value for a method call.
- **InjectMocks**: Automatically injects mocks into the class under test.

---

## 6. Controller vs Service Tests
- **Controller tests** use `MockMvc` to simulate HTTP requests and check responses.
- **Service tests** use mocks to isolate business logic from external dependencies.

---

## 7. Example Test Output
- If a test passes, it means your code works as expected for that scenario.
- If a test fails, it shows what went wrong, so you can fix it before deploying.

---

## 8. How to Run Tests
- Use your IDE's test runner, or run `mvn test` in the terminal.
- Check the output for green (pass) or red (fail) results.

---

## 9. Best Practices
- Test one thing per test method.
- Use descriptive test names.
- Mock only what you need.
- Cover both normal and edge cases.

---

**Summary:**
- Unit tests make your code safer and easier to maintain.
- Controller tests check API endpoints; service tests check business logic.
- Mockito lets you fake dependencies so you can test in isolation.

Feel free to open any test file and compare it with this guide for a better understanding!
