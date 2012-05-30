## Cleaning up: unbinding

In the last section, we discussed three different kinds of event binding in
your `Backbone.Views` classes: DOM events, model/collection events, and custom
view events.  Next, we'll discuss unbinding these events: why it's a good idea,
and how to do it.

### Why unbind events?

Consider two views in a todo app: an index view, which contains all the tasks
that need to be done:

![Tasks index view](images/tasks-index.png)

...and a detail view that shows detail on one task:

![Tasks detail view](images/task-detail.png)

The interface switches between the two views.

Here's the source for the aggregate index view:

<<(tasks_index_view_class.js)

...and the source for the individual task detail view:

<<(task_detail_view_class.js)

Each task on the index page links to the detail view for itself. When a user
follows one of these links and navigates from the index page to the detail
page, then interacts with the detail view to change a model, the `change` event
on the `TaskApp.tasks` collection is fired. One consequence of this is that
the index view, which is still bound and observing the `change` event, will
re-render itself.

This is both a functional bug and a memory leak: not only will the index view
re-render and disrupt the detail display momentarily, but navigating back and
forth between the views without disposing of the previous view will keep
creating more views and binding more events on the associated models or
collections.

These can be extremely tricky to track down on a production application,
especially if you are nesting child views. Sadly, there's no "garbage
collection" for views in Backbone, so your application needs to manage this
itself.  Luckily, it's not too hard to keep track of and correctly maintain your
bindings.

Let's take a look at how to unbind three kinds of events: DOM events, model
and collection events, and events you trigger in your views.

### Unbinding DOM events

DOM events are the simplest case - they more or less get cleaned up for you.
When you call `this.remove()` in your view, it delegates to `jQuery.remove()`
by invoking `$(this.el).remove()`.  This means that jQuery takes care of
cleaning up any events bound on DOM elements within your view, regardless of
whether you bound them with the Backbone `events` hash or by hand; for example,
with `$.bind()`, `$.delegate()`, `live()` or `$.on()`.

### Unbinding model and collection events

If your view binds to events on a model or collection with `on()`, you are
responsible for unbinding these events.  You do this with a simple call to
`this.model.off()` or `this.collection.off()`; the
http://documentcloud.github.com/backbone/#Events-off[`Backbone.Events.off()`
function] removes all callbacks on that object.

When should you unbind these handlers?  Whenever the view is going away.  This
means that any pieces of code that create new instances of this view become
responsible for cleaning up after it's gone. That isn't a very cohesive
approach, so it's best to include the cleanup responsibility on the view itself.

To do this, you'll write a `leave()` function on your view that wraps `remove()` and handles
any additional event unbinding that's needed.  As a convention, when you use
this view elsewhere, you'll call `leave()` instead of `remove()` when you're
done:

````javascript
var SomeCollectionView = Backbone.View.extend({
  // snip...

  initialize: function() {
    this.collection.bind("change", this.render);
  },

  leave: function() {
    this.collection.unbind("change", this.render);
    this.remove();
  }

  // snip...
});
````

### Keep track of `on()` calls to unbind more easily

In the example above, unbinding the collection change event isn't too much
hassle; since we're only observing one thing, we only have to unbind one
thing.  But even the addition of one line to `leave()` is easy to forget, and
if you bind to multiple events, it only gets more verbose.

Let's add a step of indirection in event binding, so that we can automatically
clean up all the events with one call.  We'll add and use a `bindTo()`
function that keeps track of all the event handlers we bind, and then issue a
single call to `unbindFromAll()` to unbind them:

````javascript
var SomeCollectionView = Backbone.View.extend({
  initialize: function() {
    this.bindings = [];
    this.bindTo(this.collection, "change", this.render);
  },

  leave: function() {
    this.unbindFromAll();
    this.remove();
  },

  bindTo: function(source, event, callback) {
    source.on(event, callback, this);
    this.bindings.push({ source: source, event: event, callback: callback });
  },

  unbindFromAll: function() {
    _.each(this.bindings, function(binding) {
      binding.source.off(binding.event, binding.callback);
    });
    this.bindings = [];
  }
});
````

These functions, `bindTo()` and `unbindFromAll()`, can be extracted into a
reusable mixin or superclass.  Then, we just have to use `bindTo()` instead of
`model.on()` and be assured that the handlers will be cleaned up during
`leave()`.

### Unbinding view-triggered events

With the first two kinds of event binding that we discussed, DOM and
model/collection, the view is the observer.  The responsibility to clean up is
on the observer, and here the responsibility consists of unbinding the event
handler when the view is being removed.

But other times, our view classes will trigger (emit) events of their own.  In
this case, other objects are the observers, and are responsible for cleaning up
the event binding when they are disposed.  See "Events your view publishes" in
the earlier "Event binding" section for more details.

Finally, when the view itself is disposed of with `leave()`, it
should clean up any event handlers bound on *itself* for events that it
triggers.

This is handled by invoking `Backbone.Events.off()`:

````javascript
var FilteringView = Backbone.View.extend({
  // snip...

  events: {
    "click a.filter": "changeFilter"
  },

  changeFilter: function() {
    if (someLogic()) {
      this.trigger("filtered", { some: options });
    }
  },

  leave: function() {
    this.off(); // Clean up any event handlers bound on this view
    this.remove();
  }

  // snip...
});
````

### Establish a convention for consistent and correct unbinding

There's no built-in garbage collection for Backbone's event bindings, and
forgetting to unbind can cause bugs and memory leaks. The solution is to make
sure you unbind events and remove views when you leave them. Our approach to
this is two-fold: write a set of reusable functions that manage cleaning up a
view's bindings, and use these functions wherever views are instantiated - in
`Router` instances, and in composite views.  We'll take a look at these
concrete, reusable approaches in the next two sections about `SwappingRouter`
and `CompositeView`.
