When /^I attach "([^"]*)" to the "([^"]*)" task$/ do |path_to_upload, task_name|
  visit root_path
  find_task_details_link(task_name).click
  attach_file "Attach a file to upload", File.expand_path(path_to_upload)
  click_button "Upload attachment"
end

Then /^I should see "([^"]*)" attached to the "([^"]*)" task$/ do |attachment_filename, task_name|
  page.should have_content("Attached: #{attachment_filename}")
  page.should have_css("img[src*='#{attachment_filename}']")
end

Then /^I should see no attachments on the "([^"]*)" task$/ do |task_name|
  visit root_path
  find_task_details_link(task_name).click
  page.should have_no_content("Attached:")
end

module AttachmentStepsHelpers
  def find_task_details_link(task_name)
    page.find(:xpath, "//label[contains(text(),'#{task_name}')]/following-sibling::a")
  end
end

World(AttachmentStepsHelpers)
