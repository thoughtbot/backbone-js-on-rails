## View explanation

A Backbone view is a class that is responsible for rendering the display of
a logical element on the page. A view can also bind to events which may cause
it to be re-rendered.

Again, it's important to note that a Rails view is not directly analogous to a
Backbone view. A Rails view is more like a Backbone _template_, and
Backbone views are often more like Rails _controllers_, in that they are
responsible for deciding what should be rendered and how, and for rendering the
actual template file. This can cause confusion with developers just starting
with Backbone.

A basic Backbone view appears as follows.

```javascript
// app/assets/javascripts/views/example_view.js
ExampleApp.Views.ExampleView = Backbone.View.extend({
  tagName: "li",
  className: "example",
  id: "example_view",

  events: {
    "click a.save": "save"
  },

  render: function() {
    this.$el.html(JST['example/view']({ model: this.model }));
    return this;
  },

  save: function() {
    // do something
  }
};
```

### Initialization

Backbone views could also include an `initialize` function which will
be called when the view is instantiated.

You only need to specify the initialize function if you wish to do something
custom. For example, some views call the `render()` function upon
instantiation. It's not necessary to immediately render that way,
but it's relatively common to do so.

You create a new view by instantiating it with `new`. For example, `new
ExampleView()`. It is possible to pass in a hash of options with `new
ExampleView(options)`. Any options you pass into the constructor will be
available as `this.options` from inside of the view.

There are a few special options that, when passed, will be assigned as
properties of view. These are `model`, `collection`, `el`, `id`,
`className`, and `tagName`. For example, if you create a new view and give it
a model option using `new ExampleView({ model: someTask })`, then
`someTask` will be available as `this.model` from inside of the view.

### The View's element

Each Backbone view has an element which it stores in `this.el`. This element
can be populated with content, but isn't on the page until placed there by
you. Using this strategy it is then possible to render views outside of the
current DOM at any time, and then later, in your code, insert the new elements all
at once. In this way, high performance rendering of views can be achieved with as
few reflows and repaints as possible.

A jQuery or Zepto object of the view's element is available in `this.$el`.
This is useful, in that you don't need to repeatedly call `$(this.el)`. This jQuery
or Zepto call is also cached, so it should be a performance improvement over
repeatedly calling `$(this.el)`.

It is possible to create a view that references an element already in the DOM,
instead of a new element. To do this, pass in the existing element as an
option to the view constructor with `new ExampleView({ el: existingElement })`.

You can also set this after the fact with the `setElement()` function:

```javascript
var view = new ExampleView();
view.setElement(existingElement);
```

### Customizing the View's Element

You can use `tagName`, `className`, and `id` to customize the new element
created for the view. If no customization is done, the element is an empty
`div`.

`tagName`, `className`, and `id` can either be specified directly on the view
or passed in as options at instantiation. Since `id` will usually correspond
to the `id` of each model, it will likely be passed in as an option rather
than declared statically in the view.

`tagName` will change the element that is created from a `div` to something
else that you specify. For example, setting `tagName: "li"` will result in the
view's element being an `li` rather than a `div`.

`className` will add an additional class to the element that is created for
the view. For example, setting `className: "example"` in the view will result
in that view's element having that additional class like `<div class="example">`.

In addition, as of Backbone 0.9.9, `className`, `tagName`, and `id` can now
be defined as functions to allow them to be determined at runtime. An example
use case for this would be defining the `id` of a view based on its model:

````javascript
ExampleApp.Views.TaskItem = Support.CompositeView.extend({
  tagName: "tr",

  id: function() {
    return "task_" + this.model.id;
  },
````

Note that this dynamic definition is only used when creating the views `el`,
and will not be invoked if `el` is passed in when creating the view, or during
subsequent calls to render.

### Rendering

The `render` function above renders the `example/view` template. Template
rendering is covered in depth in the "Templating strategy" chapter. Suffice to
say, nearly every view's render function will render some form of template. Once
that template is rendered, other actions to modify the view may be taken.

In addition to rendering a template, typical responsibilities of the `render` function
could include adding more classes or attributes to `this.el`, or firing or
binding other events.

Backbone, when used with jQuery (or Zepto) provides a convenience function
of `this.$` that can be used for selecting elements inside of the view.
`this.$(selector)` is equivalent to the jQuery function call `$(selector,
this.el)`

A nice convention of the render function is to return `this` at the end of
render to enable chained calls on the view - usually fetching the element.
For example:

```javascript
// app/assets/javascripts/views/some_view.js
render: function() {
  this.$el.html(this.childView.render().el);
  return this;
}
```

### Events

The view's `events` hash specifies a mapping of the events and elements that
should have events bound, and the functions that should be bound to those
events. In the example above, the `click` event is being bound to the
element(s) that match the selector `a.save` within the view's element. When
that event fires, the `save` function will be called on the view.

When event bindings are declared with the `events` hash, the DOM events are bound
with the `$.delegate()` function. Backbone also takes care of binding the
event handlers' `this` to the view instance using `_.on()`.

Event binding is covered in great detail in the "Event binding" chapter.
