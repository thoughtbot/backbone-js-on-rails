@javascript
Feature: Task ownership and access

  As a user
  I want my tasks to be visible to me but no one else
  So I can keep my highly sensitive grocery shopping list private

  Scenario: Separate tasks for separate users
    Given I am signed up as "blueberry@example.com"
    When I sign in as "blueberry@example.com"
    When I go to the tasks page
    And I create a task "Buy blueberry muffin mix"

    Given I am signed up as "carrot@example.com"
    When I sign in as "carrot@example.com"
    And I go to the tasks page
    And I create a task "Buy carrot cake mix"
    And I go to the tasks page
    Then I should see "Buy carrot cake mix"
    But I should not see "Buy blueberry muffin mix"
