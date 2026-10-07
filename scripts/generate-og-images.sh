


title_placeholder="__title__"
dir="public/og-images"
template="$dir/template.svg"

generate() {
  svg="$dir/$1.svg"
  png="$dir/$1.png"

  cp "$template" "$svg"
  sed -i "s/$title_placeholder/$1/g" "$svg"
  echo "Generated $svg"

  inkscape "$svg" --export-type=png --export-filename="$png"
}

if [ "$#" -gt 0 ]; then
  for app in "$@"
  do
    generate "$app"
  done
else
  for app in $(ls app/apps | grep -v 'locales')
  do
    generate "$app"
  done
fi
