## Full-stack integration testing

Your application is built from a collection of loosely coupled modules,
spreading across several layers of the development stack.  To ensure the
application works correctly from the perspective of the end user, full-stack
integration testing drives your application and verifies correct functionality
from the user interface level.  This is also referred to as "acceptance testing."

### Introduction

Writing a full-stack integration test for a JavaScript-driven web application
will always involve some kind of browser, and although writing an application
with Backbone can make a world of difference to you, the tools involved are all
the same as far as your browser is concerned. Because your browser can run
Backbone applications just like any JavaScript application, you can write
integration tests for them just like you would for any JavaScript application.
Also, because of tools like Capybara that support various drivers, you can
generally test a JavaScript-based application just like you'd test a web
application where all the logic lives on the server. This means that having a
powerful, rich-client user interface won't make your application any harder to
test. If you're familiar with tools like Capybara, Cucumber, and RSpec, you can
dive right in and start testing your Backbone application. If not, the
following sections should give you a taste of the available tools for
full-stack integration tests written in Ruby.

### Capybara

Though there is a host of tools available to you for writing automated
integration tests, we recommend [Capybara](https://github.com/jnicklas/capybara).
In a hybrid Rails application, where some portions are regular request/response
and other portions are JavaScript, it's valuable to have a testing framework
that abstracts the difference as much as possible.

Capybara is a high-level library that allows you to write tests from a user's
perspective.  Consider this example, which uses RSpec:

```ruby
# spec/requests/login_spec.rb
describe "the login process", :type => :request do
  it "accepts an email and password" do
    User.create(:email => 'alice@example.com', :password => 'password')
    visit '/'
    fill_in 'Email', :with => 'alice@example.com'
    fill_in 'Password', :with => 'password'
    click_button 'Log in'
    page.should have_content('You are logged in as alice@example.com')
  end
end
```

Notice that, as you read the spec, you're not concerned about whether the login
interface is rendered with JavaScript, or whether the authentication request is
over AJAX or not.  A high-level library like Capybara keeps you from having to
consider the back-end implementation, freeing you to focus on describing the
application's behavior from an end-user's perspective.  This perspective of
writing specs is often called "behavior-driven development" (BDD).

### Cucumber

You can take another step toward natural language tests, using Cucumber to
define mappings.  Cucumber is a test runner and a mapping layer.  The specs you
write in Cucumber are user stories, written in a constrained subset of English.
The individual steps in these stories are mapped to a testing library - in our
case, and probably most cases, to Capybara.

This additional layer of abstraction can be helpful for a few reasons. Some teams have nontechnical stakeholders writing integration specs as user
stories.  Cucumber sits at a level of abstraction that fits comfortably there:
high-level enough for nontechnical stakeholders to write in, but precise enough
to be translated into automated tests.

On other teams, the person writing the story is the same person who implements
it.  Still, it is valuable to use a tool that reinforces the distinction between
the description phase and the implementation phase of the test.  In the
description phase, you are writing an English description of the software
interaction:

```cucumber
# features/login.feature
Given there is a user account "alice@example.com" with the password "password"
When I go to the home page
And I fill in the login form with "alice@example.com" and "password"
And I click the login button
Then I should see "You are logged in as alice@example.com"
```

In the implementation phase of the test, you define what these steps do.  In
this case, they are defined to run Capybara methods:

```ruby
# features/step_definitions/login_steps.rb
Given /^there is a user account "(.*)" with the password "(.*)"$/ do \\
|email, password|
  User.create(:email => email, :password => password)
end

When "I go to the home page" do
  visit "/"
end

When /^I fill in the login form with "(.*)" and "(.*)"$/ do |email, password|
  fill_in 'Email', :with => email
  fill_in 'Password', :with => password
end

When "I click the login button" do
  click_button "Login"
end

Then /^I should see "(.*)"$/ do |text|
  page.should have_content(text)
end
```

### Drivers

Capybara supports multiple drivers through a common API, each with benefits and
drawbacks. We prefer to use either
[capybara-webkit](https://github.com/thoughtbot/capybara-webkit) or Selenium.

When possible, we use capybara-webkit. It's a fast, headless fake browser
written using the WebKit browser engine. It's generally faster than Selenium
and it's dependent on your system settings once compiled. This means that
upgrading the browser you use every day won't ever affect your tests.

However, capybara-webkit is still young, and sometimes there's no substitute
for having a real browser to run your tests through. In these situations, we
fall back to using Selenium. Selenium will always support anything you can do
in your actual browser, and supports multiple browsers, including Firefox,
Chrome, Safari, and even Internet Explorer.

Capybara makes it easy to switch between drivers. Just set your default driver to capybara-webkit:

```ruby
# features/support/javascript_driver.rb or spec/spec_helper.rb
Capybara.javascript_driver = :webkit
```

Then, tag a Cucumber scenario as @javascript. If you need to fall back to using Selenium, tag that scenario with @selenium.
