ExampleApp.Models.Task = Backbone.Model.extend({
  initialize: function() {
    this.bind("change:attachments", this.parseAttachments);
    this.parseAttachments();
  },

  parseAttachments: function() {
    this.attachments = new ExampleApp.Collections.Attachments(this.get('attachments'));
  },

  schema: {
    title: { type: "Text" }
  },

  urlRoot: '/tasks',

  isComplete: function() {
    return this.get('complete');
  }
});
