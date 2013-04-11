## Composite views

The `SwappingRouter` above calls `leave()` on the view it currently holds.
This function is not part of Backbone itself, and is part of our extension
library to help make views more modular and maintainable. This section goes
over the Composite View pattern, the `CompositeView` class itself, and some
concerns to keep in mind while creating your views.

### Refactoring from a large view

One of the first refactorings you'll find yourself doing in a non-trivial Backbone
app is splitting up large views into composable parts. Let's take another look
at the `TaskDetail` source code from the beginning of this section:

` app/assets/javascripts/views/task_detail.js@5bfb07a

The view class references a template, which renders out the HTML for this page:

` app/assets/templates/task_detail.jst.ejs@5bfb07a

There are clearly several concerns going on here: rendering the task, rendering
the comments that folks have left, and rendering the form to create new
comments. Let's separate those concerns. A first approach might be to just
break up the template files:

```rhtml
<!-- app/assets/templates/tasks/show.jst.ejs -->
<section class="task-details">
  <%= JST['tasks/details']({ task: task }) %>
</section>

<section class="comments">
  <%= JST['comments/list']({ task: task }) %>
</section>
```

```rhtml
<!-- app/assets/templates/tasks/details.jst.ejs -->
<input type="checkbox"<%= task.isComplete() ? ' checked="checked"' : '' %> />
<h2><%= task.escape("title") %></h2>
```

```rhtml
<!-- app/assets/templates/comments/list.jst.ejs -->
<ul>
  <% task.comments.each(function(comment) { %>
    <%= JST['comments/item']({ comment: comment }) %>
  <% } %>
</ul>

<%= JST['comments/new']() %>
```

```rhtml
<!-- app/assets/templates/comments/item.jst.ejs -->
<h4><%= comment.user.escape('name') %></h4>
<p><%= comment.escape('text') %></p>
```

```rhtml
<!-- app/assets/templates/comments/new.jst.ejs -->
<div class="form-inputs">
  <label for="new-comment-input">Add comment</label>
  <textarea id="new-comment-input" cols="30" rows="10"></textarea>
  <button>Add Comment</button>
</div>
```

But this is really only half the story. The `TaskDetail` view class still
handles multiple concerns, such as displaying the task and creating comments. Let's
split that view class up, using the `CompositeView` base class:

` app/assets/javascripts/support/composite_view.js@48f284c

Similar to the `SwappingRouter`, the `CompositeView` base class solves common
housekeeping problems by establishing a convention. See the "SwappingRouter and
Backbone internals" section for an in-depth analysis of how this subclassing
pattern works.

Now our `CompositeView` maintains an array of its immediate children as
`this.children`.  With this reference in place, a parent view's `leave()` method
can invoke `leave()` on its children, ensuring that an entire tree of composed
views is cleaned up properly.

For child views that can dismiss themselves, such as dialog boxes, children
maintain a back-reference at `this.parent`. This is used to reach up and call
`this.parent.removeChild(this)` for these self-dismissing views.

Making use of `CompositeView`, we split up the `TaskDetail` view class:

```javascript
var TaskDetail = Support.CompositeView.extend({
  tagName: 'section',
  id: 'task',

  initialize: function() {
    _.bindAll(this, "renderDetails");
    this.model.on("change", this.renderDetails);
  },

  render: function() {
    this.renderLayout();
    this.renderDetails();
    this.renderCommentsList();
  },

  renderLayout: function() {
    this.$el.html(JST['tasks/show']());
  },

  renderDetails: function() {
    var detailsMarkup = JST['tasks/details']({ task: this.model });
    this.$('.task-details').html(detailsMarkup);
  },

  renderCommentsList: function() {
    var commentsList = new CommentsList({ model: this.model });
    var commentsContainer = this.$('comments');
    this.renderChildInto(commentsList, commentsContainer);
  }
});
```

```javascript
var CommentsList = Support.CompositeView.extend({
  tagName: 'ul',

  initialize: function() {
    this.model.comments.on("add", this.renderComments);
  },

  render: function() {
    this.renderLayout();
    this.renderComments();
    this.renderCommentForm();
  },

  renderLayout: function() {
    this.$el.html(JST['comments/list']());
  },

  renderComments: function() {
    var commentsContainer = this.$('comments-list');
    commentsContainer.html('');

    this.model.comments.each(function(comment) {
      var commentMarkup = JST['comments/item']({ comment: comment });
      commentsContainer.append(commentMarkup);
    });
  },

  renderCommentForm: function() {
    var commentForm = new CommentForm({ model: this.model });
    var commentFormContainer = this.$('.new-comment-form');
    this.renderChildInto(commentForm, commentFormContainer);
  }
});
```

```javascript
var CommentForm = Support.CompositeView.extend({
  events: {
    "click button": "createComment"
  },

  initialize: function() {
    this.model = this.options.model;
  },

  render: function() {
    this.$el.html(JST['comments/new']);
  },

  createComment: function() {
    var comment = new Comment({ text: $('.new-comment-input').val() });
    this.$('.new-comment-input').val('');
    this.model.comments.create(comment);
  }
});
```

Along with this, remove the `<%= JST(...) %>` template nestings, allowing the
view classes to assemble the templates instead. In this case, each template
contains placeholder elements that are used to wrap child views:

```rhtml
<!-- app/assets/templates/tasks/show.jst.ejs -->
<section class="task-details">
</section>

