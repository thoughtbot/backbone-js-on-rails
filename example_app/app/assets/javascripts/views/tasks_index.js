ExampleApp.Views.TasksIndex = Support.CompositeView.extend({
  initialize: function() {
    _.bindAll(this, "render");

    this.taskSearch = new ExampleApp.TaskSearch(this.collection);
    this.bindTo(this.taskSearch.filteredCollection, "add", this.renderTasks);
    this.bindTo(this.taskSearch.filteredCollection, "remove", this.renderTasks);
    this.bindTo(this.taskSearch.filteredCollection, "reset", this.renderTasks);
  },

  render: function () {
    this.renderTemplate();
    this.attachVisualSearch();
    this.renderTasks();
    return this;
  },

  renderTemplate: function() {
    this.$el.html(JST['tasks/index']({ tasks: this.collection }));
  },

  attachVisualSearch: function() {
    this.taskSearch.attach(this.$('.visual-search'));
  },

  renderTasks: function() {
    var self = this;
    self.$('tbody').empty();

    this.taskSearch.filteredCollection.each(function(task) {
      var row = new ExampleApp.Views.TaskItem({ model: task });
      self.renderChild(row);
      self.$('tbody').append(row.el);
    });
  }
});
