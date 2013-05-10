Feature: Filtering Tasks
  As a user
  So that I can see relevant tasks
  I want to be able to filter my tasks

  @javascript
  Scenario: View tasks
    Given the following tasks exist:
      | Title                                | user                     |
      | Purchase the Backbone on Rails ebook | email@example.com |
      | Master Backbone                      | email@example.com |
    When I sign in as "email@example.com"
    And I am on the home page
    And I filter the tasks for "title: Master"
    Then I should see "Master Backbone" within the tasks list
    But I should not see "Purchase the Backbone on Rails ebook" within the tasks list

