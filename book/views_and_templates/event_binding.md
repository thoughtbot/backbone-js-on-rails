## Event binding

A big part of writing snappy rich client applications is building models and
views that update in real-time with respect to one another. With Backbone,
you accomplish this with events.

Client-side applications are asynchronous by nature. Events binding and triggering are at the heart of a Backbone application. Your application is written
using event-driven programming where components emit and handle events,
achieving non-blocking UIs.

With Backbone, it's very easy to write such applications. Backbone provides
the `Backbone.Events` mixin, which can be included in any other class.

Here's a quick example of a very simple game engine, where things happen in the
system and an event is triggered, which in turn invokes any event handlers that
are bound to that event:

```javascript
var gameEngine = {};
_.extend(gameEngine, Backbone.Events);

gameEngine.on("user_registered", function(user) {
  user.points += 10
});

gameEngine.trigger("user_registered", User.new({ points: 0 }));
```

In the example above, `on` subscribes the gameEngine to listen for the
"user_registered" event, then `trigger` broadcasts that event to all
subscribed listeners, which invokes the function that adds points to the user.
Any arguments passed to `trigger` after the name of the event are in turn
passed to the event handler.  So in this case the output of `User.new()` is
received as `user` in the handler.

`Backbone.Views`, `Backbone.Model` and `Backbone.Collection` are all extended
with `Backbone.Events`. There are some events that are triggered by Backbone at
particularly convenient moments. These are common events to which many user interface
flows need to react.  For example, when a Backbone model's attributes are
changed, that model will trigger the `change` event. It is still up to you to
bind a handler on those events.  (More on that later.)

As you can see from the example though, it is possible to bind and trigger
arbitrary events on any object that extends `Backbone.Events`. Additionally,
if an event handler should always trigger regardless of which event is fired,
you can bind to the special `all` event.

There are three primary kinds of events that your views will bind to:

* DOM events within the view's `this.el` element
* Events triggered by closely associated objects, such as the view's model or
collection
* Events your view itself publishes

Event bindings declared on your view will need to be cleaned when your view is
disposed of. Events that your view publishes will need to be handled a
different way. Each of these three categories of events is discussed in more
detail below.

### Binding to DOM events within the view element

The primary function of a view class is to provide behavior for its markup's
DOM elements. You can attach event listeners by hand if you like:

```rhtml
<!-- app/assets/templates/soundboard.jst.ejs -->
<a class="sound">Honk</a>
<a class="sound">Beep</a>
```

```javascript
// app/assets/javascripts/views/sound_board.js
var SoundBoard = Backbone.View.extend({
  render: function() {
    $(this.el).html(JST['soundboard']());
    this.$("a.sound").bind("click", this.playSound);
  },

  playSound: function() {
    // play sound for this element
  }
});
```

But Backbone provides an easier and more declarative approach with the `events` hash:

```javascript
// app/assets/javascripts/views/sound_board.js
var SoundBoard = Backbone.View.extend({
  events: {
    "click a.sound": "playSound"
  },

  render: function() {
    this.$el.html(JST['soundboard']());
  },

  playSound: function() {
    // play sound for this element
  }
});
```

Backbone will bind the events with the
[`Backbone.View.prototype.delegateEvents()`](http://documentcloud.github.com/backbone/#View-delegateEvents)
function.  It binds DOM events with `$.on()`, whether you're using the
[jQuery](http://api.jquery.com/on/) or
[Zepto](https://github.com/madrobby/zepto/blob/v1.0/src/event.js#L181-L184)
`.on()` function.

It also takes care of binding the event handlers' `this` to the view instance
using `_.on()`.

### Events observed by your view

In almost every view you write, the view will be bound to a `Backbone.Model` or
a `Backbone.Collection`, most often with the convenience properties `this.model`
or `this.collection`.

Consider a view that displays a collection of `Task` models. It will re-render
itself when any model in the collection is changed or removed, or when a new
model is added:

` app/assets/javascripts/views/tasks_index.js@5bfb07a

Note how we bind to the collection's `change`, `add` and `remove` events.
The `add` and `remove` events are triggered when you either `add()` or `remove()`
a model from that collection as expected. The `change` event requires special
mention; it will trigger when any of the underlying models' `change` event triggers.
Backbone just bubbles up that event to the containing collection for convenience.

While the most common view bindings will be to events from its associated
models and collections, your view can bind to any events to which it wants to
listen.  The life-cycle for the binding and unbinding, and the handling of
these events will be the same as those for models and collections.

### Events your view publishes

With sufficiently complex views, you may encounter a situation where you want
one view to change in response to another. This can be accomplished with events. Your view can trigger an event to which
the other view has bindings.

Consider a simple example with a table of users and a toggle control that
filters the users to a particular gender:

```javascript
// app/assets/javascripts/views/gender_picker.js
GenderPicker = Backbone.View.extend({
  render: {
    // render template
  },
  events: {
    "click .show-male":   "showMale",
    "click .show-female": "showFemale",
    "click .show-both":   "showBoth"
  },

  showMale: function()   { this.trigger("changed", "male");   },
  showFemale: function() { this.trigger("changed", "female"); },
  showBoth: function()   { this.trigger("changed", "both");   }
});

UsersTable = Backbone.View.extend({
  initialize: function() {
    this.genderPicker = new GenderPicker();
    this.genderPicker.on("changed", this.filterByGender);
    this.collectionToRender = this.collection;
    this.render();
  },

  render: {
    this.genderPicker.render();
    this.$el.html(JST['users']({ users: this.collectionToRender }));
  }

  filterByGender: function(gender) {
    this.collectionToRender = this.collection.byGender(gender);
    this.render();
  }
});
```

In the above snippet, the `GenderPicker` is responsible for the filter
control. When the appropriate elements are clicked, a custom `changed` event
is triggered on itself. Note how it is also possible to pass arbitrary
parameters to the `trigger()` function.

On the other hand, we have a `UsersTable` which is responsible for
rendering a collection of users. It also observes this event via the call to
`on()`, where it invokes the `filterByGender` function.

While your views will generally bind to events on models and collections, a
situation like the above may arise where it is handy to trigger and bind to
custom events at the view layer. However, it's always a good idea to consider whether you should, instead, be binding to events on the underlying components.
