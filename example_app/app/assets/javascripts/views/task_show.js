ExampleApp.Views.TaskShow = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, "render", "uploadSuccess");
    this.model.bind("change", this.render);
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

  attachUploader: function() {
    var uploadUrl = "/tasks/" + this.model.get('id') + '/attachments.json';

    this.uploader = new uploader(this.uploadInput(), {
      url:      uploadUrl,
      success:  this.uploadSuccess,
      prefix:   'upload'
    });

    this.uploader.prefilter = function() {
      var token = $('meta[name="csrf-token"]').attr('content');
      if (token) this.xhr.setRequestHeader('X-CSRF-Token', token);
    }
  },

  uploadInput: function() {
    return this.$('.upload input').get(0);
  },

  upload: function() {
    this.uploader.send();
  },

  uploadSuccess: function(data) {
    this.model.fetch();
  }
});

