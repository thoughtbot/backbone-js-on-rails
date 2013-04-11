## Converting an existing page/view area to use Backbone

This section is meant to get you started understanding how Backbone views
work by illustrating the conversion of a Rails view to a Backbone view.

Its important to note that a Rails view is not directly analogous to a Backbone
view. In Rails, the term "view" usually refers to an HTML template, where
Backbone views are classes that contain event handling and presentation logic.

Consider the following Rails view for a tasks index:

```rhtml
<!-- app/views/tasks/index.html.erb -->
<h1>Tasks</h1>

<table>
  <tr>
    <th>Title</th>
    <th>Completed</th>
  </tr>

  <% @tasks.each do |task| %>
    <tr>
      <td><%= task.title %></td>
      <td><%= task.completed %></td>
    </tr>
  <% end %>
</table>
```

So far, we have the Backbone `Task` model and collection and the Rails `Task`
model and controller discussed above, and we're bootstrapping the Backbone app
with all the tasks.  Next, we will create a Backbone view which will render a
corresponding Backbone template.

A Backbone view is a class that is responsible for rendering the display of a
logical element on the page. A view also binds to DOM events occurring within
its DOM scope that trigger various behaviors.

We'll start with a basic view that achieves the same result as the Rails template
above, rendering a collection of tasks:

```javascript
// app/assets/javascripts/views/tasks_index.js
ExampleApp.Views.TasksIndex = Backbone.View.extend({
  render: function () {
    this.$el.html(JST['tasks/index']({ tasks: this.collection }));
    return this;
  }
});
```

The `render` method above renders the `tasks/index` JST template, passing
the collection of tasks into the template.

Each Backbone view has an element that it stores in `this.$el`.  This element
can be populated with content, although it's a good practice for code outside
the view to actually insert the view into the DOM.

We'll update the Backbone route to instantiate this view, passing in the
collection for it to render. The router then renders the view, and inserts it
into the DOM:

```javascript
// app/assets/javascripts/routers/tasks.js
ExampleApp.Routers.Tasks = Backbone.Router.extend({
  routes: {
    "": "index"
  },

  index: function() {
    var view = new ExampleApp.Views.TasksIndex({ collection: ExampleApp.tasks });
    $('body').html(view.render().$el);
  }
});
```

Now that we have the Backbone view in place that renders the template, and
it's being called by the router, we can focus on converting the above Rails
view to a Backbone template.

Backbone depends on Underscore.js which, among many things, provides
templating.  The delimiter and basic concepts used for Underscore.js
templates and ERB are the same.  When converting an existing Rails application
to Backbone, this similarity can help ease the transition.

The `tasks/index` JST template does two things:

* Loops over all of the tasks
* For each task, it outputs the task title and completed attributes

Underscore.js provides many iteration functions that will be familiar to Rails
developers such as  `_.each`, `_.map`, and `_.reject`. Backbone also proxies to
Underscore.js to provide these iteration functions as methods on `Backbone.Collection`.

We'll use the `each` method to iterate through the `Tasks` collection that was
passed to the view, as shown in the converted Underscore.js template below:

```rhtml
<!-- app/assets/templates/tasks/index.jst.ejs -->
<h1>Tasks</h1>

<table>
  <tr>
    <th>Title</th>
    <th>Completed</th>
  </tr>

  <% tasks.each(function(model) { %>
    <tr>
      <td><%= model.escape('title') %></td>
      <td><%= model.escape('completed') %></td>
    </tr>
  <% }); %>
</table>
```

In Rails 3.0 and above, template output is HTML-escaped by default. In order to
ensure that we have the same XSS protection as we did in our Rails template, we
access and output the Backbone model attributes using the `escape` method
instead of the normal `get` method.

### Breaking out the TaskView

In Backbone, views are often bound to an underlying model, re-rendering
themselves when the model data changes.  Consider what happens when any task
changes data with our approach above; the entire collection must be
re-rendered.  It's useful to break up these composite views into two separate
classes, each with their own responsibility: a parent view that handles the
aggregation, and a child view responsible for rendering each node of content.

With each of the `Task` models represented by an individual `TaskView`,
changes to an individual model are broadcast to its corresponding `TaskView`,
which re-renders only the markup for one task.

