desc "Push /_site to master branch"
task :deploy do
  system "git subtree push --prefix _site origin master"
end

task :serve do
  system "JEKYLL_ENV=production bundle exec jekyll serve"
end

task :sass do
  source_file = 'source/_scss/app.sass'
  dest_file = 'source/css/app.css'
  system "sass --watch #{source_file}:#{dest_file} --style compressed"
end
