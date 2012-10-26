window.ExampleApp = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function(data) {
    this.tasks = new ExampleApp.Collections.Tasks(data.tasks);
    _.extend(this.tasks, FilterableCollectionMixin);
    this.users = new ExampleApp.Collections.Users(data.users);

    new ExampleApp.Routers.Tasks({ collection: this.tasks, users: this.users });
    if (!Backbone.history.started) {
      Backbone.history.start();
      Backbone.history.started = true;
    }
  }
};
