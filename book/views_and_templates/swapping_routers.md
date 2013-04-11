## Swapping router

When switching from one view to another, we should clean up the previous view.
Earlier, we discussed a convention of writing a `view.leave()`. Let's augment our view to include the ability to clean itself up by "leaving" the DOM:

```javascript
// app/assets/javascripts/views/my_view.js
var MyView = Backbone.View.extend({
  // ...

  leave: function() {
    this.off();
    this.remove();
  },

  // ...
});
```

The `off()` and `remove()` functions are provided by `Backbone.Events` and
`Backbone.View` respectively. `Backbone.Events.off()` will remove all
callbacks registered on the view, and `remove()` will remove the view's
element from the DOM, equivalent to calling `this.$el.remove()`. In addition,
`remove()` will also call `stopListening()` on the view to clean up any event
callbacks defined using `listenTo`.

In simple cases, we replace one full page view with another full page (less any
shared layout). We introduce a convention that all actions underneath one
`Router` share the same root element, and define it as `el` on the router.

Now, a `SwappingRouter` can take advantage of the `leave()` function, and clean
up any existing views before swapping to a new one.  It swaps into a new view by
rendering that view into its own `el`:

` app/assets/javascripts/support/swapping_router.js@48f284c

Now all you need to do in a route function is call `swap()`, passing in the
new view that should be rendered. The `swap()` function's job is to call
`leave()` on the current view, render the new view appending it to the
router's `el`, and, finally, store what view is the current view, so that the
next time `swap()` is invoked, it can be properly cleaned up as well.

### SwappingRouter and Backbone internals

If the code for `SwappingRouter` seems a little confusing, don't fret: it is,
thanks to JavaScript's object model! Sadly, it's not as simple to just drop
the `swap` method into `Backbone.Router`, or call `Backbone.Router.extend` to
mixin the function we need.

Our goal here is essentially to create a subclass of `Backbone.Router`, and to
extend it without modifying the original class. This gives us a few benefits:
first, `SwappingRouter` should work with Backbone upgrades. Second, it should be
_obvious_ and _intention-revealing_ when a controller needs to swap views. If
we simply mixed in a `swap` method and called it from a direct descendant
of `Backbone.Router`, an unaware (and unlucky) programmer would need to go on a
deep source dive in an attempt to figure out where that was coming from. With a subclass, the hunt can start at the file where it was defined.

The procedure used to create `SwappingRouter` is onerous, thanks to a mix of
Backbone-isms and just how clunky inheritance is in JavaScript. Firstly, we
need to define the constructor, which delegates to the `Backbone.Router`
constructor with the use of `Function#apply`. The next block of code uses
Underscore.js' `Object#extend` to create the set of functions and properties that
will become `SwappingRouter`. The `extend` function takes a destination - in
this case, the empty prototype for `SwappingRouter` - and copies the properties
into the `Backbone.Router` prototype along with our new custom object that
includes the `swap` function.

Finally, the subclass cake is topped off with some Backbone frosting, by setting
`extend`, which is a self-propagating function that all Backbone public classes
use. Let's take a quick look at this function, as seen in Backbone 0.5.3:

```javascript
var extend = function (protoProps, classProps) {
  var child = inherits(this, protoProps, classProps);
  child.extend = this.extend;
  return child;
};

// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
var inherits = function(parent, protoProps, staticProps) {
  // sparing our readers the internals of this function... for a deep dive
  // into the dark realms of JavaScript's prototype system, read the source!
}
```

This is a function that calls `inherits` to make a new subclass.  The comments
reference `goog.inherits` from Google's Closure Library, which contains similar
utility functions to allow more class-style inheritance.

The end result here is that whenever you make a custom controller internally
in Backbone, you're making *another* subclass. The inheritance chain for
`TasksRouter` would then look like:

![Router class inheritance](images/router-diagram.png)

Phew! Hopefully this adventure into Backbone and JavaScript internals has
taught you that although it entails learning and employing more code, it can (and should) save time down the road for those maintaining your code.

You can find an example of a `SwappingRouter` on the example app under
`app/assets/javascripts/routers/tasks.js`. Note how each action
in that router uses `SwappingRouter.swap()` to invoke rendering of views,
freeing itself from the complexities of cleaning them up.
