When /^I create a task "([^"]*)" assigned to:$/ do |task_title, table|
  visit root_path
  click_link "Add task"
  fill_in "Title", :with => task_title

  table.hashes.each do |hash|
    click_link "Add assignee"

    last_assignee_input = page.all("input.assignee_email").last
    last_assignee_input.set(hash['email'])
  end

  click_button "Create task"
  click_link "I'm done adding tasks"
end

Then /^I should see "([^"]*)" is assigned to "([^"]*)"$/ do |task_title, assignee_email|
  pending # express the regexp above with the code you wish you had
end

Then /^I should see that I have an assigned task "([^"]*)"$/ do |task_title|
  pending # express the regexp above with the code you wish you had
end

Then /^I should see that I have no assigned tasks$/ do
  pending # express the regexp above with the code you wish you had
end
