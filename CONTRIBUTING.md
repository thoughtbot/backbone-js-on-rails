## Instructions for contributors

By making a contribution to this project, you certify that
you agree to all points below.

In short, you are legally allowed to transfer copyright of this
work to thoughtbot, inc. and do so.  Where possible, we will
give you attribution.

In full, based on the Linux Developer's Certificate of Origin 1.1:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the license indicated in the
    LICENSE file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate license and I
    have the right under that license to submit that work with
    modifications, whether created in whole or in part by me, under
    the same license as indicated in the LICENSE file.

(c) By contributing to this project, I assign copyright of the
    contribution to thoughtbot, inc. to be distributed under the license
    as described in the accompanying LICENSE file.

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

```
bundle install
```

The `paperback` gem depends on the following fonts:

* [Proxima Nova](https://www.dropbox.com/sh/ntxu99zcm28agp8/Cqiwu9ORA5)
* [Inconsolata](http://www.levien.com/type/myfonts/inconsolata.html)

Now install the pandoc dependencies:

#### Installing dependencies on OSX

```
brew install https://raw.github.com/adamv/homebrew-alt/master/non-free/kindlegen.rb
brew install imagemagick
brew install ghostscript
```
Latex is needed for PDF distribution:

We recommend downloading the [smaller, basic version of MacTex](http://www.tug.org/mactex/morepackages.html).

The `upquote` TeX package is required to correctly render single quotes in source listings.
The `cm-super` TeX package is required to correctly render outline (vector) fonts for the T1 encoding.

Assuming you installed the BasicTeX package above, install this with the TeXLive manager commandline tool:

```
sudo tlmgr update --self
sudo tlmgr install upquote
sudo tlmgr install cm-super
```

You may need to add its bin directory to your PATH:

```
export PATH=$PATH:/usr/texbin
```

#### Installing dependencies on Ubuntu

Install KindleGen into ~/bin; you can put it anywhere in your PATH you like:

```
wget -P /tmp/ http://s3.amazonaws.com/kindlegen/kindlegen_linux_2.6_i386_v1.2.tar.gz
tar -C /tmp/ -xzf /tmp/kindlegen_linux_2.6_i386_v1.2.tar.gz
mv /tmp/kindlegen ~/bin/
```

Latex is needed for PDF creation:

```
sudo apt-get install texlive
```

As are the upquote and cm-super TeX packages:

```
sudo tlmgr update --self
sudo tlmgr install upquote
sudo tlmgr install cm-super
```

## Building

Run `paperback build` to build all output targets.

## Reviewing

When reviewing new chapters, use `paperback review` to check out, build, and
view the book locally. Example: `paperback review 6` will review the book for
pull request 6.

## Releasing

Run `paperback release` to build all output targets in the `release` directory.
Then commit and push up to GitHub.

For more detailed documentation on the `paperback` gem, check out the
[README](https://github.com/thoughtbot/paperback/blob/master/README.md)
