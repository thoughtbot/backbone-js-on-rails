## Namespacing your application

You will want to create an object in JavaScript in which your Backbone
application will reside. This variable will serve as a namespace for your
Backbone application. Namespacing all of the JavaScript is desirable to
avoid potential collisions in naming. For example, it's possible that a
JavaScript library you want to use might also create a task variable. If you
haven't namespaced your task model, this would conflict.

This variable includes a place to hold models, collections, views, and routes,
and an `initialize` function which will be called to initialize the application.

Typically, initializing your application will involve creating a router and
starting Backbone history to route the initial URL fragment.  This app variable
will look like the following:

```javascript
// app/assets/javascripts/example_app.js
var ExampleApp = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function() {
    new ExampleApp.Routers.Tasks();
    Backbone.history.start();
  }
};
```

You can find a more fully fleshed-out version of this file in the example app
in `app/assets/javascripts/example_app.js`.
