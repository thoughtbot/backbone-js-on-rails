ExampleApp.Views.TaskShow = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, "render");
  },

  events: {
    "click .upload button": "upload"
  },

  render: function () {
    this.renderTemplate();
    this.renderTask();
    this.attachUploader();
    return this;
  },

  renderTemplate: function() {
    $(this.el).html(JST['tasks/show']());
  },

  renderTask: function() {
    this.$('p').text(this.model.escape('title'));
    this.$('.upload input').attr('id',  'upload_' + this.model.get('id'));
    this.$('.upload label').attr('for', 'upload_' + this.model.get('id'));
  },

  uploadInput: function() {
    return this.$('.upload input').get(0);
  },

  attachUploader: function() {
    var uploadUrl = "/tasks/" + this.model.get('id') + '/attachments';

    this.uploader = new uploader(this.uploadInput(), {
      url:      uploadUrl,
      error:    this.uploadError,
      success:  this.uploadSuccess,
      progress: this.uploadProgress
    });
  },

  uploadProgress: function(ev) {
    console.log('upload progress: ' + ev.loaded + " / " + ev.total);
  },

  uploadError: function(ev) {
    console.log('upload error' + ev);
  },

  uploadSuccess: function(data) {
    console.log('upload success');
  },

  upload: function() {
    this.uploader.send();
  }
});

