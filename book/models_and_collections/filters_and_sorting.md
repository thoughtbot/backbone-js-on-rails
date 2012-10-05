## Filters and sorting

When using our Backbone models and collections, it's often handy to filter the
collections by reusable criteria, or sort them by several different criteria.

## Filters

To filter a `Backbone.Collection`, as with Rails named scopes, first define
functions on your collections that filter by your criteria, using the `select`
function from Underscore.js; then, return new instances of the collection class. A
first implementation might look like this:

````javascript
var Tasks = Backbone.Collection.extend({
  model: Task,
  url: '/tasks',

  complete: function() {
    var filteredTasks = this.select(function(task) {
      return task.get('completed_at') !== null;
    });
    return new Tasks(filteredTasks);
  }
});
````

Let's refactor this a bit.  Ideally, the filter functions will reuse logic
already defined in your model class:

````javascript
var Task = Backbone.Model.extend({
  isComplete: function() {
    return this.get('completed_at') !== null;
  }
});

var Tasks = Backbone.Collection.extend({
  model: Task,
  url: '/tasks',

  complete: function() {
    var filteredTasks = this.select(function(task) {
      return task.isComplete();
    });
    return new Tasks(filteredTasks);
  }
});
````

Going further, notice that there are actually two concerns in this function.
The first is the notion of filtering the collection, and the second is the
specific filtering criteria (`task.isComplete()`).

Let's separate the two concerns here, and extract a `filtered` function:

````javascript
var Task = Backbone.Model.extend({
  isComplete: function() {
    return this.get('completed_at') !== null;
  }
});

var Tasks = Backbone.Collection.extend({
  model: Task,
  url: '/tasks',

  complete: function() {
    return this.filtered(function(task) {
      return task.isComplete();
    });
  },

  filtered: function(criteriaFunction) {
    return new Tasks(this.select(criteriaFunction));
  }
});
````

We can extract this function into a reusable mixin, abstracting the `Tasks`
collection class using `this.constructor`:

````javascript
var FilterableCollectionMixin = {
  filtered: function(criteriaFunction) {
    return new this.constructor(this.select(criteriaFunction));
  }
};

var Task = Backbone.Model.extend({
  isComplete: function() {
    return this.get('completed_at') !== null;
  }
});

var Tasks = Backbone.Collection.extend({
  model: Task,
  url: '/tasks',

  complete: function() {
    return this.filtered(function(task) {
      return task.isComplete();
    });
  }
});

_.extend(Tasks.prototype, FilterableCollectionMixin);
````

## Propagating collection changes

The `FilterableCollectionMixin`, as we've written it, will produce a filtered
collection that does not update when the original collection is changed.

A naive approach is to bind to the change, add, and remove events on the source
collection, reapply the filter function, and repopulate the filtered
collection:

````javascript
var FilterableCollectionMixin = {
  filtered: function(criteriaFunction) {
    var sourceCollection = this;
    var filteredCollection = new this.constructor;

    var applyFilter = function() {
      filteredCollection.reset(sourceCollection.select(criteriaFunction));
    };

    this.bind("change", applyFilter);
    this.bind("add",    applyFilter);
    this.bind("remove", applyFilter);

    applyFilter();

    return filteredCollection;
  }
};
````

While this correctly updates the filtered collection when the base collection
or one of its models is changed, this will always trigger a `reset` event
on the filtered collection, rather than the appropriate event.

A full `FilteredCollectionMixin`, along with specs for its event triggering in
various states, is included in the `example_app` under
`app/assets/javascripts/filterable_collection_mixin.js` and
`spec/javascripts/filterable_collection_mixin_spec.js`.

### A note on event bindings and reference leaks

The general approach of duplicating a collection to filter or sort it is handy,
but there is a piece of bookkeeping that you have to keep in mind.  Consider a
filterable results interface that renders a collection, and assume that the view
uses this derivative collection approach to filtering.

The view accepts a base collection and then maintains a filtered version of that
collection, which it renders from.

````javascript
var FilterableResultsView = Support.CompositeView.extend({
  events: {
    "click button.filter": applyFilter,
  },

  initialize: function(options) {
    this.baseCollection = options.collection;
    this.filteredCollection = this.baseCollection;
  },

  applyFilter: function() {
    var filterFunction = this.computeFilterFunction(); // filtering logic goes here
    this.filteredCollection = this.baseCollection.filtered(filterFunction);
    this.render();
  },

  render: function() {
    // render from this.filteredCollection
  },

  // ...
});
````

There is a leak in FilterableMixinCollection, as we have it now, which is
exposed by this usage pattern.  The contructor-local functions `addToFiltered`,
`removeFromFiltered`, and `changeFiltered` close over the `filteredCollection`
reference inside `FilterableCollectionMixin#filtered`.  Those functions are
also bound as event handlers on the `baseCollection`, which means a reference
chain is maintained from the base collection, through its event handlers, to
those functions, to the filtered collection.

