Feature: Viewing Tasks
  As a user
  So that I can see what I have to do
  I want to be able to see all my tasks

  @javascript
  Scenario: View tasks
    Given the following tasks exist:
      | Title                                |
      | Purchase the backbone on rails ebook |
      | Master backbone                      |
    And I am on the home page
    Then I should see "Master backbone" within the tasks list
    And I should see "Purchase the backbone on rails ebook" within the tasks list
