require 'rake'

desc "Build all output targets, commit, and push a new release"
task :release do
  Releaser.new.release
end

desc "update backbone support code"
task :update_backbone_support do
  sh "git clone git@github.com:thoughtbot/backbone-support.git"
  sh "mv backbone-support/lib/assets/backbone-support/*.js book/views_and_templates"
  sh "rm -rf backbone-support"
end

class Releaser
  def release
    ensure_clean_git
    ensure_git_scribe_dependencies_satisfied
    generate_output
    copy_output_folder_to_release_folder
    commit_release_folder
    push
  end

  def ensure_clean_git
    raise "Can't deploy without a clean git status." if git_dirty?
  end

  def ensure_git_scribe_dependencies_satisfied
    check_output = `git scribe check`

    if check_output =~ /not present/
      raise "\n\nCan't generate without the dependencies of `git scribe` satisfied:\n\n" +
      "#{check_output}\n\n"
    end
  end

  def generate_output
    run "rm -rf output/*"
    run "git scribe gen"
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

  def run(command)
    puts "+ #{command}"
    puts "- #{system command}"
  end

  def git_dirty?
    `[[ $(git diff --shortstat 2> /dev/null | tail -n1) != "" ]]`
    dirty = $?.success?
  end
end
