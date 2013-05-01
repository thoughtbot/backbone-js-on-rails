Feature: Viewing Tasks
  As a user
  So that I can see what I have to do
  I want to be able to see all my tasks

  @javascript
  Scenario: View tasks
    Given the following tasks exist:
      | Title                                | user              |
      | Purchase the Backbone on Rails ebook | email@example.com |
      | Master Backbone                      | email@example.com |
    When I sign in as "email@example.com"
    And I am on the home page
    Then I should see "Master Backbone" within the tasks list
    And I should see "Purchase the Backbone on Rails ebook" within the tasks list
