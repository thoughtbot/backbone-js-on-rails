## Dependency choice

Backbone defines a `$` variable that defers to jQuery if present.

If you are only targeting mobile platforms, Backbone can also use
[Zepto](http://zeptojs.com), a more lightweight dependency.  Zepto is "a
minimalist JavaScript framework for mobile WebKit browsers, with a
jQuery-compatible syntax."  From `backbone.js`:

```javascript
(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object.
  var root = this;

  // For Backbone's purposes, jQuery or Zepto owns the `$` variable.
  var $ = root.jQuery || root.Zepto;

  // ...

}).call(this);
```