<section class="comments">
</section>
```

```rhtml
<!-- app/assets/templates/tasks/details.jst.ejs -->
<input type="checkbox"<%= task.isComplete() ? ' checked="checked"' : '' %> />
<h2><%= task.escape("title") %></h2>
```

```rhtml
<!-- app/assets/templates/comments/list.jst.ejs -->
<ul class="comments-list">
</ul>

<section class="new-comment-form">
</section>
```

```rhtml
<!-- app/assets/templates/comments/item.jst.ejs -->
<h4><%= comment.user.escape('name') %></h4>
<p><%= comment.escape('text') %></p>
```

```rhtml
<!-- app/assets/templates/comments/new.jst.ejs -->
<label for="new-comment-input">Add comment</label>
<textarea class="new-comment-input" cols="30" rows="10"></textarea>
<button>Add Comment</button>
```

There are several advantages to this approach:

- Each view class has a smaller and more cohesive set of responsibilities
- The comments view code, extracted and decoupled from the task view code, can
  now be reused on other domain objects with comments
- The task view performs better, since adding new comments or updating the task
  details will only re-render the pertinent section, instead of re-rendering the
  entire composite of task and comments

In the example app, we make use of a composite view on `TasksIndex` located at
`app/assets/javascripts/views/tasks_index.js`. The situation is similar to
what has been discussed here. The view responsible for rendering the list of
children will actually render them as children. Note how the `renderTasks`
function iterates over the  collection of tasks, instantiates a `TaskItem`
view for each, renders it as a child with `renderChild`, and finally appends
it to table's body. Now, when the router cleans up the `TasksIndex` with `leave`,
it will also clean up all of its children.

### Cleaning up views properly

You've learned how leaving lingering events bound on views that are no longer
on the page can cause both UI bugs or, what's probably worse, memory leaks.
A slight flickering of the interface is annoying at best, but prolonged usage
of your "untidy" app could, in fact, make the user's browser start consuming massive
amounts of memory, potentially causing browser crashes, data loss and unhappy
users and angry developers.

We now have a full set of tools to clean up views properly. To summarize, the
big picture tools are:

- A *Swapping Router* that keeps track of the current view and tells it
to clean up before it swaps in a new view
- A *Composite View* that keeps track of its child views so it can tell them to
clean up when it is cleaning itself up

The `leave()` function ties this all together. A call to `leave()` can either
come from a `SwappingRouter` or from a parent `CompositeView`.  A `CompositeView`
will respond to `leave()` by passing that call down to its children. At each
level, in addition to propagating the call, `leave()` handles the task of
completely cleaning up after a view by removing the corresponding element from
the DOM via jQuery's `remove()` function, and removing all event bindings via a
call to `Backbone.Events.off()`. In this way a single call at the top level
cleans the slate for an entirely new view.
