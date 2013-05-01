## Isolated unit testing

Integration testing your application is great for ensuring that the product
functions as intended, and works to mitigate against risk of regressions.
There are additional benefits, though, to writing tests for individual units
of your application in isolation, such as focused failures and decoupled code.

When an integration test fails, it can be difficult to pin down the exact reason
why; particularly when a regression is introduced in a part of the application
seemingly far away from where you're working.  With the finer granularity of a
unit test suite, failures are more targeted and help you get to the root of the
problem more quickly.

Another benefit comes from unit testing when you test-drive code; i.e., when you write
the tests before the implementation.  Since you are starting with a piece of
code which is client to your implementation modules, setup and dependency
concerns are brought to your attention at the beginning of implementation,
rather than much later during development when modules are integrated. Thinking
about these concerns earlier helps you design modules which are more loosely
coupled, have smaller interfaces, and are easier to set up.  If code is hard to
test, it will be hard to use.  Writing the test first, you have a clear and
concrete opportunity to make your implementation easier to use.

Finally, there are some behaviors that are difficult or impossible to test
using a full-stack integration test. Here's a common example: you want to
display a spinner graphic or disable a UI element while waiting for the server
to respond to a request. You can't test this with an integration test because
the time the server takes to respond is variable; by the time your test checks
to look for the spinner graphic, the response will probably be finished. Even if
it passes once, it may fail on the next run, or on the run after that. And if
you decide to do an almost-full-stack test and fake out a slow response on the
server, this will slow down your tests and introduce unnecessary indirection
to an otherwise simple component. During isolation tests, it's easy to use
techniques like dependency injection, stubbing, and mocking to test erratic
behaviors and side effects that are difficult to observe during integration
tests.

If you'd like to read more on test-driven development, check out Kent Beck's
_Test Driven Development: By Example_ and Gerard Meszaros' _xUnit Test Patterns:
Refactoring Test Code_.

As there is plentiful content available for testing tools and strategies in
Rails, we'll focus on isolation testing your Backbone code.

### Isolation testing in JavaScript

There are many JavaScript testing frameworks available.  Some run in-browser and
provide facility for setting up DOM fixtures.  Others are designed for
standalone JavaScript code and can run on browserless JavaScript runtimes.

We'll use the Jasmine framework for writing our isolation specs.  It integrates
easily into a Rails application, and provides an RSpec-like syntax for writing
specs:

```javascript
// spec/javascripts/models/tasks_spec.js
describe("ExampleApp.Models.Tasks", function() {
  it("knows if it is complete", function() {
    var completeTask = new ExampleApp.Models.Task({ complete: true });
    expect(completeTask.isComplete()).toBe(true);
  });

  it("knows if it is not complete", function() {
    var incompleteTask = new ExampleApp.Models.Task({ complete: false });
    expect(incompleteTask.isComplete()).toBe(false);
  });
});
```

To run the Jasmine tests in the example application, simply run `bundle exec
rake jasmine` and visit http://localhost:8888.

### What to test?

We frequently found it difficult to test JavaScript components in isolation
before we started using Backbone. Although jQuery really takes the pain out of
working with the DOM and communicating with the server, it's not
object-oriented and provides nothing to help split up your application.
Because most of our HTML was in ERB-based templates, it was generally
difficult to test the JavaScript that relied on that HTML without also loading
the web application. This meant that almost all of our early JavaScript tests
were full-stack integration tests.

Using Backbone, it's much easier to test components in isolation. View code is
restricted to views, and templates contain only HTML or interpolation code
that can be interpreted by the JavaScript view layer, such as jst or Mustache
templates. Models and collections can be given data in their constructor, and
simple dependency injection allows unit tests to fake out the remote server.
We don't test routers in isolation as often because they're very light on
logic, but those are also easy to test by calling action methods directly or
triggering events.

Since Backbone components are just as easy to test in isolation as they are to
test full-stack, we generally use the same guidelines as we do for all Rails
applications to decide what to test where.

Start with a top-down, full-stack Cucumber or RSpec scenario to describe the
feature you're writing from a high-level perspective, and begin implementing
behavior from the top as necessary. If you find that the feedback loop between
a test failure and the code to pass it starts to feel too long, start writing
isolated unit tests for the individual components you need to write to get
closer to passing a higher-level assertion. As an example, an assertion from
Capybara that fails because of a missing selector may need new models,
controllers, views, and routes both on the server and in Backbone. Rather than
writing several new components without seeing the failure message change,
write a unit test for each piece as you progress down. If it's clear what
component you need to add from the integration test failure, add that
component without writing an isolated unit test. For example, a failure from a
missing route or view file reveals an obvious next step, but missing text on a
page, because a model method doesn't actually do anything, may motivate a unit
test.

Many features will have edge cases or several logical branches. Anything that
can't be described from a high-level, business value perspective should be
tested from an isolated unit test. For example, when testing a form, it makes
sense to write a scenario for the success path, where a user enters valid
data that gets accepted and rendered by the application, and one extra
scenario for the failure path, where a user enters invalid data that the
system can't accept. However, when adding future validations or other reasons
that a user's data can't be accepted, it makes sense to just write an extra
isolated unit test, rather than adding a new scenario that largely duplicates
the original failure scenario.

When writing isolation tests, the developer needs to decide exactly how much
isolation to enforce. For example, when writing a unit test for a model,
you'll likely decide not to involve an actual web server to provide data.
However, when testing a view that composes other subviews, you'll likely allow
the actual subview code to run. There are many cases when it will make
sense to just write a unit test that involves a few components working
together, rather than writing a full-stack scenario.

The overall goals when deciding how much to test via integration vs. isolation
are to keep high-level business logic described in top-down tests, to keep
details and edge cases described in unit tests, and to write tests that
exercise the fewest number of components possible while remaining robust and
descriptive without becoming brittle.

### Helpful Tools

* Spy/stub/mock, even your HTTP, with [Sinon.js](http://sinonjs.org/)
* If you're looking for factory_girl.js, it's called [Rosie](https://github.com/bkeepers/rosie)
* Use the Rails asset pipeline with the latest edge versions of the Jasmine gem
* See other examples on James Newbery's blog: [testing Backbone with Jasmine](http://tinnedfruit.com/2011/03/03/testing-backbone-apps-with-jasmine-sinon.html) and check out his [examples on GitHub](https://github.com/froots/backbone-jasmine-examples)
