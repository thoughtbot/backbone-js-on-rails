## Get the latest release of the book

The quickest way to start reading right now is to view the PDF version here:

https://github.com/thoughtbot/backbone-js-on-rails/raw/master/release/book.pdf

The book is currently available in the following formats:

* PDF: release/book.pdf
* Single-page HTML: release/book.html
* Epub (iPad, Nook): release/book.epub
* Mobi (Kindle): release/book.mobi

For the HTML version, clone the repository and look at the HTML so that images
and other assets are properly loaded.

## Instructions for authors

#### Note: Readers of the book don't need to worry about the instructions below.

This book is written using using the markdown and built using pandoc, which can
be found at:

<http://johnmacfarlane.net/pandoc/>

Instructions for installing pandoc for your platform can be found here:

<http://johnmacfarlane.net/pandoc/installing.html>

We recommend using the binary distribution of pandoc whenever possible.

### Dependencies

Install dependencies with Bundler:

  bundle install

Now install the pandoc dependencies:

#### Installing dependencies on OSX

  brew install https://raw.github.com/adamv/homebrew-alt/master/non-free/kindlegen.rb
  brew install asciidoc fop source-highlight docbook

Make sure you register docbook after installation:

  sudo docbook-register

And add the following to your ~/.bashrc or equivalent (as per `brew info docbook`):

  export XML_CATALOG_FILES#"/usr/local/etc/xml/catalog"

#### Installing dependencies on Ubuntu

   sudo aptitude install asciidoc fop source-highlight docbook

Install KindleGen into ~/bin; you can put it anywhere in your PATH you like:

   wget -P /tmp/ http://s3.amazonaws.com/kindlegen/kindlegen_linux_2.6_i386_v1.2.tar.gz
   tar -C /tmp/ -xzf /tmp/kindlegen_linux_2.6_i386_v1.2.tar.gz
   mv /tmp/kindlegen ~/bin/

## Releasing

Run +rake release+ to build all output targets, commit to git, and push up to
GitHub.
