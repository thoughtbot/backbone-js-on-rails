## Example: Test-driving a task application

### Setup

In this example, we'll be using Cucumber, Capybara, RSpec, and Jasmine to
test-drive a todo list.

The Selenium driver comes configured with Capybara and is the quickest driver to
get running. By default, it runs your tests in a remote-controlled Firefox
session, so you'll want to install Firefox if you don't have it.

If you'd like to test on a WebKit-based browser, you can set up the
[Selenium ChromeDriver](http://code.google.com/p/selenium/wiki/ChromeDriver) to
run integration tests against Chrome.

The other dependencies you can install by adding them to your Gemfile. The gems
you'll need for testing are jasmine (currently tracking the edge version from
GitHub), cucumber-rails, rspec-rails, and capybara.  You'll want to add RSpec,
Cucumber, and Jasmine to both the test and development groups so that you can
run generators. With all our testing dependencies in place, the `Gemfile` in our
sample application looks like this:

` Gemfile@f478197

If you haven't already, bootstrap your application for Cucumber and Capybara:

```bash
rails generate cucumber:install
```

Next, bootstrap the application for Jasmine:

```bash
rails generate jasmine:install
```

With this configuration, you can run Cucumber scenarios with the Cucumber
command and you can run Jasmine tests by running `bundle exec rake jasmine`
and visiting http://localhost:8888, or by running `bundle exec rake jasmine:ci`,
which uses Selenium to verify the Jasmine results.

One final helpful configuration change is to include the `jasmine:ci` task
in the default rake task.  This way, running `rake` will run all your specs,
including Jasmine specs:

```ruby
# Rakefile
# ...
task :default => ['spec', 'jasmine:ci', 'cucumber']
```

### Step by step

We'll go outside in: Cucumber first, then RSpec or Jasmine as needed.

TIP: For an in-depth explanation of outside-in test-driven development, see
[_The RSpec Book_](http://pragprog.com/book/achbd/the-rspec-book).

We'd like to be able to add items to a todo list.  We know this will involve
two parts: a list of existing tasks, and an interface for adding new items to
the list.  We'll start with the list of items, and create fixture data with
[Factory Girl Cucumber steps](https://github.com/thoughtbot/factory_girl/blob/v2.1.0/GETTING_STARTED.md):

` features/users/view_tasks.feature@f478197

Running this, we see a failure:

```text
Then I should see "Master Backbone" within the tasks list
  Unable to find css "#tasks table" (Capybara::ElementNotFound)
  (eval):2:in `find'
  ./features/step_definitions/web_steps.rb:29:in `with_scope'
  ./features/step_definitions/web_steps.rb:36:in `/^(.*) within (.*[^:])$/'
  features/view_tasks.feature:13:in `Then I should see "Master Backbone" \\
  within the tasks list'
```

A common mis-step when testing Rails apps with our structure is seeing false
positives in bootstrapped data. Consider that, if we had just written the step
`Then I should see "Master Backbone"` instead of scoping it with `within the
tasks list`, then some test drivers would count the JSON that is used to
bootstrap Backbone collections as visible text on the page, and the test would
pass without us actually rendering the text to the page.

Since this we are doing outside-in development and testing for user interface,
we will need to outline the UI first.  To do this, first we'll need a page to host
our code.  Let's create and route a Rails `TasksController`. We'll bootstrap the
Backbone app on `tasks#index`.

` config/routes.rb@f478197

` app/controllers/tasks_controller.rb@f478197

To render our tasks, we'll want a TasksIndex Backbone view class.  But before we
write this class, we'll motivate it with a Jasmine isolation spec:

```javascript
// spec/javascripts/views/tasks_index_spec.js
describe("ExampleApp.Views.TasksIndex", function() {
  it("renders a task table", function() {
    var view = new ExampleApp.Views.TasksIndex();
    view.render();

    expect(view.$el).toBe("#tasks");
    expect(view.$el).toContain("table");
  });
});
```

