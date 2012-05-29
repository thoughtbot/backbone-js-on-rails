require 'rake'

desc "Build all output targets, commit, and push a new release"
task :release => :build do
  Releaser.new.release
end

desc "Build all output targets"
task :build do
  Builder.new.generate
end

desc "update backbone support code"
task :update_backbone_support do
  sh "git clone git@github.com:thoughtbot/backbone-support.git"
  sh "mv backbone-support/lib/assets/backbone-support/*.js book/views_and_templates"
  sh "rm -rf backbone-support"
end

module Runner
  private

  def run(command)
    puts "+ #{command}"
    puts "- #{system command}"
  end
end

class Builder
  include Runner

  attr_accessor :output

  def generate
    run "rm -rf output/*"
    run "cp -r book/images output"
    @output = File.new("output/book.md", "w+")
    parse_file("book/book.md")
    @output.close
    Dir.chdir "output"
    generate_html
    generate_pdf
    generate_epub
    #generate_mobi
  end

  def parse_file(filename)
    file = File.open(filename)
    file.each do |line| 
      if line =~ /\<\<\((.+)\)/
        p "parsing file as code #{$1}"
        @output.puts "````"
        parse_file("#{File.dirname(filename)}/#{$1}")
        @output.puts "````"
      elsif line =~ /\<\<\[(.+)\]/
        p "parsing file as markdown #{$1}"
        parse_file("#{File.dirname(filename)}/#{$1}")
      else
        @output.puts line
      end
    end
  end

  def generate_html
    run "pandoc book.md --section-divs --self-contained --toc --standalone -t html5 -o book.html"
  end

  def generate_pdf
    working = File.expand_path File.dirname(__FILE__)
    p working
    run "pandoc book.md --data-dir=#{working} --template=template --chapters --toc -o book.pdf"
  end

  def generate_epub
    run "pandoc book.md --toc -o book.epub"
  end

  def generate_mobi
    run "kindlegen book.epub -o book.mobi"
  end
end

class Releaser
  include Runner

  def release
    ensure_clean_git
    copy_output_folder_to_release_folder
    commit_release_folder
    push
  end

  def ensure_clean_git
    raise "Can't deploy without a clean git status." if git_dirty?
  end

  def copy_output_folder_to_release_folder
    run "rm -rf release"
    run "cp -R output release"
  end

  def commit_release_folder
    run "git add -u && git add . && git commit -m 'Generate new release'"
  end

  def push
    run "git push"
  end

  private

  def git_dirty?
    `[[ $(git diff --shortstat 2> /dev/null | tail -n1) != "" ]]`
    dirty = $?.success?
  end
end
