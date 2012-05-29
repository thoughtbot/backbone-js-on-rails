## Alternatives to Backbone

Web applications are pushing an increasing amount of responsibility to the client.
The user experience can be quite enjoyable, but deeply nesting callbacks and
relying on the DOM for app state are not.  Fortunately, there is a host of new JavaScript
client-side frameworks blossoming, and you have no shortage of options.

Knockout and Angular support declarative view-bindings and the Model-View-View
Model (MVVM) pattern.  Cappuccino and SproutCore deliver a rich library of UI
controls for building desktop-like applications.  JavaScriptMVC provides quite
a bit of structure, including dependency management and build tools.  Spine is
perhaps the most similar to Backbone, but takes an opinionated stance to
emphasize completely asynchronous client-server interactions for a faster user
experience.  Ember, originally a SproutCore rewrite, provides a host of
conventions including two-way bindings, computed properties, and auto-updating
templates.

Backbone favors a pared-down and flexible approach.  The code you write ends up
feeling very much like plain JavaScript.  Although you will need to write some
of your own conventions, Backbone is built to be easy to change: the source is
small, well annotated, and modularly designed.  It is small and flexible enough
to smoothly introduce into an existing application, but provides
enough convention and structure to help you organize your JavaScript.  Additionally, a
growing community of users brings with it a rich ecosystem of plugins, blog
articles, and support.
