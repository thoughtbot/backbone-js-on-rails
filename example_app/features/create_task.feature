Feature: Create Task
  As a user
  I want to create a task
  So that I can track what to do

  @javascript
  Scenario: Create task
    When I go to the tasks page
    Then the page should not contain the task form
    And I follow "Add task"
    Then the page should contain the task form
    And I fill in "Title" with "A fresh new task"
    And I press "Create task"
    Then I should see "Created task: A fresh new task"
    When I follow "I'm done adding tasks"
    Then I should see "A fresh new task" within the tasks list
