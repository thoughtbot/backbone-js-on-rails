Feature: Assign Tasks
  As a user
  I want to assign a task to one or more people
  So I can delegate tasks

  @javascript
  Scenario: Assigning a task to others
    Given I am signed up as "apple@example.com"
    And I am signed up as "banana@example.com"
    And I am signed up as "cherry@example.com"
    And I am signed up as "durian@example.com"

    When I sign in as "cherry@example.com"
    And I go to the tasks page
    And I create a task "Buy carrot cake mix" assigned to:
      | email |
      | apple@example.com |
      | banana@example.com |
    And I go to the tasks page
    Then I should see "Buy carrot cake mix"
    And I should see "Buy carrot cake mix" is assigned to "apple@example.com"
    And I should see "Buy carrot cake mix" is assigned to "banana@example.com"

    When I sign in as "apple@example.com"
    Then I should see "Buy carrot cake mix" is assigned to "apple@example.com"
    And I should see "Buy carrot cake mix" is assigned to "banana@example.com"

    When I sign in as "durian@example.com"
    Then I should not see "Buy carrot cake mix"
