import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { spawn } from "child_process";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const htmlFiles = [
    "blog/00011.html",
    "blog/index.html",
    "404.html",
    "about.html",
    "contact.html",
    "feedback.html",
    "index.html",
];

const PORT = 4173;
const OUTPUT_ROOT = "assets/static/images/screenshots";

const viewports = [
    { width: 1920, height: 1080, label: "default" },
    { width: 1680, height: 1050 },
    { width: 1280, height: 800 },
    { width: 1024, height: 768 },
    { width: 980, height: 600 },
    { width: 736, height: 414 },
    { width: 360, height: 640 },
];

const childProcesses = [];

function cleanup() {
    console.log("\nCleaning up...");
    for (const child of childProcesses) {
        try { child.kill(); } catch (e) {}
    }
    process.exit();
}

process.on('SIGINT', cleanup);   // Ctrl+C
process.on('SIGTERM', cleanup);  // kill

try {
    const server = spawn("python3", ["-m", "http.server", PORT], { stdio: "ignore" });
    childProcesses.push(server);

    await new Promise(r => setTimeout(r, 15000));

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    async function runLighthouse(url) {
        const chrome = await chromeLauncher.launch({
            chromeFlags: [
                "--headless",
                "--no-sandbox",
                "--disable-gpu",
                "--disable-dev-shm-usage",
                "--disable-cache"
            ],
        });
        childProcesses.push(chrome);

        const options = {
            logLevel: "error",
            output: "json",
            port: chrome.port,
            formFactor: "desktop",
            disableStorageReset: false,
            screenEmulation: {
                mobile: false,
                width: 1920,
                height: 1080,
                deviceScaleFactor: 1,
                disabled: false,
            },
        };

        const runnerResult = await lighthouse(url, options);
        const lhr = runnerResult.lhr;

        const scores = {
            performance: Math.round(lhr.categories.performance.score * 100),
            accessibility: Math.round(lhr.categories.accessibility.score * 100),
            bestPractices: Math.round(lhr.categories["best-practices"].score * 100),
            seo: Math.round(lhr.categories.seo.score * 100),

            metrics: {
                FCP: lhr.audits["first-contentful-paint"].displayValue,
                LCP: lhr.audits["largest-contentful-paint"].displayValue,
                SpeedIndex: lhr.audits["speed-index"].displayValue,
                TTI: lhr.audits["interactive"].displayValue,
                TBT: lhr.audits["total-blocking-time"].displayValue,
                CLS: lhr.audits["cumulative-layout-shift"].displayValue,
            }
        };

        await chrome.kill();

        return scores;
    }

    let pagesTexContent = '';

    for (const file of htmlFiles) {
        const url = `http://localhost:${PORT}/${file}`;

        pagesTexContent += `\\section{\\texttt{${file}}}

    \\subsection{Screenshots}
    `

        for (const vp of viewports) {
            await page.setViewport({ width: vp.width, height: vp.height });

            const filename =
            vp.label === "default"
                ? `${file}.png`
                : `${file}-${vp.width}x${vp.height}.png`;

            const outputPath = path.join(OUTPUT_ROOT, filename);
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });

            await page.goto(url, { waitUntil: "networkidle0" });
            await page.screenshot({ path: outputPath, clip: { x: 0, y: 0, width: vp.width, height: vp.height } });

            console.log("✔", filename);

            pagesTexContent += `\\begin{figure}[H]
        \\includegraphics[width=\\linewidth, height=0.85\\paperheight, keepaspectratio]{${outputPath}}
        \\caption{${file} ${vp.width}x${vp.height}px}
        \\label{fig:${file}-${vp.width}x${vp.height}}
    \\end{figure}
    `
        }
        pagesTexContent += `\\subsection{HTML Source Code}

    \\inputmintedstyled{html}{${file}}

    \\newpage
    `
    }

    const pagesOutputFile = "pages.tex";
    fs.mkdirSync(path.dirname(pagesOutputFile), { recursive: true });
    fs.writeFileSync(pagesOutputFile, pagesTexContent);
    console.log("LaTeX file created:", pagesOutputFile);

    let lighthouseReportTexContent = `% Automatically generated Lighthouse report for all pages\n\n`;

    for (const file of htmlFiles) {
        const url = `http://localhost:${PORT}/${file}`;
        const result = await runLighthouse(url);

        lighthouseReportTexContent += `\\section{\\texttt{${file}}}

    \\begin{table}[H]
    \\centering
    \\caption{Lighthouse Scores for ${file}}
    \\begin{tabular}{|l|c|}
    \\hline
    Category & Score \\\\ \\hline
    Performance & ${result.performance} \\\\ \\hline
    Accessibility & ${result.accessibility} \\\\ \\hline
    Best Practices & ${result.bestPractices} \\\\ \\hline
    SEO & ${result.seo} \\\\ \\hline
    \\end{tabular}
    \\end{table}

    \\begin{table}[H]
    \\centering
    \\caption{Lighthouse Metrics for ${file}}
    \\begin{tabular}{|l|c|}
    \\hline
    Metric & Value \\\\ \\hline
    FCP & ${result.metrics.FCP} \\\\ \\hline
    LCP & ${result.metrics.LCP} \\\\ \\hline
    SpeedIndex & ${result.metrics.SpeedIndex} \\\\ \\hline
    TTI & ${result.metrics.TTI} \\\\ \\hline
    TBT & ${result.metrics.TBT} \\\\ \\hline
    CLS & ${result.metrics.CLS} \\\\ \\hline
    \\end{tabular}
    \\end{table}
    `;

        console.log("✔", file);
    }

    const lighthouseReportOutputFile = "lighthouse_reports.tex";
    fs.mkdirSync(path.dirname(lighthouseReportOutputFile), { recursive: true });
    fs.writeFileSync(lighthouseReportOutputFile, lighthouseReportTexContent);
    console.log("LaTeX file created:", lighthouseReportOutputFile);
} catch (err) {
    console.error("❌ ERROR:", err);
} finally {
    cleanup();
}