## The shift to client-side web applications

Modern web applications have become increasingly rich, shifting their complexity onto
the client side.  While there are very well-understood approaches embodied in
mature frameworks to organize server-side code, frameworks for organizing your
client-side code are newer and generally still emerging.  Backbone is one such
library that provides a set of structures to help you organize your JavaScript
code.

Libraries like jQuery have done a great deal to help abstract inconsistencies
across browsers and provide a high-level API for making AJAX requests and
performing DOM manipulation, but larger and richer client-side applications that
lack decoupled and modular organizational structures often fall victim to the same 
few kinds of technical debt.

These apps are often highly asynchronous and the "path of least resistance"
implementation is often to have deeply nested callbacks to describe asynchronous
behavior, with nested Ajax calls and success/failure conditional concerns
going several layers deep.

Rich client-side applications almost always involve a layer of state and
logic on the client side.  One way to implement this is to store domain
objects or business logic state in the DOM.  However, storing state in the DOM,
stashing your application's data in hidden `<div>` elements
that you clone, graft, and toggle into and out of view, or reading and writing
to lengthy sets of HTML `data-*` attributes can quickly get cumbersome and confusing.

A third common feature in rich client-side apps is the presentation of multiple views on
a single domain object.  Consider a web conferencing application with multiple
views on the members of your contact list - each contact is rendered in brief
inside a list view, and in more specificity in a detail view.  Additionally,
your conference call history includes information about the people who
participated.  Each time an individual contact's information changes, this
information needs to cascade to all the view representations.

This often leads to a tight coupling of persistence and presentation: invoking
`$.ajax` to save a user's update and then updating several specific DOM elements
upon success.

By separating business logic, persistence, and presentation concerns, and
providing a decoupled, event-driven way to cascade changes through a system of
observers, each module of code is more well-encapsulated and expresses a
cohesive set of responsibilities without being coupled to outside concerns.
Your application code becomes easier to test, modify, and extend, and you
can better manage its complexity while its feature set grows.

Granted, you can thoughtfully organize your code in a clean, coherent manner
without using an external library.  However, using a library like Backbone helps you
get started more quickly, reduces the number of decisions to make, and provides
a common vocabulary for your team members or open source contributors.

If you're coming from a Rails background, you understand that a large part of Rails'
value is expressing and implementing highly-opinionated conventions that guide
development decisions.  Backbone doesn't do this.  Instead of trying to serve
as "the one way," or an opinionated framework like Rails, Backbone provides a
set of structures that help you organize your application by building your own
framework with its own set of conventions.
