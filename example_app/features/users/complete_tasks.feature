@javascript
Feature: Complete tasks
  As a user
  I want to complete tasks
  So that I can track what I've done

  Background:
    Given I am signed up as "email@example.com"
    When I sign in as "email@example.com"

  Scenario: Tasks start as uncomplete
    When I go to the tasks page
    And I create a task "Make shopping list"
    Then I should see that "Make shopping list" is not complete

  Scenario: Create and complete a task
    When I go to the tasks page
    And I create a task "Make shopping list"
    And I create a task "Pick up groceries"
    And I complete task "Make shopping list"
    And I go to the tasks page
    Then I should see that "Make shopping list" is complete
    And I should see that "Pick up groceries" is not complete

  Scenario: Uncomplete a task
    When I go to the tasks page
    And I create a task "Make shopping list"
    And I create a task "Pick up groceries"
    And I complete task "Make shopping list"
    And I complete task "Pick up groceries"
    And I uncomplete task "Make shopping list"
    And I go to the tasks page
    Then I should see that "Make shopping list" is not complete
    And I should see that "Pick up groceries" is complete
