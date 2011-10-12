require 'rake'

desc "Makes sure the repository is clean"
task :ensure_clean_git do
  `[[ $(git diff --shortstat 2> /dev/null | tail -n1) != "" ]]`
  raise "Can't work without a clean git status." if $?.success?
end

desc "Makes sure git scribe can run"
task :ensure_git_scribe do
  check_output = `git scribe check`

  if check_output =~ /not present/
    raise "\n\nCan't generate without the dependencies of `git scribe` satisfied:\n\n" +
    "#{check_output}\n\n"
  end
end

desc "Generate the book"
task :generate => [:ensure_clean_git, :ensure_git_scribe] do
  sh 'rm -rf output/*'
  sh 'git scribe gen'
end

task :default => :generate

desc "Commit release folder and push code to github"
task :commit_and_push do
  sh "git add -A release && git commit -m 'Generate new release'"
  sh "git push"
end

desc "Build all output targets, commit, and push a new release"
task :release => [:generate, :commit_and_push]

desc "update backbone support code"
task :update_backbone_support do
  sh "git clone git@github.com:thoughtbot/backbone-support.git"
  sh "mv backbone-support/lib/assets/backbone-support/*.js book/views_and_templates"
  sh "rm -rf backbone-support"
end
