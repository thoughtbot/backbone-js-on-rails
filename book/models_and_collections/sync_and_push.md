## Synchronizing between clients

A driving force behind the move to rich client web apps is to improve the
user experience. These applications are more responsive and can support more
detailed and stateful interactions.

One such interaction involves multiple concurrent users interacting with the
same resource in real time. We can deliver a more seamless experience by
propagating users' changes to one another as they take place: When you and I
edit the same document, I see your changes on my screen as you type them. If
you've ever used Google Docs or Google Wave, you've seen this in action.

So, how can we build this functionality into our own applications?

### The moving parts

There are a few different pieces that we'll put together for this.  The basic parts are:

1. **Change events.** The fundamental unit of information that we broadcast through
   our system to keep clients in sync.  Delivered as messages, these events
   contain enough information for any receiving client to update its own data
   without needing a full re-fetch from the server.
2. **An event source.**  With trusted clients, changes can originate directly from
   the client.  More often, however, we will want the server to arbitrate
   changes so that it can apply authorization, data filtering, and validations.
3. **A transport layer that supports pushing to clients.**
   [The WebSocket API](http://www.w3.org/TR/websockets/) is such a transport, and
   is ideal for its low overhead and latency.
4. **Event-driven clients.**  Clients should be able to react to incoming change
   events, ideally handling them with incremental UI updates rather than
   re-drawing themselves entirely.  Backbone helps in this department, as your
   client-side application is likely already set up to handle such events.
5. **A message bus.**  Separating the concern of message delivery from our main
   application helps it stay smaller and helps us scale our messaging and
   application infrastructure separately. There are already several great
   off-the-shelf tools we can use for this.

### Putting it together: A look at the life cycle of a change

Revisiting our todo application, we'd like to add the ability to collaborate on
todo lists, so that different users will be able to work on the same todo list
concurrently.  Several users can look at the same list; adding, changing, and
checking off items.

There are a few technical decisions mentioned previously.  For this example, we will:

1. Use Rails on the server and Backbone on the client.
2. Use the server as the canonical event source so that clients do not have to
   trust one another.  In particular, we'll employ an `ActiveRecord::Observer`
   that observes Rails model changes and dispatches a change event.
3. Use [Faye](http://faye.jcoglan.com) as the messaging backend, which has Ruby
   and JavaScript implementations for clients and server.  Faye implements the
   [Bayeux protocol](http://svn.cometd.com/trunk/bayeux/bayeux.html), prefers
   WebSocket for transport (though it gracefully degrades to long polling, CORS,
   or JSON-P), and supports a bunch of other goodies like clustering and
   extensions (inbound- and outbound- message filtering, like Rack middleware).

In our application, there are several connected clients viewing the same todo
list, and one user, "Alice," makes a change to an item on the list.

Let's take a look at the lifecycle of one change event.

Setup:

1. An instance of JavaScript class `BackboneSync.FayeSubscriber` is
   instantiated on each client.  It is configured with a channel to listen to,
   and a collection to update.
2. The Faye server is started.
3. The Rails server is started, and several clients are connected and viewing
   `#todo_lists/1`.

On Alice's machine, the client responsible for the change:

1. Alice clicks "Save" in her view of the list.
2. The "save" view event is triggered.
3. The event handler invokes `this.model.save(attributes)`.
4. `Backbone.Model.prototype.save` calls `Backbone.sync`.
5. `Backbone.sync` invokes `$.ajax` and issues an HTTP PUT request to the server.

On the server:

1. Rails handles the PUT request and calls `#update_attributes` on an ActiveRecord model instance.
2. An `ActiveRecord::Observer` observing this model gets its `#after_save` method invoked.
3. The observer dispatches a change event message to Faye.
4. Faye broadcasts the change event to all subscribers.

On all clients:

1. `FayeSubscriber` receives the change event message, likely over a WebSocket.
2. The subscriber parses the event message, picking out the event (`update`),
   the `id` of the model to update, and a new set of attributes to apply.
3. The `FayeSubscriber` fetches the model from the collection, and calls `set`
   on it to update its attributes.

Now all the clients have received the changeset that Alice made.

### Implementation: Step 1, Faye server

We'll need to run Faye to relay messages from publishers to subscribers.  For
Rails apps that depend on Faye, We recommend keeping a `faye/` subdirectory under the
app root that contains a `Gemfile` and `config.ru`, and maybe a shell script to
start Faye:

```bash
$ cat faye/Gemfile

source 'http://rubygems.org'
gem 'faye'
gem 'thin'

$ cat faye/config.ru

require 'faye'
bayeux = Faye::RackAdapter.new(:mount => '/faye', :timeout => 25)
bayeux.listen(9292)

$ cat faye/run.sh

#!/usr/bin/env bash
BASEDIR=$(dirname $0)
BUNDLE_GEMFILE=$BASEDIR/Gemfile
bundle exec rackup $BASEDIR/config.ru -s thin -E production

$ bundle
(...)
Your bundle is complete! Use `bundle show [gemname]` to see where a bundled gem is installed.

$ ./faye/run.sh

>> Thin web server (v1.2.11 codename Bat-Shit Crazy)
>> Maximum connections set to 1024
>> Listening on 0.0.0.0:9292, CTRL+C to stop
```

### Implementing it: Step 2, ActiveRecord observers
Now that the message bus is running, let's walk through the server code.  The
Rails app's responsibility is this: Whenever a todo model is created, updated,
or deleted, it will publish a change event message.

This is implemented with an `ActiveRecord::Observer`.  We provide the
functionality in a module:

` lib/backbone_sync.rb@5bfb07a

...and then mix it into a concrete observer class in our application.  In this
case, we name it `TodoObserver`:

```ruby
# app/observers/todo_observer.rb
class TodoObserver < ActiveRecord::Observer
  include BackboneSync::Rails::Faye::Observer
end
```

This observer is triggered each time a Rails `Todo` model is created, updated,
or destroyed.  When one of these events happen, the observer sends along a
message to our message bus, indicating the change.

Let's say that a `Todo` was just created:

```ruby
>> Todo.create(title: "Buy some tasty kale juice")
=> #<Todo id: 17, title: "Buy some tasty kale juice", created_at: "2011-09-06 20:49:03", updated_at: "2011-09-07 15:01:09">
```

The message looks like this:

```javascript
{
  "channel": "/sync/todos",
  "data": {
    "create": {
      "17": {
        "id": 17,
        "title": "Buy some tasty kale juice",
        "created_at": "2011-09-06T20:49:03Z",
        "updated_at": "2011-09-07T15:01:09Z"
      }
    }
  }
}
```

Received by Faye, the message is broadcast to all clients subscribing to the
`/sync/todos` channel, including our browser-side `FayeSubscriber` objects.

### Implementing it: Step 3, In-browser subscribers

In each browser, we want to connect to the Faye server, subscribe to events on
channels that interest us, and update Backbone collections based on those
messages.

Faye runs an HTTP server, and serves up its own client library, so that's easy to pull in:

```html
<script type="text/javascript" src="http://localhost:9292/faye.js"></script>
```

To subscribe to Faye channels, instantiate a `Faye.Client` and call `subscribe` on it:

```javascript
var client = new Faye.Client('http://localhost:9292/faye');
client.subscribe('/some/channel', function(message) {
  // handle message
});
```

When the browser receives messages from Faye, we want to update a Backbone
collection.  Let's wrap up those two concerns into a `FayeSubscriber`:

```javascript
// app/assets/javascripts/backbone_sync.js
this.BackboneSync = this.BackboneSync || {};

BackboneSync.RailsFayeSubscriber = (function() {
  function RailsFayeSubscriber(collection, options) {
    this.collection = collection;
    this.client = new Faye.Client('<%= BackboneSync::Rails::Faye.root_address %>/faye');
    this.channel = options.channel;
    this.subscribe();
  }

  RailsFayeSubscriber.prototype.subscribe = function() {
    return this.client.subscribe("/sync/" + this.channel, _.bind(this.receive, this));
  };

  RailsFayeSubscriber.prototype.receive = function(message) {
    var self = this;
    return $.each(message, function(event, eventArguments) {
      return self[event](eventArguments);
    });
  };

  RailsFayeSubscriber.prototype.update = function(params) {
    var self = this;
    return $.each(params, function(id, attributes) {
      var model = self.collection.get(id);
      return model.set(attributes);
    });
  };

  RailsFayeSubscriber.prototype.create = function(params) {
    var self = this;
    return $.each(params, function(id, attributes) {
      var model = new self.collection.model(attributes);
      return self.collection.add(model);
    });
  };

  RailsFayeSubscriber.prototype.destroy = function(params) {
    var self = this;
    return $.each(params, function(id, attributes) {
      var model = self.collection.get(id);
      return self.collection.remove(model);
    });
  };

  return RailsFayeSubscriber;
})();
```

Now, for each collection that we'd like to keep in sync, we instantiate a
corresponding `FayeSubscriber`.  Say, in your application bootstrap code:

```javascript
# app/assets/javascripts/routers/todos.js
MyApp.Routers.TodosRouter = Backbone.Router.extend({
  initialize: function(options) {
    this.todos = new Todos.Collections.TodosCollection();
    new BackboneSync.FayeSubscriber(this.todos, { channel: 'todos' });
    this.todos.reset(options.todos);
  },

  // ...
});
```

Now run the app, and watch browsers receive push updates!

### Testing synchronization

Of course, this introduces a great deal of complexity into your app. There's a
new daemon running on the server (Faye), and every client now has to correctly
listen to its messages and re-render the appropriate views to show the new data.
This gets even more complex when the resource being updated is currently being
edited by another user. Your own requirements will dictate the correct behavior
in cases like that, but what's most important is that you are able to reproduce
such workflows in automated tests.

While this book includes a chapter dedicated to testing Backbone applications, this next section
describes the tools and approach that will allow you to verify this behavior in
tests.

Following an outside-in development approach, we start with an acceptance test
and dive into the isolated testing examples when the acceptance tests drive us
to them. There's nothing novel in regards to isolation testing of these
components, so we will not touch on them here. Instead, we'll describe how to
write an acceptance test for the above scenario.

The required pieces for the approach are:

- Ensure a faye server running on your testing environment
- Fire up a browser session using an browser acceptance testing framework
- Sign in as Alice
- Start a second browser session and sign in as Olivia
- Edit some data on Alice's session
- See the edited data reflected on Olivia's session

We will be using Cucumber with Capybara and RSpec for this example.

To ensure the Faye server is running, we merely try to make a connection
to it when Cucumber boots, failing early if we can't connect. Here's a
small snippet that you can drop in `features/support/faye.rb` to do
just that:

```ruby
begin
  Timeout.timeout(1) do
    uri = URI.parse(BackboneSync::Rails::Faye.root_address)
    TCPSocket.new(uri.host, uri.port).close
  end
rescue Errno::ECONNREFUSED, Errno::EHOSTUNREACH, Timeout::Error
  raise "Could not connect to Faye"
end
```

With that in place, we are now sure that Faye is running and we can move
on to our Cucumber scenario. Create a `features/sync_task.feature` file
and let's describe the desired functionality:

```cucumber
  @javascript
  Scenario: Viewing a task edited by another user
    Given the following users exist:
      | email               |
      | alice@example.com   |
      | olivia@example.com  |
    Given the following task exists:
      | title             |
      | Get Cheeseburgers |
    And I am using session "Alice"
    And I sign in as "alice@example.com"
    Then I should see "Get Cheeseburgers"
    When I switch to session "Olivia"
    And I sign in as "olivia@example.com"
    And I edit the "Get Cheeseburgers" task and rename it to "Buy Cheeseburgers"
    And I switch to session "Alice"
    Then I should see "Buy Cheeseburgers"
```

Thankfully, Capybara allows us to run acceptance tests with client-side
behavior by specifying different drivers to run scenarios that require
JavaScript vs. those which don't. The very first line above, `@javascript`,
tells Capybara to use a JavaScript-enabled driver such as Selenium or
capybara-webkit.

The following two steps that create some fixture data are provided by
[FactoryGirl](https://github.com/thougthbot/factory_girl), which looks
into your factory definitions and builds step definitions based on their
attributes and associations.

But then we get into the meat of the problem: switching sessions. Capybara
introduced the ability to name and switch sessions in your scenarios via
the `session_name` method. The definition for the `I am using session
"Alice"` step looks like this:

```ruby
When /^I (?:am using|switch to) session "([^"]+)"$/ do |new_session_name|
  Capybara.session_name = new_session_name
end
```

This allows us to essentially open up different browsers, if you're
using the Selenium driver, and it is the key to exercising background syncing
code in Capybara acceptance testing.

With this in place, the rest is quite straightforward - we simply interact
with the application as you would with any Cucumber scenario; visiting pages,
filling in forms, and verifying results on the page, all the while specifying
which session you're interacting with.

Additionally, the `BackboneSync.FayeSubscriber` JavaScript class should also
be tested in isolation. We've used Jasmine for testing JavaScript behavior
successfully, so it is the approach we recommend. For more information about
using Jasmine, refer to the "Testing" chapter.

### Further reading

For a solid, readable background on idempotent messages, check out
[_The Importance of
Idempotence_](http://devhawk.net/2007/11/09/the-importance-of-idempotence/).
