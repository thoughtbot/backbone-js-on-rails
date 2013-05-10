## The example application

The example application is a classic todo item manager.  This is a
popular example, and for good reason: The concepts and domain are familiar,
and room is left to explore interesting implementations like deferred
loading and file attachment.

While the example application is based on the content of the book, it
represents the _finished_ state of a lot of concepts discussed in the book. So,
while we show some concepts in the book and break them down, the example
application may then use a plugin that encapsulates that idea or is more
officially supported. The book is not meant to be a walk through of the
contents of `example_app`. Instead, `example_app` is intended to be a
standalone reference in and of itself, while being related to the book.

We did this intentionally so that the book can be a standalone reference rather
than being a sequential read that must be understood in sequence.

### Framework and library choice in the example application

The application uses Rails 3.2.13 and Ruby 1.9.3.  We provide a `Gemfile` and
a `.ruby-version` file in the root of the example app that help define these
versions, and the other dependencies of the app.

The included JavaScript libraries are non-minified for readability.  This
is a general good practice, and the Rails asset pipeline will properly package
the assets for production.

While Rails provides the ability to write in CoffeeScript, we have decided
to make all of the example code normal JavaScript so as to reduce the number
of new things introduced at once.

The example application comes with a full test suite.  The README in the
`example_app` root directory has instructions for bootstrapping the app and
running all the tests.
