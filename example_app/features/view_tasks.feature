Feature: Viewing Tasks
  As a user
  So that I can see what I have to do
  I want to be able to see all my tasks

  @javascript
  Scenario: View tasks
    Given the following tasks exist:
    | Title                                                |
    | Purchase the backbone on rails ebook from thoughtbot |
    | Master backbone                                      |
  And I am on the tasks page
  Then I should see "Master backbone"
  And I should see "Purchase the backbone on rails ebook from thoughtbot"
