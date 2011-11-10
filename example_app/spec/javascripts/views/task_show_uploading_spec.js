//= require application

describe("ExampleApp.Views.TaskShow uploading", function() {
  var task, view, $el;

  beforeEach(function() {
    this.xhr = sinon.useFakeXMLHttpRequest();
    var requests = this.requests = []

    this.xhr.onCreate = function(xhr) {
      requests.push(xhr);
    };

    this.xhr.prototype.upload = {
      addEventListener: function() {}
    };

    task = new ExampleApp.Models.Task({
      id: 1,
      title: "Wake up"
    });

    view = new ExampleApp.Views.TaskShow({ model: task });
  });

  afterEach(function() {
    this.xhr.restore();
  });

  it("uploads the file when the upload button is clicked", function() {
    view.uploadInput = function() {
      return { files: ["uploaded file contents"], }
    };

    $el = $(view.render().el);
    view.upload();

    expect(this.requests.length).toEqual(1);
    expect(this.requests[0].url).toEqual("/tasks/1/attachments.json");
  });
});
