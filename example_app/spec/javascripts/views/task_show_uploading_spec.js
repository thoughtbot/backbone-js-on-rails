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

    view.uploadInput = function() {
      return { files: ["uploaded file contents"] }
    };

    $el = $(view.render().el);
  });

  afterEach(function() {
    this.xhr.restore();
  });

  it("uploads the file when the upload method is called", function() {
    view.upload();
    expect(this.requests.length).toEqual(1);
    expect(this.requests[0].requestBody.constructor).toEqual(FormData);
  });

  it("uploads an attachment for the current task", function() {
    view.upload();
    expect(this.requests[0].url).toEqual("/tasks/1/attachments.json");
  });

  it("sets the CSRF token for the upload request", function() {
    view.upload();
    var expectedCsrfToken = $('meta[name="csrf-token"]').attr('content');
    expect(this.requests[0].requestHeaders['X-CSRF-Token']).toEqual(expectedCsrfToken);
  });
});
