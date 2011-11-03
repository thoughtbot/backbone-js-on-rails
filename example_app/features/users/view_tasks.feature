Feature: Viewing Tasks
  As a user
  So that I can see what I have to do
  I want to be able to see all my tasks

  Background:
    Given I am signed up as "email@example.com"
    When I sign in as "email@example.com"

  @javascript
  Scenario: View tasks
    Given the following tasks exist:
      | Title                                | user                     |
      | Purchase the backbone on rails ebook | email: email@example.com |
      | Master backbone                      | email: email@example.com |
    And I am on the home page
    Then I should see "Master backbone" within the tasks list
    And I should see "Purchase the backbone on rails ebook" within the tasks list