We use the [jasmine-jquery](https://github.com/velesin/jasmine-jquery) library to
provide DOM matchers for Jasmine like `toContain()`.

To run the Jasmine spec, run `bundle exec rake jasmine` and visit http://localhost:8888.

To make this test pass, we'll add a small template and make the `TasksIndex`
view render it:

```javascript
// app/assets/javascripts/views/tasks_index.js
ExampleApp.Views.TasksIndex = Backbone.View.extend({
  tagName: 'div',
  id: 'tasks',

  initialize: function() {
  },

  render: function () {
    this.$el.html(JST['tasks/index']({}));
    return this;
  }
});
```

The `app/assets/templates/tasks/index.jst.ejs` template:

```html
<table></table>
```

Now our Jasmine specs pass:

![Passing Jasmine spec](images/jasmine-passing.png)

Since the Jasmine specs pass, we'll pop back up a level and run the Cucumber
story.  Running it again, the failure is slightly different.  The `"#tasks
table"` element is present on the page, but doesn't contain the content we want:

```text
@javascript
Scenario: View tasks
  Given the following tasks exist:
    | Title                                |
    | Purchase the Backbone on Rails ebook |
    | Master Backbone                      |
  And I am on the home page
  Then I should see "Master Backbone" within the tasks list
    expected there to be content "Master Backbone" in "Title Completed" \\
(RSpec::Expectations::ExpectationNotMetError)
    ./features/step_definitions/web_steps.rb:107:in \\
`/^(?:|I )should see "([^"]*)"$/'
    features/view_tasks.feature:13:in `Then I should see "Master Backbone" \\
within the tasks list'
```

Drop back down to Jasmine and write a spec motivating the `TasksIndex` view to
accept a collection and render it.  We'll rewrite our existing spec, since we
are changing the `TasksIndex` interface to require that a collection be passed in:

` spec/javascripts/views/tasks_index_spec.js@f478197

This spec fails:

```text
1 spec, 1 failure in 0.008s
Finished at Thu Sep 22 2011 18:10:26 GMT-0400 (EDT)
ExampleApp.Views.TasksIndex
renders a collection of tasks
TypeError: undefined is not a function
TypeError: undefined is not a function
    at [object Object].<anonymous> \\
(http://localhost:8888/assets/views/tasks_index_spec.js?body=1:4:27)
```

It's failing because we haven't defined `ExampleApp.Collections.Tasks` yet.  We
need to define a task model and tasks collection.  We'll define the model:

` app/assets/javascripts/models/task.js@f478197

...write a test to motivate the collection:

` spec/javascripts/collections/tasks_spec.js@f478197

...and pass the test by implementing the collection:

` app/assets/javascripts/collections/tasks.js@f478197

Running the Jasmine specs again, we're making progress.  The `TasksIndex` view is
accepting a collection of tasks, and now we have to render it:

```text
Expected '<div id="tasks"><table> <tbody><tr> <th>Title</th> \\
<th>Completed</th> </tr> </tbody><div></div><div></div></table> </div>' to \\
have text 'Wake up'.
```

The simplest thing we can do to get the spec passing is to pass the `tasks`
collection into the template, and iterate over it there:

` app/assets/javascripts/views/tasks_index.js@f478197

` app/assets/templates/tasks/index.jst.ejs@f478197

Now, Jasmine passes, but the Cucumber story is still failing:

```text
Then I should see "Master Backbone" within the tasks list
Unable to find css "#tasks table" (Capybara::ElementNotFound)
```

This is because the Jasmine spec is an isolation spec, and verifies that the
`TasksIndex` view works in isolation.  There is additional code we need to write
to hook up the data in the Rails test database to the Backbone view.  Adding
this code to bootstrap the Backbone application should wrap up our exercise and
get the tests passing.

We'll motivate writing a top-level Backbone application object with a spec.
Note the use of a `sinon.spy` for verifying the router instantiation:

` spec/javascripts/example_app_spec.js@f478197

Get it to green:

` app/assets/javascripts/example_app.js@f478197

Then we bootstrap the app from the Rails view:

` app/views/tasks/index.html.erb@f478197

And the integration test passes!

```text
Feature: Viewing Tasks
  As a user
  So that I can see what I have to do
  I want to be able to see all my tasks

  @javascript
  Scenario: View tasks
    Given the following tasks exist:
      | Title                                |
      | Purchase the Backbone on Rails ebook |
      | Master Backbone                      |
    And I am on the home page
    Then I should see "Master Backbone" within the tasks list
    And I should see "Purchase the Backbone on Rails ebook" within the tasks list

1 scenario (1 passed)
5 steps (5 passed)
```
