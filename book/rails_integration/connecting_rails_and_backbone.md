## An overview of the stack: connecting Rails and Backbone

By default, Backbone communicates with your Rails application via JSON HTTP
requests. If you've ever made a JSON API for your Rails app, then
for the most part, this will be very familiar.  If you have not made a JSON API
for your Rails application before, lucky you! It's pretty straightforward.

This section will briefly touch on each of the major parts of an application
using both Rails and Backbone.  We'll go into more detail in later chapters,
but this should give you the big picture of how the pieces fit together.

### Setting up models

In our example application, we have a Task model, exposed via a JSON API at
`/tasks`. The simplest Backbone representation of this model would be as
shown below:

```javascript
// app/assets/javascripts/models/task.js
var Task = Backbone.Model.extend({
  urlRoot: '/tasks'
});
```

The `urlRoot` property above describes a base for the server-side JSON API that
houses this resource.  Collection-level requests will occur at that root URL,
and requests relating to instances of this model will be found at `/tasks/:id`.

It's important to understand that there is no need to have a one-to-one mapping
between Rails models and Backbone models.  Backbone models instead correspond
with RESTful resources.  Since your Backbone code is in the presentation tier,
it's likely that some of your Backbone models may end up providing only a
subset of the information present in the Rails models, or they may aggregate
information from multiple Rails models into a composite resource.

In Rails, it's possible to access individual tasks, as well as all tasks (and
query all tasks) through the same `Task` model. In Backbone, models
only represent the singular representation of a `Task`. Backbone splits out the
plural representation of `Tasks` into `Collections`.

The simplest Backbone collection to represent our `Tasks` would be the
following.

```javascript
// app/assets/javascripts/collections/tasks.js
ExampleApp.Collections.Tasks = Backbone.Collection.extend({
  model: Task
});
```

If we specify the URL for `Tasks` in our collection instead, then models within
the collection will use the collection's URL to construct their own URLs, and
the `urlRoot` no longer needs to be specified in the model. If we make that
change, then our collection and model will be as follows.

```javascript
// app/assets/javascripts/collections/tasks.js
ExampleApp.Collections.Tasks = Backbone.Collection.extend({
  model: Task,
  url: '/tasks'
});

// app/assets/javascripts/models/task.js
var Task = Backbone.Model.extend({});
```

Notice in the above model definitions that there is no specification of the
attributes on the model. As in ActiveRecord, Backbone models get their
attributes from the data used to populate them at runtime. In this case,
this schema and data are JSON responses from the Rails server.

The default JSON representation of an ActiveRecord model is an object that includes
all the model's attributes. It does not include the data for any related models
or any methods on the model, but it does include the ids of any `belongs_to` relations
as those are stored in a `relation_name_id` attribute on the model.

The JSON representation of your ActiveRecord models will be retrieved by
calling `to_json` on them, which returns a string of JSON. Customize the output
of `to_json` by overriding the `as_json` method in your model, which returns a
Ruby data structure like a Hash or Array which will be serialized into the JSON
string.  We'll touch on this more later in the section, "Customizing your
Rails-generated JSON."

### Setting up Rails controllers

The Backbone models and collections will talk to your Rails controllers. The
most basic pattern is one Rails controller providing one family of RESTful
resource to one Backbone model.

By default, Backbone models communicate in the normal RESTful way that Rails
controllers understand, using the proper verbs to support the standard RESTful
Rails controller actions: index, show, create, update, and destroy. Backbone
does not make any use of the new action.

Therefore, it's just up to us to write a _normal_ RESTful controller.  The
newest and most succinct way to structure these is to use the `respond_with`
method, introduced in Rails 3.0.

When using `respond_with`, declare supported formats with `respond_to`. Inside
individual actions, you then specify the resource or resources to be delivered
using `respond_with`:

```ruby
# app/controllers/tasks_controller.rb
class TasksController < ApplicationController
  respond_to :html, :json

  def index
    respond_with(@tasks = Task.all)
  end
end
```

In the above example tasks controller, the `respond_to` line declares that this
controller should respond to requests for both the HTML and JSON formats. Then,
in the index action, the `respond_with` call will build a response according to
the requested content type (which may be HTML or JSON in this case) and
provided resource, `@tasks`.

#### Validations and your HTTP API

If a Backbone model has a `validate` method defined, it will be validated on
the client side, before its attributes are set. If validation fails, no changes
to the model will occur, and the "invalid" event will be fired. Your `validate`
method will be passed the attributes that are about to be updated. You can
signal that validation passed by returning nothing from your `validate` method.
You signify that validation has failed by returning something from the method.
What you return can be as simple as a string, or a more complex object that
describes the error in all its gory detail.

