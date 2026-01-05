# BDD Scenarios Skill

## Metadata

```yaml
id: bdd-scenarios
name: "BDD Scenarios Skill"
description: "Given/When/Then scenario generation for testable requirements"
version: "1.0.0"
```

## Purpose

Generate comprehensive Behavior-Driven Development (BDD) scenarios from user stories and acceptance criteria. Ensure all paths (happy, error, edge) are covered and scenarios are directly testable.

## Activation Triggers

This skill activates when:
- Writing PRD acceptance criteria
- Generating test specifications
- Validating feature completeness
- Creating QA plans

## BDD Format

Use Gherkin syntax:

```gherkin
Feature: {Feature Name}
  As a {user type}
  I want to {action}
  So that {benefit}

  Scenario: {Descriptive scenario name}
    Given {precondition/context}
    And {additional context}
    When {action taken}
    And {additional action}
    Then {expected outcome}
    And {additional outcome}
```

## Scenario Categories

### 1. Happy Path Scenarios
The expected, successful flow:

```gherkin
Scenario: Successful user login with valid credentials
  Given I am on the login page
  And I have a registered account with email "user@example.com"
  When I enter email "user@example.com"
  And I enter password "ValidPass123!"
  And I click the "Sign In" button
  Then I should be redirected to the dashboard
  And I should see "Welcome back" message
  And my session should be active for 24 hours
```

### 2. Error Scenarios
Expected failures with proper handling:

```gherkin
Scenario: Login fails with incorrect password
  Given I am on the login page
  And I have a registered account with email "user@example.com"
  When I enter email "user@example.com"
  And I enter password "WrongPassword"
  And I click the "Sign In" button
  Then I should see error message "Invalid email or password"
  And I should remain on the login page
  And the password field should be cleared
  And failed attempt should be logged
```

### 3. Edge Case Scenarios
Boundary conditions and unusual inputs:

```gherkin
Scenario: Login with email at maximum length
  Given I am on the login page
  When I enter an email with 254 characters (maximum valid length)
  And I enter a valid password
  And I click the "Sign In" button
  Then the system should process the login normally

Scenario: Login attempt with SQL injection
  Given I am on the login page
  When I enter email "'; DROP TABLE users; --"
  And I enter any password
  And I click the "Sign In" button
  Then I should see error message "Invalid email format"
  And no database queries should be executed with raw input
```

### 4. Permission Scenarios
Role-based access control:

```gherkin
Scenario: Admin accesses admin-only page
  Given I am logged in as an admin user
  When I navigate to "/admin/settings"
  Then I should see the admin settings page
  And I should see options to manage users

Scenario: Regular user attempts to access admin page
  Given I am logged in as a regular user
  When I navigate to "/admin/settings"
  Then I should be redirected to the dashboard
  And I should see error message "Access denied"
```

### 5. State Transition Scenarios
Workflows with multiple states:

```gherkin
Scenario: Order progresses through fulfillment states
  Given I have a confirmed order #12345
  When the warehouse marks it as "packed"
  Then the order status should be "Packed"
  And the customer should receive "Order packed" notification
  When the carrier picks up the package
  Then the order status should be "Shipped"
  And tracking number should be visible to customer
```

## Generation Workflow

### 1. Parse User Story

Extract from PRD:
- User type (As a...)
- Action (I want to...)
- Benefit (So that...)

### 2. Identify Acceptance Criteria

List all ACs from the PRD as scenario seeds.

### 3. Generate Scenario Matrix

For each acceptance criterion, generate scenarios covering:

| Path Type | Count | Priority |
|-----------|-------|----------|
| Happy path | 1-2 | P1 |
| Error cases | 2-4 | P1 |
| Edge cases | 2-4 | P2 |
| Permission | 1-2 per role | P1 |
| State transitions | 1 per transition | P2 |

### 4. Apply Scenario Template

For each scenario:
1. Write descriptive name (not "Test 1")
2. Set up Given (preconditions)
3. Define When (actions)
4. Specify Then (outcomes)
5. Include data examples where applicable

### 5. Validate Completeness

Check coverage:
- [ ] All acceptance criteria have scenarios
- [ ] All user roles represented
- [ ] All error messages tested
- [ ] Boundary values covered
- [ ] Empty/null states handled

## Output Format

```markdown
## BDD Scenarios

### Feature: {Feature Name}

#### Happy Path

**Scenario: {Descriptive name}**
```gherkin
Given {context}
When {action}
Then {outcome}
```

#### Error Cases

**Scenario: {Error description}**
```gherkin
Given {context}
When {invalid action}
Then {error handling}
```

#### Edge Cases

**Scenario: {Edge case description}**
```gherkin
Given {boundary condition}
When {action}
Then {expected behavior}
```
```

## Quality Rules

### DO
- Use concrete values ("user@example.com" not "valid email")
- Make scenarios independent (no shared state)
- Name scenarios descriptively
- Cover all acceptance criteria
- Include negative tests

### DON'T
- Use vague outcomes ("should work properly")
- Skip error scenarios
- Assume happy path only
- Use technical jargon in Given/When/Then
- Create dependent scenarios

## Example Data Tables

Use tables for multiple inputs:

```gherkin
Scenario Outline: Password validation rules
  Given I am on the registration page
  When I enter password "<password>"
  Then I should see validation message "<message>"

  Examples:
    | password | message |
    | abc | Password must be at least 8 characters |
    | abcdefgh | Password must contain a number |
    | abcd1234 | Password must contain uppercase |
    | Abcd1234 | Password accepted |
```

