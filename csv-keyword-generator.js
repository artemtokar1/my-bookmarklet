(() => {

if (document.getElementById("seo-keyword-generator")) return;

const popup = document.createElement("div");
popup.id = "seo-keyword-generator";

popup.style = `position:fixed;
top:20px;
right:20px;
width:620px;
max-height:94vh;
background:#111;
color:#fff;
z-index:999999;
padding:18px;
border-radius:16px;
box-shadow:0 0 28px rgba(0,0,0,.45);
font-family:Arial,sans-serif;
display:flex;
flex-direction:column;
gap:14px;
overflow:hidden;`;

popup.innerHTML = `

<div style="
display:flex;
justify-content:space-between;
align-items:center;
">

```
<div style="
    font-size:20px;
    font-weight:bold;
">
    SEO Keyword Generator
</div>

<button id="seo-close-btn" style="
    background:#222;
    color:#fff;
    border:none;
    width:32px;
    height:32px;
    border-radius:8px;
    cursor:pointer;
    font-size:15px;
    flex-shrink:0;
">✕</button>
```

</div>

<div style="
font-size:15px;
opacity:.92;
line-height:1.75;
padding:2px 2px 0;
">
Якщо бренд можна писати окремо — використовуй <b>CamelCase</b>.<br>
Наприклад: <b>RichRoyal</b>, <b>SlotsHopper</b>, <b>GladiatorsBet</b>
</div>

<textarea 
id="seo-input"
spellcheck="false"
style="
width:100%;
height:500px;
resize:none;
background:#1a1a1a;
color:#fff;
border:1px solid #333;
border-radius:12px;
padding:14px;
font-size:15px;
line-height:1.8;
box-sizing:border-box;
white-space:pre-wrap;
outline:none;
font-family:Consolas, monospace;
"></textarea>

<button id="seo-generate-btn" style="
height:50px;
border:none;
border-radius:12px;
background:#2e7dff;
color:#fff;
font-weight:bold;
cursor:pointer;
font-size:16px;
transition:.15s;
">
Generate CSV </button>
`;

document.body.appendChild(popup);

const textarea = document.getElementById("seo-input");

textarea.placeholder =
"RichRoyal\n" +
"https://richroyal.com/\n" +
"https://richroyal.com/bonus/\n" +
"https://richroyal.com/app/\n" +
"\n" +
"SlotsHopper\n" +
"https://slots-hopper1-it.com/\n" +
"https://slots-hopper1-it.com/app/\n" +
"https://slots-hopper1-it.com/bonus/\n" +
"\n" +
"GladiatorsBet\n" +
"https://gladiatorsbet.com/\n" +
"https://gladiatorsbet.com/app/";

document.getElementById("seo-close-btn").onclick = () => {
popup.remove();
};

document.getElementById("seo-generate-btn").onmouseenter = () => {
document.getElementById("seo-generate-btn").style.opacity = ".9";
};

document.getElementById("seo-generate-btn").onmouseleave = () => {
document.getElementById("seo-generate-btn").style.opacity = "1";
};

function hasCasinoWord(text) {

```
text = text.toLowerCase();

return [
    "casino",
    "kazino",
    "kasyno",
    "kaszino"
].some(word => text.includes(word));
```

}

function splitBrand(brand) {

```
const parts = brand.match(/[A-Z][a-z]*|\d+/g) || [];

const compressed = parts.join("").toLowerCase();

const split = parts.length > 1
    ? parts.map(p => p.toLowerCase()).join(" ")
    : null;

return {
    compressed,
    split
};
```

}

function getMainKeys(brand, domain) {

```
const { compressed, split } = splitBrand(brand);

const keys = [];

keys.push(compressed);

if (!hasCasinoWord(brand)) {
    keys.push(`${compressed} casino`);
}

if (split) {
    keys.push(split);
}

const digits = domain.replace(/\D/g, "");

if (digits) {
    keys.push(`${compressed}${digits}`);
}

return [...new Set(keys)];
```

}

function getMainUrl(urls) {

```
for (const url of urls) {

    try {

        const path = new URL(url).pathname;

        if (path === "/" || path === "") {
            return url;
        }

    } catch(e){}
}

return urls[0];
```

}

document.getElementById("seo-generate-btn").onclick = () => {

```
const text = textarea.value.trim();

if (!text) {
    alert("Insert data first");
    return;
}

const lines = text
    .split("\n")
    .map(x => x.trim())
    .filter(Boolean);

const INTERNAL_PATHS = {
    bonus: ["bonus", "offers", "promo", "promotions", "boni", "bono"],
    app: ["app", "shortcut", "mobile-app"],
    login: ["login", "registration-login"]
};

const brandDomainMap = {};

let currentBrand = null;

for (const line of lines) {

    if (!line.startsWith("http")) {

        currentBrand = line;

        if (!brandDomainMap[currentBrand]) {
            brandDomainMap[currentBrand] = {};
        }

        continue;
    }

    if (!currentBrand) continue;

    let domain;

    try {
        domain = new URL(line).hostname;
    } catch(e){
        continue;
    }

    if (!brandDomainMap[currentBrand][domain]) {
        brandDomainMap[currentBrand][domain] = [];
    }

    brandDomainMap[currentBrand][domain].push(line);
}

const rows = [];

for (const brand in brandDomainMap) {

    const { compressed } = splitBrand(brand);

    for (const domain in brandDomainMap[brand]) {

        const urls = brandDomainMap[brand][domain];

        const mainUrl = getMainUrl(urls);

        const mainKeys = getMainKeys(brand, domain);

        for (const key of mainKeys) {

            rows.push([
                domain,
                key,
                1,
                "main",
                mainUrl,
                hasCasinoWord(brand)
                    ? brand
                    : `${brand} Casino`,
                10
            ]);
        }

        const added = new Set();

        for (const url of urls) {

            let path = "";

            try {
                path = new URL(url).pathname.toLowerCase();
            } catch(e){}

            for (const group in INTERNAL_PATHS) {

                const keywords = INTERNAL_PATHS[group];

                if (keywords.some(k => path.includes(k))) {

                    const internalKey =
                        group === "login"
                        ? `${compressed} login`
                        : `${compressed} ${group}`;

                    const unique = internalKey + url;

                    if (added.has(unique)) continue;

                    added.add(unique);

                    rows.push([
                        domain,
                        internalKey,
                        1,
                        group,
                        url,
                        hasCasinoWord(brand)
                            ? brand
                            : `${brand} Casino`,
                        10
                    ]);

                    break;
                }
            }
        }
    }
}

let csv =
```

`Название проекта,Ключевое слово,Приоритет,Семантическая группа,Целевой урл,Категория семантической группы,Число поисков по Google\n`;

```
rows.forEach(row => {
    csv += row.map(x => '"' + x + '"').join(",") + "\n";
});

const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
});

const a = document.createElement("a");

a.href = URL.createObjectURL(blob);

a.download = "final_keywords.csv";

a.click();
```

};

})();