Continuing our example from above, a `TaskView` will be responsible for
rendering just the individual table row for a `Task`:

```rhtml
<!-- app/assets/templates/tasks/task.jst.ejs -->
<tr>
  <td><%= model.escape('title') %></td>
  <td><%= model.escape('completed') %></td>
</tr>
```

And the Task index template will be changed to appear as shown below:

```rhtml
<!-- app/assets/templates/tasks/index.jst.ejs -->
<h1>Tasks</h1>

<table>
  <tr>
    <th>Title</th>
    <th>Completed</th>
  </tr>

  <!-- child content will be rendered here -->

</table>
```

As you can see above in the index template, the individual tasks are no longer
iterated over and rendered inside the table, but instead within the
`TasksIndex` and `TaskView` views, respectively:

```javascript
// app/assets/javascripts/views/task.js
ExampleApp.Views.TaskView = Backbone.View.extend({
  render: function () {
    this.$el.html(JST['tasks/view']({ model: this.model }));
    return this;
  }
});
```

The `TaskView` view above is very similar to the one we saw previously for the
`TasksIndex` view.  It is only responsible for rendering the contents of its own
element, and the concern of assembling the view of the list is left to the
parent view object:

```javascript
// app/assets/javascripts/views/tasks_index.js
ExampleApp.Views.TasksIndex = Backbone.View.extend({
  render: function () {
    var self = this;

    this.$el.html(JST['tasks/index']()); // Note that no collection is needed
                                         // to build the container markup.

    this.collection.each(function(task) {
      var taskView = new ExampleApp.Views.TaskView({ model: task });
      self.$('table').append(taskView.render().el);
    });

    return this;
  }
});
```

In the new `TasksIndex` view above, the `tasks` collection is iterated over. For
each task, a new `TaskView` is instantiated, rendered, and then inserted into
the `<table>` element.

If you look at the output of the `TasksIndex`, it will appear as follows:

```rhtml
<!-- output HTML -->
<div>
  <h1>Tasks</h1>

  <table>
    <tr>
      <th>Title</th>
      <th>Completed</th>
    </tr>

    <div>
      <tr>
        <td>Task 1</td>
        <td>true</td>
      </tr>
    </div>
    <div>
      <tr>
        <td>Task 2</td>
        <td>false</td>
      </tr>
    </div>
  </table>
</div>
```

Unfortunately, we can see that there is a problem with the above rendered
view: the surrounding div around each of the rendered tasks.

Each of the rendered tasks has a surrounding div because this is the element
that each view has that is accessed via `this.el`, and what the view's content
is inserted into. By default, this element is a div and therefore every view
will be wrapped in an extra div. While sometimes this extra div doesn't really
matter, as in the outermost div that wraps the entire index, other times this
produces invalid markup.

Fortunately, Backbone provides us with a clean and simple mechanism for
changing the element to something other than a div. In the case of the
`TaskView`, we would like this element to be a tr, then the wrapping tr can be
removed from the task view template.

The element to use is specified by the `tagName` member of the `TaskView`, as
shown below:

```javascript
// app/assets/javascripts/views/task_view.js
ExampleApp.Views.TaskView = Backbone.View.extend({
  tagName: "tr",

  initialize: function() {
  },

  render: function () {
    this.$el.html(JST['tasks/view']({ model: this.model }));
    return this;
  }
});
```

Given the above `tagName` customization, the task view template will appear as
follows:

```rhtml
// app/assets/templates/tasks/view.jst.ejs
<td><%= model.escape('title') %></td>
<td><%= model.escape('completed') %></td>
```

And the resulting output of the `TasksIndex` will be much cleaner, as shown
below:

```html
<!-- output HTML -->
<div>
  <h1>Tasks</h1>

  <table>
    <tr>
      <th>Title</th>
      <th>Completed</th>
    </tr>

    <tr>
      <td>Task 1</td>
      <td>true</td>
    </tr>
    <tr>
      <td>Task 2</td>
      <td>false</td>
    </tr>
  </table>
</div>
```

We've now covered the basic building blocks of converting Rails views to
Backbone and getting a functional system. The majority of Backbone programming
you will do will likely be in the views and templates, and there is a lot more
to them: event binding, different templating strategies, helpers, event
unbinding, and more. Those topics are covered in the "Routers, Views, and
Templates" chapter.
