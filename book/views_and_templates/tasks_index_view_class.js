var TasksIndex = Backbone.View.extend({
  template: JST['tasks/tasks_index'],
  tagName: 'section',
  id: 'tasks',

  initialize: function() {
    this.tasks = this.options.tasks;

    _.bindAll(this, "render");
    TaskApp.tasks.bind("change", this.render);
    TaskApp.tasks.bind("add", this.render);
  },

  render: function() {
    $(this.el).html(this.template({tasks: this.tasks}));
  }
});
