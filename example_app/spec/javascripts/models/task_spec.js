//= require application

describe("ExampleApp.Models.Tasks", function() {
  it("knows if it is complete", function() {
    var completeTask = new ExampleApp.Models.Task({ complete: true });
    expect(completeTask.isComplete()).toBe(true);
  });

  it("knows if it is not complete", function() {
    var incompleteTask = new ExampleApp.Models.Task({ complete: false });
    expect(incompleteTask.isComplete()).toBe(false);
  });
});

describe("ExampleApp.Models.Tasks#initialize", function() {
  var attributes, task;

  beforeEach(function() {
    attributes = {"id":1,
                  "title":"Sweet Task",
                  "attachments":[
                    {"upload_url":"/uploads/1.jpg"},
                    {"upload_url":"/uploads/2.jpg"}
                  ]};
    task = new ExampleApp.Models.Task(attributes);
  });

  it("creates collections for nested attachments", function() {
    var attachments = task.attachments;
    var typeCheck = attachments instanceof ExampleApp.Collections.Attachments;
    expect(typeCheck).toEqual(true);
    expect(attachments.size()).toEqual(2);
  });

  it("populates the collection with Attachment models", function() {
    var attachments = task.attachments;
    var typeCheck = attachments.first() instanceof ExampleApp.Models.Attachment;
    expect(typeCheck).toEqual(true);
    expect(attachments.first().get('upload_url')).toEqual('/uploads/1.jpg');

    typeCheck = attachments.last() instanceof ExampleApp.Models.Attachment;
    expect(typeCheck).toEqual(true);
    expect(attachments.last().get('upload_url')).toEqual('/uploads/2.jpg');
  });
});

describe("ExampleApp.Models.Task attachments:change", function() {
  it("re-parses the collection", function() {
    var task = new ExampleApp.Models.Task({"attachments":[
                                            {"upload_url":"1.jpg"},
                                            {"upload_url":"2.jpg"}]});
    expect(task.attachments.size()).toEqual(2);

    task.set({"attachments":[{"upload_url":"1.jpg"}]});
    expect(task.attachments.size()).toEqual(1);
  });
});
