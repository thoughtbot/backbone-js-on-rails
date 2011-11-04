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
    this.renderAttachments();
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

  renderAttachments: function() {
    var self = this;
    var $attachments = this.$('ul.attachments');
    $attachments.html('');

    this.model.attachments.each(function(attachment) {
      var attachmentView = $('<li><p></p><img></li>');
      $('p', attachmentView).text("Attached: " + attachment.escape('upload_file_name'));
      $('img', attachmentView).attr("src", attachment.get('upload_url'));
      $attachments.append(attachmentView);
    });
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
      progress: this.uploadProgress,
      prefix:   'upload'
    });

    this.uploader.prefilter = function() {
      var token = $('meta[name="csrf-token"]').attr('content');
      if (token) this.xhr.setRequestHeader('X-CSRF-Token', token);
    }
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

