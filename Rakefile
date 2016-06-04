desc "Push /_site to master branch"
task :default do
  system "git subtree push --prefix _site origin master"
end

task :sass do
  source_file = 'source/_scss/app.sass'
  dest_file = 'source/css/app.css'
  system "sass --watch #{source_file}:#{dest_file}"
end