Unless these event handlers are unbound, the filtered collection will never be
eligible for garbage collection.  If the user re-filters the view many times,
which is particularly likely in a long-lived client-side application, this
leakage can grow quite large.  Additionally, the chain of references extending
from the filtered collections may grow quite large themselves.

Unfortunately, a filtered collection is not aware of when you are finished
using it, so we must expose the cleanup concern as something for the view to
handle.  See the `teardown` function in `FilterableCollectionMixin`, which
unbinds these event handlers, allowing the filtered collection to be
correctly garbage collected.

You can think of this in a similar way to how the `SwappingRouter` tracks
its current view, disposing of the old view before swapping in the new one.


````javascript
var FilterableResultsView = Support.CompositeView.extend({
  initialize: function(options) {
    this.baseCollection = options.collection;

    // If we just assign filteredCollection to baseCollection, either:
    //
    // 1. baseCollection does not have #teardown, so calling it blows up.
    // 2. baseCollection does have #teardown, and we tear it down while filtering,
    //    breaking the chain from its parent.  Oops.
    //
    // So, produce a filtered copy that initially contains all member elements.
    this.filteredCollection = this.baseCollection.filtered(function() { return true; });
  },

  applyFilter: function() {
    var filterFunction = this.computeFilterFunction(); // filtering logic goes here
    this.filteredFunction.teardown();
    this.filteredCollection = this.baseCollection.filtered(filterFunction);
    this.render();
  },

  // ...
});
````

## Sorting

The simplest way to sort a `Backbone.Collection` is to define a `comparator`
function.  This functionality is built in:

````javascript
var Tasks = Backbone.Collection.extend({
  model: Task,
  url: '/tasks',

  comparator: function(task) {
    return task.dueDate;
  }
});
````

If you'd like to provide more than one sort order on your collection, you can
use an approach similar to the `filtered` function above, and return a new
`Backbone.Collection` whose `comparator` is overridden.  Call `sort` to update
the ordering on the new collection:

````javascript
var Tasks = Backbone.Collection.extend({
  model: Task,
  url: '/tasks',

  comparator: function(task) {
    return task.dueDate;
  },

  byCreatedAt: function() {
    var sortedCollection = new Tasks(this.models);
    sortedCollection.comparator = function(task) {
      return task.createdAt;
    };
    sortedCollection.sort();
    return sortedCollection;
  }
});
````

Similarly, you can extract the reusable concern to another function:

````javascript
var Tasks = Backbone.Collection.extend({
  model: Task,
  url: '/tasks',

  comparator: function(task) {
    return task.dueDate;
  },

  byCreatedAt: function() {
    return this.sortedBy(function(task) {
      return task.createdAt;
    });
  },

  byCompletedAt: function() {
    return this.sortedBy(function(task) {
      return task.completedAt;
    });
  },

  sortedBy: function(comparator) {
    var sortedCollection = new Tasks(this.models);
    sortedCollection.comparator = comparator;
    sortedCollection.sort();
    return sortedCollection;
  }
});
````

...And then into another reusable mixin:

````javascript
var SortableCollectionMixin = {
  sortedBy: function(comparator) {
    var sortedCollection = new this.constructor(this.models);
    sortedCollection.comparator = comparator;
    sortedCollection.sort();
    return sortedCollection;
  }
};

var Tasks = Backbone.Collection.extend({
  model: Task,
  url: '/tasks',

  comparator: function(task) {
    return task.dueDate;
  },

  byCreatedAt: function() {
    return this.sortedBy(function(task) {
      return task.createdAt;
    });
  },

  byCompletedAt: function() {
    return this.sortedBy(function(task) {
      return task.completedAt;
    });
  }
});

_.extend(Tasks.prototype, SortableCollectionMixin);
````

Just as with the `FilterableCollectionMixin` before, the
`SortableCollectionMixin` should observe its source if updates are to propagate
from one collection to another:

````javascript
var SortableCollectionMixin = {
  sortedBy: function(comparator) {
    var sourceCollection = this;
    var sortedCollection = new this.constructor;
    sortedCollection.comparator = comparator;

    var applySort = function() {
      sortedCollection.reset(sourceCollection.models);
      sortedCollection.sort();
    };

    this.on("change", applySort);
    this.on("add",    applySort);
    this.on("remove", applySort);

    applySort();

    return sortedCollection;
  }
};
````

It is left as an excerise for the reader to update `SortableCollectionMixin`
to trigger the correct change/add/remove events as in the improved
`FilterableCollectionMixin` above.
