//= require application

describe("ExampleApp.Views.TaskShow", function() {
  var task, view, $el;

  beforeEach(function() {
    task = new ExampleApp.Models.Task({
      id: 1,
      title: "Wake up"
    });

    view = new ExampleApp.Views.TaskShow({ model: task });
    $el = $(view.render().el);
  });

  it("renders the detail view for a task", function() {
    expect($el).toHaveText(/Wake up/);
  });

  it("renders a file upload area", function() {
    expect($el).toContain(".upload label:contains('Attach a file to upload')");
    expect($el).toContain(".upload button:contains('Upload attachment')");
    expect($el).toContain(".upload input[type=file]");
  });

  it("links the upload label and input", function() {
    var $label = $el.find('.upload label');
    var $input = $el.find('.upload input');
    expect($label.attr('for')).toEqual($input.attr('id'));
  });
});
