## Using Rails URL helpers from Backbone

Often times you will have part of your application written in Rails, and part
in Backbone.  Maybe you are converting an existing Rails app to Backbone
piecewise, or maybe there are portions of your app that just make more sense as
normal HTTP page requests.  Either way, you may eventually find that you want
to link to a Rails URL from a Backbone view or template.

Let's imagine that you are converting the tasks application from a typical
Rails app into the Backbone app we are working on.  Say there is a page
that displays the history for a task, and it is not yet converted to Backbone,
but you want to link to it from the Backbone templates.

Let's say that the task history is visible at a URL of `/tasks/:id/history`.
We will add this link as a fourth column in the template:

```rhtml
<!-- app/assets/templates/tasks/item.jst.ejs -->
<td><label>Task title</label><a class="task-link" href="#">details</a></td>
<td class="assignees">(Unassigned)</td>
<td><input type="checkbox"></td>
<td class="history">
  <a href="#">Task History</a>
</td>
```

and populate it from the view:

```javascript
// app/assets/javascripts/views/task_item.js

ExampleApp.Views.TaskItem = Support.CompositeView.extend({
  // ...
  renderFormContents: function() {
    // Existing code
    this.$('label').attr("for", "task_completed_" + this.model.get('id'));
    this.$('label').html(this.model.escape('title'));
    this.$('input').attr("id", "task_completed_" + this.model.get('id'));
    this.$('input').prop("checked", this.model.isComplete());
    this.$('td.assignees').html(this.model.assignedUsers.pluck('email').join(", "));
    this.$('a').attr("href", this.taskUrl());

    // New code
    this.$('td.history a').attr("href", "/tasks/" + this.model.get('id') + "/history");
  },
  // ...
});
```

Now, the way we have constructed the URL in `renderFormContents` works, but it
is fragile; it would break quietly if we changed the Rails routing structure.
While an integration test would catch such a regression, this way of linking
also unnecessarily duplicates the knowledge of how the URL is constructed.

A library named [JsRoutes](https://github.com/railsware/js-routes/) will automatically
build JavaScript functions that correspond to the Rails path helper functions
available for your Rails routes.

Install the `js-routes` gem into your application, include the `js-routes`
JavaScript via the asset pipeline, and you will have a global `Routes` object
available in JavaScript that provides JavaScript functions similar to the Rails
path helper methods.  Let's replace our manual URL construction with one of
these helpers:

```javascript
// app/assets/javascripts/views/task_item.js
renderFormContents: function() {
  // ...(existing code)...

  // Old history link:
  // this.$('td.history a').attr("href", "/tasks/" + this.model.get('id') + "/history");

  // New history link:
  this.$('td.history a').attr("href", Routes.task_history_path(this.model));
}
```

Since the `Routes` object is global, you can invoke these route helpers directly from
templates as well:

```rhtml
<!-- app/assets/templates/tasks/item.jst.ejs -->
<td><label>Task title</label><a class="task-link" href="#">details</a></td>
<td class="assignees">(Unassigned)</td>
<td><input type="checkbox"></td>
<td class="history">
  <a href="<%= Routes.task_history_path(this.task) %>">Task History</a>
</td>
```

If you are using a templating library like
[Handlebars.js](http://handlebarsjs.com/) that supports helper functions, you
could include the Routes object's helper functions into your view context
directly to eliminate the need to prefix the calls with `Routes.`:

```javascript
// somewhere at initialization time, assuming you are using Handlebars.js:
_.each(Routes, function(helper, name) {
  Handlebars.registerHelper(name, helper);
});
```
