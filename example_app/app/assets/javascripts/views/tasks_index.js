ExampleApp.Views.TasksIndex = Support.CompositeView.extend({
  initialize: function() {
    _.bindAll(this, "render", "filterCriteria");
    this.bindTo(this.collection, "add", this.render);
  },

  render: function () {
    this.renderTemplate();
    this.setupVisualSearch();
    this.renderTasks();
    return this;
  },

  renderTemplate: function() {
    this.$el.html(JST['tasks/index']({ tasks: this.collection }));
  },

  renderTasks: function() {
    var self = this;
    self.$('tbody').empty();

    this.filteredCollection().each(function(task) {
      var row = new ExampleApp.Views.TaskItem({ model: task });
      self.renderChild(row);
      self.$('tbody').append(row.el);
    });
  },

  filteredCollection: function() {
    if (this._filteredCollection) {
      this._filteredCollection.teardown();
    }

    this._filteredCollection = this.collection.filtered(this.filterCriteria);

    return this._filteredCollection;
  },

  filterCriteria: function(task) {
    var self = this;
    return this.filterSearches.all(function(search) {
      switch (search.get('category')) {
        case 'completed':
          return task.isComplete().toString() == search.get('value');
        case 'assignees':
          return task.assignedUsers.any(function(user) {
            return self.doesMatch({ category: 'email', value: search.get('value') }, user);
          });
        default:
          return self.doesMatch(search.attributes, task);
      }
    });
  },

  doesMatch: function(query, candidate) {
    return candidate.get(query.category).indexOf(query.value) >= 0;
  },

  setupVisualSearch: function() {
    this.filterSearches = new Backbone.Collection();

    var self = this;
    var visualSearch = VS.init({
      container : this.$('.visual-search'),
      query     : '',
      callbacks : {
        search: function(query, searchCollection) {
          console.log("Searching for: " + query);
          self.filterSearches = searchCollection;
          self.renderTasks();
        },
        // These are the facets that will be autocompleted in an empty input.
        facetMatches: function(callback) {
          callback(['title', 'assignees', 'completed']);
        },
        // Produce the values that are listed for a given facet
        valueMatches: function(facet, searchTerm, callback) {
          switch (facet) {
            case 'title':
              callback(_.uniq(self.collection.pluck('title')));
              break;
            case 'assignees':
              callback(_.uniq(_.flatten(self.collection.map(function(task) { return task.assignedUsers.pluck('email') } ))));
              break;
            case 'completed':
              callback(["true", "false"]);
              break;
          }
        }
      }
    });
  }
});
