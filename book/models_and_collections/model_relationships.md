## Model relationships

In any non-trivial application, you will have relationships in your domain model
that are valuable to express on the client side.  For example, consider a
contact management application where each person in your contact list has many
phone numbers, each of a different kind.

Or, consider a project planning application where there are Teams, Members, and
Projects as resources (models and collections).  There are relationships between
each of these primary resources, and those relationships in turn may be exposed
as first-class resources: a Membership to link a Team and a Member, or a
Permission to link a Team with a Project.  These relationships are often exposed
as first-class models - so they can be created and destroyed the same way as other
models, and so that additional domain information about the relationship, such
as a duration, rate, or quantity, can be described.

These model relationships don't have to be persisted by a relational database.
In a chatroom application whose data is persisted in a key-value store, the data
could still be modeled as a Room which has many Messages, as well as Memberships
that link the Room to Users.  A content management application that stores its
data in a document database still has the notion of hierarchy, where a Site
contains many Pages, each of which constitutes zero or more Sections.

In a vanilla Rails application, the object model is described on the server side
with ActiveRecord subclasses, and exposed to the Backbone client through a
JSON HTTP API.  You have a few choices to make when designing this API, largely
focused on the inherent coupling of model relationships and data
-- when you handle a request for one resource, which of its associated resources
(if any) do you deliver, too?

Then, on the client side, you have a wide degree of choice in how to model the
relationships, when to eagerly pre-fetch associations and when to lazily defer
loading, and whether to employ a supporting library to help define your model
relationships.

## Backbone-relational plugin

