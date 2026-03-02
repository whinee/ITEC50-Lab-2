optimize_images:
    bash optimize_images.sh 

gen_blog:
    node blog.js

screenshot:
    CHROME_PATH="/usr/bin/ungoogled-chromium" node screenshot.js

build_tex doc:
    latexmk -xelatex -synctex=1 -interaction=nonstopmode -file-line-error -bibtex -shell-escape "{{doc}}"

build:
    just optimize_images
    just gen_blog
    just screenshot
    just build_tex main.tex