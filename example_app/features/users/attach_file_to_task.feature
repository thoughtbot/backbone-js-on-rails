@javascript
Feature: Attach a file to a task

  As a user
  I want to attach files to a task
  So that I can include reference materials

  Background:
    Given I am signed up as "email@example.com"
    When I sign in as "email@example.com"
    And I go to the tasks page
    And I create a task "Buy"
    And I create a task "Eat"

  Scenario: Attach a file to a task
    When I attach "spec/fixtures/blueberries.jpg" to the "Buy" task
    Then I should see "blueberries.jpg" attached to the "Buy" task
    And I should see no attachments on the "Eat" task

  Scenario: Attach multiple files to a task
    When I attach "spec/fixtures/blueberries.jpg" to the "Buy" task
    And I attach "spec/fixtures/strawberries.jpg" to the "Buy" task
    Then I should see "blueberries.jpg" attached to the "Buy" task
    And I should see "strawberries.jpg" attached to the "Buy" task
