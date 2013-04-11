## Mixins

Backbone provides a basic mechanism for inheritance.  Sometimes, you'll want to
build a collection of related, reusable behavior and include that in several
classes that already inherit from a Backbone base class.  In these cases,
you'll want to use a [mixin](http://en.wikipedia.org/wiki/Mixin).

Backbone includes [Backbone.Events](http://documentcloud.github.com/backbone/#Events)
as an example of a mixin.

Here, we create a mixin named `Observer` that contains behavior for binding to
events in a fashion that can be cleaned up later:

```javascript
// app/assets/javascripts/observer.js
var Observer = {
  bindTo: function(source, event, callback) {
    source.on(event, callback, this);
    this.bindings = this.bindings || [];
    this.bindings.push({ source: source, event: event, callback: callback });
  },

  unbindFromAll: function() {
    _.each(this.bindings, function(binding) {
      binding.source.off(binding.event, binding.callback);
    });
    this.bindings = [];
  }
};
```

We can mix `Observer` into a class by using Underscore.js' `_.extend` on the
prototype of that class:

```javascript
// app/assets/javascripts/views/some_collection_view.js
SomeCollectionView = Backbone.View.extend({
  initialize: function() {
    this.bindTo(this.collection, "change", this.render);
  },

  leave: function() {
    this.unbindFromAll(); // calling a method defined in the mixin
    this.remove();
  }
});

_.extend(SomeCollectionView.prototype, Observer);
```
