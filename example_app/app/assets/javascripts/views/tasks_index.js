ExampleApp.Views.TasksIndex = Backbone.View.extend({
  id: 'tasks',
  tagName: 'div',

  initialize: function() {
    _.bindAll(this, "render");
    this.collection.bind("add", this.render);
  },

  render: function () {
    $(this.el).html(JST['tasks/index']({ tasks: this.collection }));
    return this;
  }
});
