require 'guard/guard'

module ::Guard
  class GitScribe < Guard
    def start
      UI.info "git-scribe is waiting for book changes..."
    end

    def run_all
      true
    end

    def run_on_change(paths)
      UI.info "git-scribe is generating a new SITE from the book..."
      output = `git scribe gen site`

      command_failure = ($?.to_i != 0)
      asciidoc_warning = output =~ /asciidoc: WARNING/

      if command_failure || asciidoc_warning
        UI.error output

        UI.error "*"*80
        UI.error "Errors in generation listed above!"
        UI.error "*"*80
      else
        UI.info "Done."
      end
    end
  end
end

guard 'git-scribe' do
  watch (%r{book/})
end