The amount of validation you include on the client side is essentially a
tradeoff between interface performance and code duplication.  It's important
for the server to make the last call on validation.

So, your Backbone applications will likely rely on at least some server-side
validation logic.  Invalid requests return non-2xx HTTP responses, which
are handled by error callbacks in Backbone:

```javascript
task.save({ title: "New Task title" }, {
  error: function() {
    // handle error from server
  }
});
```

The error callback will be triggered if your server returns a non-2xx
response. Therefore, you'll want your controller to return a non-2xx HTTP
response code if validations fail.

A controller that does this would appear as shown in the following example:

```ruby
# app/controllers/tasks_controller.rb
class TasksController < ApplicationController
  respond_to :json

  def create
    @task = Task.new(params[:task])
    if @task.save
      respond_with(@task)
    else
      respond_with(@task, :status => :unprocessable_entity)
    end
  end
end
```

The default Rails responders will respond with an unprocessable entity (422)
status code when there are validation errors, so the action above can be
refactored:

```ruby
# app/controllers/tasks_controller.rb
class TasksController < ApplicationController
  respond_to :json
  def create
    @task = Task.new(params[:task])
    @task.save
    respond_with @task
  end
end
```

Your error callback will receive both the model as it was attempted to be
saved and the response from the server. You can take that response and handle
the errors returned by the above controller in whatever way is fit for your
application.

A few different aspects of validations that we saw here are covered in other sections of this book. For more information about validations, see
the "Validations" section of the "Models and Collections" chapter. For more
information about reducing redundancy between client and server validations,
see the "Duplicating business logic across the client and server" section of
the "Models and Collections" chapter. For more information about handling and
displaying errors on the client side, see the "Forms" section of the
"Routers, Views and Templates" chapter.

### Setting Up Views

Most Backbone applications will be a single-page app, or "SPA." This means that
your Rails application handles two jobs: First, it renders a single page which
hosts your Backbone application and, optionally, an initial data set for it to
use. From there, ongoing interaction with your Rails application occurs via
HTTP JSON APIs.

For our example application, this host page will be located at `Tasks#index`,
which is also routed to the root route.

You will want to create an object in JavaScript for your Backbone application.
Generally, we use this object as a top-level namespace for other Backbone
classes, as well as a place to hold initialization code.  For more information
on this namespacing see the "Namespacing your application" section of the
Organization chapter.

This application object will look like the following:

```javascript
// app/assets/javascripts/example_app.js
var ExampleApp = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function(data) {
    this.tasks = new ExampleApp.Collections.Tasks(data.tasks);
    new ExampleApp.Routers.Tasks();
    Backbone.history.start();
  }
};
```

You can find this file in the example app in
`app/assets/javascripts/example_app.js`.

IMPORTANT: You must instantiate a Backbone router before calling
`Backbone.history.start()` otherwise `Backbone.history` will be `undefined`.

Then, inside `app/views/tasks/index.html.erb` you will call the `initialize` method.
You will often bootstrap data into the Backbone application to provide initial
state.  In our example, the tasks have already been provided to the Rails view
in an `@tasks` instance variable:

```javascript
<!-- app/views/tasks/index.html.erb -->
<%= content_for :javascript do -%>
  <%= javascript_tag do %>
    ExampleApp.initialize({ tasks: <%== @tasks.to_json %> });
  <% end %>
<% end -%>
```

The above example uses ERB to pass the JSON for the tasks to the `initialize`
method, but we should be mindful of the XSS risks that dumping user-generated
content here poses.  See the "Encoding data when bootstrapping JSON data"
section in the "Security" chapter for a more secure approach.

Finally, you must have a Router in place that knows what to do.  We'll cover
routers in more detail in the "Routers, Views and Templates" chapter.

```javascript
// app/assets/javascripts/routers/tasks.js
ExampleApp.Routers.Tasks = Backbone.Router.extend({
  routes: {
    "": "index"
  },

  index: function() {
    // We've reached the end of Rails integration - it's all Backbone from here!

    alert('Hello, world!  This is a Backbone router action.');

    // Normally you would continue down the stack, instantiating a
    // Backbone.View class, calling render() on it, and inserting its element
    // into the DOM.

    // We'll pick back up here in the "Converting Views" section.
  }
});
```

The example router above is the last piece needed to complete our
initial Backbone infrastructure. When a user visits `/tasks`, the
`index.html.erb` Rails view will be rendered, which properly initializes
Backbone and its dependencies and the Backbone models, collections, routers,
and views.
