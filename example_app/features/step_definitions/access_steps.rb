Then "I should not be able to access the app" do
  visit root_path
  page.should have_no_content("Tasks")
end
