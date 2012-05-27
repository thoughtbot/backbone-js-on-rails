### Filters and sorting

When using our Backbone models and collections, it's often handy to filter the
collections by reusable criteria, or sort them by several different criteria.

#### Filters

To filter a `Backbone.Collection`, as with Rails named scopes, first define
functions on your collections that filter by your criteria, using the `select`
function from Underscore.js; then, return new instances of the collection class. A
first implementation might look like this:

~~~~javascript
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
~~~~

Let's refactor this a bit.  Ideally, the filter functions will reuse logic
already defined in your model class:

~~~~javascript
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
~~~~

Going further, notice that there are actually two concerns in this function.
The first is the notion of filtering the collection, and the second is the
specific filtering criteria (`task.isComplete()`).

Let's separate the two concerns here, and extract a `filtered` function:

~~~~javascript
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
~~~~

We can extract this function into a reusable mixin, abstracting the `Tasks`
collection class using `this.constructor`:

~~~~javascript
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
~~~~

#### Propagating collection changes

The `FilterableCollectionMixin`, as we've written it, will produce a filtered
collection that does not update when the original collection is changed.  To do
so, bind to the change, add, and remove events on the source collection,
reapply the filter function, and repopulate the filtered collection:

~~~~javascript
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
~~~~

#### Sorting

The simplest way to sort a `Backbone.Collection` is to define a `comparator`
function.  This functionality is built in:

~~~~javascript
var Tasks = Backbone.Collection.extend({
  model: Task,
  url: '/tasks',

  comparator: function(task) {
    return task.dueDate;
  }
});
~~~~

If you'd like to provide more than one sort order on your collection, you can
use an approach similar to the `filtered` function above, and return a new
`Backbone.Collection` whose `comparator` is overridden.  Call `sort` to update
the ordering on the new collection:

~~~~javascript
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
~~~~

Similarly, you can extract the reusable concern to another function:

~~~~javascript
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
~~~~

...And then into another reusable mixin:

~~~~javascript
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
~~~~

Just as with the `FilterableCollectionMixin` before, the
`SortableCollectionMixin` should observe its source if updates are to propagate
from one collection to another:

~~~~javascript
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
~~~~
