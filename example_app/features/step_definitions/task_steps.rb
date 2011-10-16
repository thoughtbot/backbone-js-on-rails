When /^I create a task "([^"]*)"$/ do |task_title|
  visit root_path
  click_link "Add task"
  fill_in "Title", :with => task_title
  click_button "Create task"
  click_link "I'm done adding tasks"
end

When /^I uncomplete task "([^"]*)"$/ do |task_title|
  uncheck(task_title)
end

When /^I complete task "([^"]*)"$/ do |task_title|
  check(task_title)
end

Then /^I should see that "([^"]*)" is complete$/ do |task_title|
  page.should have_checked_field(task_title)
end

Then /^I should see that "([^"]*)" is not complete$/ do |task_title|
  page.should have_unchecked_field(task_title)
end
