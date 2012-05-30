## Backbone and MVC

Model–View–Controller (MVC) is a software architectural pattern used in many
applications to isolate domain or business logic (the application logic for the user)
from the user interface (input and presentation).

![Model-View-Controller concept](images/MVCDiagram.png)

In the above diagram, a solid line represents a direct association and a dashed
line represents an indirect association, such as one mediated by an observer.

As a user of Rails, you're likely already familiar with the concept of MVC and
the benefits that the separation of concerns can provide. However, Rails
itself is, technically, not traditional MVC, but a pattern called
[Model2](http://en.wikipedia.org/wiki/Model2). A traditional MVC is event-based,
and views are bound directly to models as observers, updating themselves when
the model changes.

Given that Javascript has events, and that much of the interactions between the
different components of Backbone in the browser are not limited to
request/response, Backbone can be structured as an actual MVC architecture.

That said, technically speaking, Backbone is _not_ MVC, and Backbone
acknowledged this when it renamed "Controllers" to "Routers" in version 0.5.0.

What is Backbone then, if not MVC?  Classically, views handled the presentation
of information, and controllers would take the user input and decide what
to do with it.  In Backbone, these two concerns are merged into view classes,
which are responsible for presentation as well as both establishing and responding
to UI event bindings.

## What goes where

Part of the initial learning curve of Backbone can be figuring out what goes
where, and mapping it to expectations set by working with Rails.  In Rails
we have Models, Views, Controllers, and Routers.  In Backbone, we have
Models, Collections, Views, Templates, and Routers.

It's important to note that, although Rails and Backbone share several concept
names, several of which have significant overlap, you shouldn't try to map your
understanding of one directly onto the other.  That said, it's valuable to draw
similarities to help ease the learning curve.

The models in Backbone and Rails are fairly analogous - each represent
objects in your domain, and both mix the concerns of domain logic with
persistence.  In Rails, the persistence is usually made to a database, and in 
Backbone.js it's generally made to a remote HTTP JSON API.

Backbone collections are just ordered sets of models.  Because it lacks
controllers, Backbone routers and views work together to pick up the
functionality provided by Rails controllers. Finally, in Rails, when we say
"views," we actually mean "templates," as Rails does not provide for view classes
out of the box.  In Backbone, however, you have a separation between the
view class and the HTML templates that they use.

Once you introduce Backbone into your application, you grow the layers in your
stack by four levels. This can be daunting at first, and frankly, at times it
can be difficult to keep straight everything that's going on in your application.
Ultimately, though, the additional organization and functionality of Backbone
outweighs the costs - let's break it down.

| Rails      |
|------------|
| Model      |
| Controller |
| View       |

| Backbone             |
|----------------------|
| Model and Collection |
| Router               |
| View                 |
| Template             |

In a typical Rails and Backbone application, the initial interaction between
the layers will be as follows:

- A request from a user comes in; the **Rails router** identifies what should
  handle the request, based on the URL
- The **Rails controller action** to handle the request is called; some initial
  processing may be performed
- The **Rails view template** is rendered and returned to the user's browser
- The **Rails view template** will include **Backbone initialization**; usually
  this is populating some *Backbone collections* as sets of **Backbone models**
  with JSON data provided by the **Rails view**
- The **Backbone router** determines which of its methods should handle the
  display, based on the URL
- The **Backbone router** calls that method; some initial processing
  may be performed, and one or more **Backbone views** are rendered
- The **Backbone view** reads **templates** and uses **Backbone** models to
  render itself onto the page

At this point, the user will see your application in their browser and be able to
interact with it.  The user interacting with elements on the page will trigger
actions to be taken at any level of the above sequence: **Backbone model**,
**Backbone views**, **Backbone routers**, or requests to the remote server.

Requests to the remote server may be any one of the following:

- Normal requests that don't hit Backbone and trigger a full page reload
- Normal Ajax requests, not using Backbone at all
- Ajax requests from the **Backbone model** or **Backbone collection**,
  communicating with Rails via JSON

Generally speaking, by introducing Backbone into our application we'll reduce
the first two types of requests, moving the bulk of client/server interaction
to requests encapsulated inside domain objects like Backbone models.
