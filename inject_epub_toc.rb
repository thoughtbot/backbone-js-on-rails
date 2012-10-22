require 'nokogiri'
require 'zip/zip'

class EpubContentsBuilder
  def initialize(filename)
    @filename = filename
    @opf_filename = 'content.opf'
  end

  def inject_contents
    Zip::ZipFile.open(@filename) do |zipfile|
      @zipfile = zipfile
      add_contents_file
      insert_opf_reference
    end
  end

  private

  def add_contents_file
    add_zipfile_entry("contents.xhtml", contents_xhtml)
  end

  def insert_opf_reference
    insertions = {
      '<item id="title_page" href="title_page.xhtml" media-type="application/xhtml+xml" />' =>
        '<item id="contents" href="contents.xhtml" media-type="application/xhtml+xml" />',

      '<itemref idref="title_page" />' =>
        '<itemref idref="contents" />'
    }

    insert_lines(@opf_filename, insertions)
  end

  def add_zipfile_entry(filename, contents)
    @zipfile.get_output_stream(filename) do |file|
      file.puts contents
    end
  end

  def insert_lines(filename, insertions)
    opf_xml = @zipfile.read(filename)

    @zipfile.get_output_stream(filename) do |file|
      opf_xml.split("\n").each do |original_line|
        file.puts original_line

        insertions.each do |marker, line_to_insert|
          if original_line.include?(marker)
            file.puts line_to_insert
          end
        end
      end
    end
  end

  def contents_xhtml
    <<-XML
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <title class="title">Table of Contents</title>
    <link href="stylesheet.css" type="text/css" rel="stylesheet" />
    </head>
    <body>
    #{contents_xhtml_links}
    </body>
    </html>
    XML
  end

  def contents_xhtml_links
    toc_xhtml = ""

    ncx = Nokogiri::XML.parse(@zipfile.read('toc.ncx'))
    chapter_files = ncx.css('content').map { |node| node['src'] }.select {|chapter_name| chapter_name =~ /ch\d/ };nil

    chapter_files.each do |chapter_file|
      chapter_xhtml = Nokogiri::XML.parse(@zipfile.read(chapter_file))
      h1 = chapter_xhtml.css('h1').first
      h2s = chapter_xhtml.css('h2')

      toc_xhtml << %Q{<p><a href="#{chapter_file}">#{h1.text}</a></p>\n}

      toc_xhtml << "<ul>\n"
      h2s.each do |h2|
        toc_xhtml << %Q{  <li><a href="#{chapter_file}##{h2['id']}">#{h2.text}</a></li>\n}
      end
      toc_xhtml << "</ul>\n"
    end

    toc_xhtml
  end
end

unless epub_filename = ARGV[0]
  raise "Usage: ruby inject_epub_toc.rb epub_filename"
end

EpubContentsBuilder.new(epub_filename).inject_contents