If your use cases are supported by it, Paul Uithol's
[Backbone-relational](https://github.com/PaulUithol/Backbone-relational) is
arguably the most popular and actively maintained library for this.  It lets
you declare one-to-one, one-to-many, and many-to-one relations on your Backbone
models by extending a new base class, `Backbone.RelationalModel`.  It's good to
understand how this works under the hood, so we'll cover one way to implement a
relational object model in Backbone below, but we encourage you to check out
the `Backbone-relational` plugin as a way to work at a higher level of
abstraction.

## Relations in the task app

In the example application, there are users which have many tasks.  Each task
has many attachments and assignments.  Tasks are assigned to users through
assignments, so tasks have many assigned users as well.

## Deciding how to deliver data to the client

Before you decide how to model your JSON API or how to declare your client-side model
relationships, consider the user experience of your application.
For `TaskApp`, we decided to have interactions as follows:

* A user signs up or logs in
* The user is directed to their dashboard
* The dashboard shows all tasks, including assigned users, but without attachments
* When a user views the details of an individual task, the attachments for that task are displayed

This leads us to see that a user's tasks and their assignees are used
immediately upon navigating to the dashboard, but the attachment data for a
task are not needed upon initial page load, and may well never be needed at
all.

Let's say that we are also planning for the user to have continuous network
access, but not necessarily with a high speed connection.  We should also keep in mind that users tend
to view their list of tasks frequently, but rarely view the attachments.

Based on these points, we will bootstrap the collections of tasks and assignees inside the
dashboard, and defer loading of associated attachments until after
the user clicks through to a task.

We could have selected from several other alternatives, including:

* Don't preload any information, and deliver only static assets (HTML, CSS, JS)
  on the dashboard request.  Fetch all resources over separate XHR calls.  This
  can provide for a shorter initial page load time, with the cost of a longer wait for
  actual interactivity. Although the byte size of the page plus data is roughly
  the same, the overhead of additional HTTP requests incurs extra load time.
* Preload all the information, including attachments.  This would
  work well if we expect users to frequently access the
  attachments of many tasks, but incurs a longer initial page load.
* Use `localStorage` as the primary storage engine, and sync to the Rails server
  in the background.  While this would be advantageous if we expected network access
  to be intermittent, it incurs the additional complexity of server-side conflict resolution if two clients submit conflicting updates.

## Designing the HTTP JSON API

Now that we know we'll bootstrap the tasks with assignees and defer the
Associations, we should decide how to deliver the deferred content.  Our goal
is to fetch attachments for an individual task.  Let's discuss two options.

One way we could approach this is to issue an API call for the
nested collection:

```bash
$ curl http://localhost:3000/tasks/78/attachments.json | ppjson
[
  {
    "id": "32",
    "file_url": "https://s3.amazonaws.com/tasksapp/uploads/32/mock.png"
  },
  {
    "id": "33",
    "file_url": "https://s3.amazonaws.com/tasksapp/uploads/33/users.jpg"
  }
]
```

Note that we will authenticate API requests with cookies, just like normal user
logins, so the actual curl request would need to include a cookie from a
logged-in user.

Another way we could approach this is to embed the comment and attachment data in
the JSON representation of an individual task, and deliver this data from the
`/tasks/:id` endpoint:

```bash
$ curl http://tasksapp.local:3000/tasks/78.json | ppjson
{
  /* some attributes left out for clarity */

  "id": 78,
  "user_id": 1,
  "title": "Clean up landing page",
  "attachments": [
    {
      "id": "32",
      "upload_url": "https://s3.amazonaws.com/tasksapp/uploads/32/mock.png"
    }
  ]
}
```

We'll take this approach for the example application, because it illustrates
parsing nested models in Backbone.

At this point, we know that our HTTP JSON API should support at least the
following Rails routes:

```ruby
# config/routes.rb
resources :tasks, :only => [:show, :create] do
  resources :attachments, :only => [:create]
end
```

As an aside: In some applications, you may choose to expose a user-facing API.  It's
valuable to dogfood this endpoint by making use of it from your own Backbone
code.  Often these APIs will be scoped under an "/api" namespace, possibly with
an API version namespace as well like "/api/v1".

## Implementing the API: presenting the JSON

To build the JSON presentation, we have a few options. Rails already comes
with support for overriding the `Task#as_json` method, which is probably the
easiest thing to do. However, logic regarding the JSON representation of a
model is not the model's concern.  An approach that separates presentation
logic is preferable, such as creating a separate presenter object, or writing a
builder-like view.

The [RABL gem](https://github.com/nesquena/rabl) helps you concisely build
a view of your models, and keeps this logic in the presentation tier.

RABL allows you to create templates where you can easily specify the JSON
representation of your models. If you've worked with the `builder`
library to generate XML such as an RSS feed, you'll feel right at home.

To use it, first include the `rabl` and `yajl-ruby` gems in your Gemfile. Then
you can create a view ending with `.json.rabl` to handle any particular request.
For example, a `tasks#show` action may look like this:

```ruby
# app/controllers/tasks_controller.rb
class TasksController < ApplicationController
  respond_to :json

  def show
    @task = Task.find(params[:id])
    respond_with @task
  end
end
```

Rails' responder will first look for a template matching the controller/action
with the format in the file name, in this case `json`. If it doesn't find anything,
it will invoke `to_json` on the `@task` model, but in this case we are providing
one in `app/views/tasks/show.json.rabl`, so it will render that instead:

```ruby
# app/views/tasks/show.json.rabl
object @task
attributes(:id, :title, :complete)
child(:user) { attributes(:id, :email) }
child(:attachments) { attributes(:id, :email) }
```

## Parsing the JSON and instantiating client-side models

Now that our API delivers the `Task` JSON to the client, including its
nested `Attachments`, we need to correctly handle this nested data in the
client-side model.  Instead of a nested hash of attributes on the
`Task`, we want to instantiate a Backbone collection for the
attachments that contains a set of Backbone `Attachment` models.

The JSON for the attachments is initially set on the Backbone `Task` model as a
Backbone attribute which can be accessed with `get()` and `set()`.  We are
replacing it with an instance of a Backbone `Attachments` collection and
placing that as an object property:

```javascript
taskBeforeParsing.get('attachments')
// => [ { id: 1, upload_url: '...' }, { id: 2, upload_url: '...' } ]
taskBeforeParsing.attachments
// => undefined

/* parse attributes... */

taskAfterParsing.get('attachments')
// => undefined
taskAfterParsing.attachments
// => ExampleApp.Collection.Attachments(...)
```

One way to do this is to override the `parse` function on the `Task` model.

There are two `parse` functions in Backbone: one on `Collection` and another on
`Model`.  Backbone will invoke them whenever a model or collection is populated
with data from the server; that is, during `Model#fetch`, `Model#save` (which
updates model attributes based on the server's response to the HTTP PUT/POST
request), and `Collection#fetch`.  It's also invoked when a new model is
initialized and `options.parse` is set to `true`.

It's important to note that `parse` is not called by `Collection#reset`,
which should be called with an array of models as its first argument.  Backbone
does support calling `Collection#reset` with just an array of bare attribute
hashes, but these will not be routed through `Model#parse`, which can be the source of some
confusion.

Another way to intercept nested attributes and produce a full object graph
is to bind to the `change` event for the association attribute - in this case,
`task.attachments`:

```javascript
// app/assets/javascripts/models/task.js
ExampleApp.Models.Task = Backbone.Model.extend({
  initialize: function() {
    this.on("change:attachments", this.parseAttachments);
    this.parseAttachments();
  },

  parseAttachments: function() {
    this.attachments = new ExampleApp.Collections.Attachments(this.get('attachments'));
  },

  // ...
```

This ensures that our custom parsing is invoked whenever the `attachments`
attribute is changed, and when new model instances are created.

## When to fetch deferred data

Since a Backbone task doesn't always have its associations filled, when you
move from `TasksIndex` to `TasksShow`, you need to invoke `task.fetch()` to pull all
the task attributes from `GET /tasks/:id` and populate the `attachments`
association.  Whose concern is that? Let's talk it through.

You could lazily populate this association by making the `task.attachments`
association a function instead of a property. Compare `task.attachments.each` to
`task.attachments().each`; in the latter, the accessing function encapsulates the
concern of laziness in fetching and populating, but then you run into the issue that
fetch is asynchronous.  Passing a callback into `attachments()` is kludgy; it
exposes the deferred nature of the association everywhere you need to access it.

We'll instead prefer to treat the deferred nature explicitly in the
`Routers.Tasks#show` route, a natural application seam to the `TaskShow` view.
This frees `TaskShow` from having to know about the persistence details of
the model:

```javascript
// app/assets/javascripts/routers/tasks.js
ExampleApp.Routers.Tasks = Support.SwappingRouter.extend({
  // ...

  show: function(taskId) {
    var task = this.collection.get(taskId);
    var tasksRouter = this;
    task.fetch({
      success: function() {
        var view = new ExampleApp.Views.TaskShow({ model: task });
        tasksRouter.swap(view);
      }
    });
  }
});
```

Now, we have successfully deferred the `Task#attachments` association and
kept the concern clear of the view.
