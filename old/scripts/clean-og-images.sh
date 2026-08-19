find og-images | grep -e ".png" -e ".svg" | grep -v "template.svg" | sed -e 's/ /\\ /g' | xargs rm

