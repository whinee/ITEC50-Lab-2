const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');
const indexFile = path.join(blogDir, 'index.html');

// Get all blog post files except index.html
const blogFiles = fs.readdirSync(blogDir)
    .filter(file => file.endsWith('.html') && file !== 'index.html')
    .sort()
    .reverse();

function extractTitle(content) {
    const match = content.match(/<h1>(.*?)<\/h1>/);
    return match ? match[1] : 'Untitled';
}

function extractPreview(content) {
    const innerMatch = content.match(/<div class="inner">([\s\S]*?)<\/div>/);
    let innerContent = innerMatch ? innerMatch[1] : content;

    // Remove the first <h1>...</h1>
    innerContent = innerContent.replace(/<h1>[\s\S]*?<\/h1>/, '');

    const textOnly = innerContent
        .replace(/<[^>]*>/g, '')  // strip remaining HTML
        .replace(/\s+/g, ' ')
        .trim();

    return textOnly.substring(0, 50) + (textOnly.length > 50 ? '...' : '');
}

let blogCards = '';

blogFiles.forEach(file => {
    const filePath = path.join(blogDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const title = extractTitle(content);
    const preview = extractPreview(content);

    blogCards += `
                <article class="blog-preview">
                    <h2>${title}</h2>
                    <p>${preview}</p>
                    <a href="./${file}">Read more →</a>
                </article>
`;
});

const newIndexContent = `
<!DOCTYPE HTML>
<html lang="en">
<head>
    <meta name="apple-mobile-web-app-title" content="Lyra On Top!" />
    <meta name="twitter:title" content="Lyra On Top!" />
    <meta property="og:site_name" content="Lyra On Top!" />
    <meta property="og:title" content="Lyra On Top!" />
    <title>Lyra On Top!</title>

    <meta name="author" content="Lyra Phasma">

    <meta name="description" content="whi~nyaan is whi~nyaan!" />
    <meta property="og:description" content="whi~nyaan is whi~nyaan!" />

    <meta name="twitter:site:domain" content="lyra-on.top" />
    <meta name="twitter:url" content="https://lyra-on.top" />
    <meta property="og:url" content="https://lyra-on.top" />
    <link rel="canonical" href="https://lyra-on.top" />

    <meta name="twitter:card" content="./static/assets/images/banner.png" />
    <meta name="twitter:image" content="./static/assets/images/banner.png" />
    <meta property="og:image" content="./static/assets/images/banner.png" />
    <meta property="og:image:width" content="1280" />
    <meta property="og:image:height" content="800" />

    <link rel="icon" type="image/x-icon" href="./assets/static/images/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="./assets/static/images/favicon.ico" />

    <meta property="twitter:card" content="summary_large_image" />

    <meta property="og:type" content="website" />

    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport"
        content="width=device-width,initial-scale=1,user-scalable=no" />

    <link href="../assets/static/stylesheets/base.css" rel="stylesheet">
    <link href="../assets/static/stylesheets/responsive-base.css" rel="stylesheet">
</head>
<body>
    <picture class="bg-image">
        <source
            type="image/webp"
            srcset="
                ../assets/static/images/Lyra-and-Dreanne-Night-Market-Cess_.2-256w.webp 144w,
                ../assets/static/images/Lyra-and-Dreanne-Night-Market-Cess_.2-256w.webp 256w,
                ../assets/static/images/Lyra-and-Dreanne-Night-Market-Cess_.2-320w.webp 320w,
                ../assets/static/images/Lyra-and-Dreanne-Night-Market-Cess_.2-480w.webp 480w,
                ../assets/static/images/Lyra-and-Dreanne-Night-Market-Cess_.2-720w.webp 720w,
                ../assets/static/images/Lyra-and-Dreanne-Night-Market-Cess_.2-1080w.webp 1080w,
                ../assets/static/images/Lyra-and-Dreanne-Night-Market-Cess_.2-1440w.webp 1440w
            "
            sizes="100vw"
        />
        <img
            src="/assets/static/images/Lyra-and-Dreanne-Night-Market-Cess_.2-1080w.webp"
            alt=""
            fetchpriority="high"
            decoding="async"
        />
    </picture>
    <nav id="menu">
        <ul class="links">
            <li><a href="../index.html">Home</a></li>
            <li><a href="../about.html">About</a></li>
            <li><a href="../contact.html">Contact</a></li>
            <li><a href="../feedback.html">Feedback</a></li>
            <li><a href="./index.html">Blog</a></li>
        </ul>
    </nav>
    <div id="wrapper">
        <div id="main">
            <div class="inner">
                <header>
                    <h1>Blog</h1>
                </header>
                ${blogCards}
            </div>
        </div>
        <footer>
            <p>Copyright &copy; 2026 Lyra Phasma. MIT Licensed.
        </footer>
    </div>    
</body>
</html>
`;

fs.writeFileSync(indexFile, newIndexContent);

console.log("✨ Blog index generated successfully.");