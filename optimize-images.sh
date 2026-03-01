# Usage: ./optimize-images-same-folder.sh /path/to/static/images

SRC_DIR="./assets/static/images"
SIZES=(24 48 96 144 256 320 480 720 1080 1440)  # target widths
EXCLUDE_FOLDERS=("screenshots")  # folders to skip

# Function to check if a path should be excluded
should_exclude() {
    local FILE="$1"
    for EX in "${EXCLUDE_FOLDERS[@]}"; do
        if [[ "$FILE" == *"/$EX/"* ]]; then
            return 0  # yes, exclude
        fi
    done
    return 1  # no, keep
}

# find all images recursively
find "$SRC_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) | while read IMG; do
    # skip excluded folders
    if should_exclude "$IMG"; then
        echo "Skipping $IMG"
        continue
    fi

    DIR_NAME="$(dirname "$IMG")"
    BASE_NAME="$(basename "$IMG" | sed 's/\.[^.]*$//')"  # strip extension

    for SIZE in "${SIZES[@]}"; do
        OUT_FILE="$DIR_NAME/${BASE_NAME}-${SIZE}w.webp"

        # convert + resize + optimize
        convert "$IMG" -resize "${SIZE}x" -quality 80 "$OUT_FILE"
        echo "Created $OUT_FILE"
    done
done

echo "All images optimized in-place!"