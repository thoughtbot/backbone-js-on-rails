ExampleApp.Views.TasksNew = Backbone.View.extend({
  tagName: 'form',
  id: "new-task",

  events: {
    "submit": "save",
    "click a.add-assignee": "addAssignee"
  },

  initialize: function(options) {
    this.users = options.users;
    _.bindAll(this, "render", "saved");
    this.newTask();
  },

  newTask: function() {
    this.model = new ExampleApp.Models.Task();
  },

  addAssignee: function() {
    this.$('ul.assignees').append(JST['tasks/assignee_field']({ users: this.users }));
    return false;
  },

  render: function () {
    this.$el.html(JST['tasks/form_fields']());
    this.$('input[name=title]').focus();
    return this;
  },

  renderFlash: function(flashText) {
    this.$el.prepend(JST['tasks/flash']({ flashText: flashText, type: 'success' }));
  },

  save: function(e) {
    e.preventDefault();

    this.commitForm();
    this.model.save({}, { success: this.saved });
    return false;
  },

  commitForm: function() {
    this.model.set({ title: this.$('input[name=title]').val() });
    this.model.assignedUsers = new ExampleApp.Collections.Users(this.assignedUsers());
  },

  assignedUsers: function() {
    var self = this;
    return _.uniq(_.compact(_.map(this.assigneeEmails(), function(email) {
      return self.users.findByEmail(email);
    })));
  },

  assigneeEmails: function() {
    return this.$('select.new-task-assignee-email').map(function(n, select) {
      return $(select).val();
    });
  },

  saved: function() {
    var flash = "Created task: " + this.model.escape('title');

    this.collection.add(this.model);
    this.newTask();
    this.render();
    this.renderFlash(flash);
  }
});
