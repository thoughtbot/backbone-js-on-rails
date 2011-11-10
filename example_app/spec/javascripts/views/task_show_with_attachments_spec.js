//= require application

describe("ExampleApp.Views.TaskShow for a task with attachments", function() {
  var task, view, $el;

  beforeEach(function() {
    task = new ExampleApp.Models.Task({
      id: 1,
      title: "Buy pies",
      attachments: [
        {
          upload_file_name: "blueberries.jpg",
          upload_url: "http://www.realblueberries.com/images/Blueberry-Cluster-1.jpg"
        },
        {
          upload_file_name: "strawberries.jpg",
          upload_url: "http://strawberriesweb.com/three-strawberries.jpg"
        }
      ]
    });

    view = new ExampleApp.Views.TaskShow({ model: task });
    $el = $(view.render().el);
  });

  it("displays attachments", function() {
    expect($el).toContain(".attachments img[src='http://www.realblueberries.com/images/Blueberry-Cluster-1.jpg']")
    expect($el).toContain(".attachments img[src='http://strawberriesweb.com/three-strawberries.jpg']")
  });

  it("displays attachment filenames", function() {
    expect($el.find(".attachments p").first()).toHaveText('Attached: blueberries.jpg');
    expect($el.find(".attachments p").last()).toHaveText('Attached: strawberries.jpg');
  });
});
