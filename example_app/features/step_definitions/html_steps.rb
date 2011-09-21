Then /^the ([\w\s]+) should have focus$/ do |named_element|
  selector = selector_for(named_element)
  page.find(selector)['id'].should == page.evaluate_script("$(document.activeElement).attr('id')")
end
