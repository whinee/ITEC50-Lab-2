build_tex doc:
    latexmk -xelatex -synctex=1 -interaction=nonstopmode -file-line-error -bibtex -shell-escape {{doc}}

screenshot:
    CHROME_PATH="/usr/bin/ungoogled-chromium" node screenshot.js
    just build_tex main.tex