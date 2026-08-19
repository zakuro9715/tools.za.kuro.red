title_placeholder="__title__"
dir="og-images"
template="$dir/template.svg"
while read title; do
  name="$(echo "$title" | sed 's/ //g')"
  svg="$dir/$name.svg"
  png="$dir/$name.png"

  cp "$template" "$svg"
  sed -i "s/$title_placeholder/$title/g" "$svg"
  echo "Generated $svg"

  inkscape "$svg" --export-type=png --export-filename="$png"

done < "$dir/list.txt"
