When /^I create a task "([^"]*)" assigned to:$/ do |task_title, table|
  visit root_path
  click_link "Add task"
  fill_in "Title", :with => task_title

  table.hashes.each do |hash|
    click_link "Add Assignee"

    last_assignee_input = page.all("input.new-task-assignee-email").last
    last_assignee_input.set(hash['email'])
  end

  click_button "Create task"
  click_link "I'm done adding tasks"
end

Then /^I should see "([^"]*)" is assigned to "([^"]*)"$/ do |task_title, assignee_email|
  task = Task.find_by_title!(task_title)

  within("tr#task_#{task.id}") do
    page.should have_content(assignee_email)
  end
end
