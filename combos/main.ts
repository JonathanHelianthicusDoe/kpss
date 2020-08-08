(function () {
    let calledMain = false;
    document.addEventListener("readystatechange", () => {
        if (
            !calledMain &&
            (document.readyState === "interactive" ||
                document.readyState === "complete")
        ) {
            calledMain = true;
            main();
        }
    });
})();

// ================================================================ //

class Gag {
    public constructor(
        public type: string,
        public level: number,
        public organic: boolean,
    ) {}
}

type Combos = [
    [Gag][],
    [Gag, Gag][],
    [Gag, Gag, Gag][],
    [Gag, Gag, Gag, Gag][],
][];

class Options {
    _maxOrgThrow: number;
    _maxOrgSquirt: number;
    _maxOrgDrop: number;

    _minCogLvl: number;
    _maxCogLvl: number;

    _minNumGags: number;
    _maxNumGags: number;

    public constructor(
        maxOrgThrow_ = 4,
        maxOrgSquirt_ = 4,
        maxOrgDrop_ = 4,

        minCogLvl_ = 7,
        maxCogLvl_ = 12,

        minNumGags_ = 1,
        maxNumGags_ = 4,
    ) {
        this._maxOrgThrow = clamp(maxOrgThrow_, 0, 4);
        this._maxOrgSquirt = clamp(maxOrgSquirt_, 0, 4);
        this._maxOrgDrop = clamp(maxOrgDrop_, 0, 4);

        this._minCogLvl = clamp(minCogLvl_, 7, 12);
        this._maxCogLvl = clamp(maxCogLvl_, 7, 12);
        if (this._minCogLvl > this._maxCogLvl) {
            this._minCogLvl = this._maxCogLvl;
        }

        this._minNumGags = clamp(minNumGags_, 1, 4);
        this._maxNumGags = clamp(maxNumGags_, 1, 4);
        if (this._minNumGags > this._maxNumGags) {
            this._minNumGags = this._maxNumGags;
        }
    }

    get maxOrgThrow(): number {
        return this._maxOrgThrow;
    }
    set maxOrgThrow(maxOrgThrow_: number) {
        this._maxOrgThrow = clamp(maxOrgThrow_, 0, 4);
    }

    get maxOrgSquirt(): number {
        return this._maxOrgSquirt;
    }
    set maxOrgSquirt(maxOrgSquirt_: number) {
        this._maxOrgSquirt = clamp(maxOrgSquirt_, 0, 4);
    }

    get maxOrgDrop(): number {
        return this._maxOrgDrop;
    }
    set maxOrgDrop(maxOrgDrop_: number) {
        this._maxOrgDrop = clamp(maxOrgDrop_, 0, 4);
    }

    get minCogLvl(): number {
        return this._minCogLvl;
    }
    set minCogLvl(minCogLvl_: number) {
        this._minCogLvl = Math.min(clamp(minCogLvl_, 7, 12), this._maxCogLvl);
    }

    get maxCogLvl(): number {
        return this._maxCogLvl;
    }
    set maxCogLvl(maxCogLvl_: number) {
        this._maxCogLvl = Math.max(clamp(maxCogLvl_, 7, 12), this._minCogLvl);
    }

    get minNumGags(): number {
        return this._minNumGags;
    }
    set minNumGags(minNumGags_: number) {
        this._minNumGags = Math.min(
            clamp(minNumGags_, 1, 4),
            this._maxNumGags,
        );
    }

    get maxNumGags(): number {
        return this._maxNumGags;
    }
    set maxNumGags(maxNumGags_: number) {
        this._maxNumGags = Math.max(
            clamp(maxNumGags_, 1, 4),
            this._minNumGags,
        );
    }

    public okCombo(combo: Gag[]): boolean {
        let numOrgThrow = 0;
        let numOrgSquirt = 0;
        let numOrgDrop = 0;
        for (const gag of combo) {
            if (gag.organic) {
                switch (gag.type) {
                    case "throw":
                        ++numOrgThrow;
                        break;
                    case "squirt":
                        ++numOrgSquirt;
                        break;
                    case "drop":
                        ++numOrgDrop;
                        break;
                }
            }
        }

        return (
            numOrgThrow <= this._maxOrgThrow &&
            numOrgSquirt <= this._maxOrgSquirt &&
            numOrgDrop <= this._maxOrgDrop
        );
    }
}

const GAG_NAMES: Map<string, string[]> = new Map();
GAG_NAMES.set("throw", [
    "Cupcake",
    "Fruit Pie Slice",
    "Cream Pie Slice",
    "Fruit Pie",
    "Cream Pie",
    "Birthday Cake",
    "Wedding Cake",
]);
GAG_NAMES.set("squirt", [
    "Squirting Flower",
    "Glass Of Water",
    "Squirtgun",
    "Seltzer Bottle",
    "Fire Hose",
    "Storm Cloud",
    "Geyser",
]);
GAG_NAMES.set("drop", [
    "Flowerpot",
    "Sandbag",
    "Anvil",
    "Big Weight",
    "Safe",
    "Grand Piano",
    "Toontanic",
]);

const SPACE_RE = / /g;

/** We assume that everyone has maxed their gag tracks. */
const TRACK_EXP = (7 - 1) * 10;

function main(): void {
    fetch("./combos.json")
        .then(res => res.json())
        .then(combosObj => {
            const maxOrgThrow = document.getElementById(
                "maxOrgThrow",
            ) as HTMLInputElement;
            const maxOrgSquirt = document.getElementById(
                "maxOrgSquirt",
            ) as HTMLInputElement;
            const maxOrgDrop = document.getElementById(
                "maxOrgDrop",
            ) as HTMLInputElement;

            const minCogLvl = document.getElementById(
                "minCogLvl",
            ) as HTMLInputElement;
            const maxCogLvl = document.getElementById(
                "maxCogLvl",
            ) as HTMLInputElement;

            const minNumGags = document.getElementById(
                "minNumGags",
            ) as HTMLInputElement;
            const maxNumGags = document.getElementById(
                "maxNumGags",
            ) as HTMLInputElement;

            const opts = new Options(
                +maxOrgThrow.value ? +maxOrgThrow.value : undefined,
                +maxOrgSquirt.value ? +maxOrgSquirt.value : undefined,
                +maxOrgDrop.value ? +maxOrgDrop.value : undefined,

                +minCogLvl.value ? +minCogLvl.value : undefined,
                +maxCogLvl.value ? +maxCogLvl.value : undefined,

                +minNumGags.value ? +minNumGags.value : undefined,
                +maxNumGags.value ? +maxNumGags.value : undefined,
            );

            maxOrgThrow.addEventListener("change", e => {
                const target = e.target as HTMLInputElement;
                const val = +target.value;
                opts.maxOrgThrow = val;
                if (val !== opts.maxOrgThrow) {
                    target.value = opts.maxOrgThrow.toString(10);
                }

                renderTable(combosObj as Combos, opts);
            });
            maxOrgSquirt.addEventListener("change", e => {
                const target = e.target as HTMLInputElement;
                const val = +target.value;
                opts.maxOrgSquirt = val;
                if (val !== opts.maxOrgSquirt) {
                    target.value = opts.maxOrgSquirt.toString(10);
                }

                renderTable(combosObj as Combos, opts);
            });
            maxOrgDrop.addEventListener("change", e => {
                const target = e.target as HTMLInputElement;
                const val = +target.value;
                opts.maxOrgDrop = val;
                if (val !== opts.maxOrgDrop) {
                    target.value = opts.maxOrgDrop.toString(10);
                }

                renderTable(combosObj as Combos, opts);
            });

            minCogLvl.addEventListener("change", e => {
                const target = e.target as HTMLInputElement;
                const val = +target.value;
                opts.minCogLvl = val;
                if (val !== opts.minCogLvl) {
                    target.value = opts.minCogLvl.toString(10);
                }

                renderTable(combosObj as Combos, opts);
            });
            maxCogLvl.addEventListener("change", e => {
                const target = e.target as HTMLInputElement;
                const val = +target.value;
                opts.maxCogLvl = val;
                if (val !== opts.maxCogLvl) {
                    target.value = opts.maxCogLvl.toString(10);
                }

                renderTable(combosObj as Combos, opts);
            });

            minNumGags.addEventListener("change", e => {
                const target = e.target as HTMLInputElement;
                const val = +target.value;
                opts.minNumGags = val;
                if (val !== opts.minNumGags) {
                    target.value = opts.minNumGags.toString(10);
                }

                renderTable(combosObj as Combos, opts);
            });
            maxNumGags.addEventListener("change", e => {
                const target = e.target as HTMLInputElement;
                const val = +target.value;
                opts.maxNumGags = val;
                if (val !== opts.maxNumGags) {
                    target.value = opts.maxNumGags.toString(10);
                }

                renderTable(combosObj as Combos, opts);
            });

            renderTable(combosObj as Combos, opts);
        })
        .catch(err => console.error(err));
}

function clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
}

function gagName(gag: Gag): string {
    const gagNames = GAG_NAMES.get(gag.type);
    if (gagNames === undefined) {
        throw `GAG_NAMES.get(${gag.type}) is undefined`;
    }

    return `${gag.organic ? "Organic " : ""}${gagNames[gag.level - 1]}`;
}

function gagImgFilename(gag: Gag): string {
    const gagNames = GAG_NAMES.get(gag.type);
    if (gagNames === undefined) {
        throw `GAG_NAMES.get(${gag.type}) is undefined`;
    }

    return `./img/${gagNames[gag.level - 1]
        .toLowerCase()
        .replace(SPACE_RE, "_")}${gag.organic ? "_org" : ""}.png`;
}

function getTgtDef(cogLvl: number): number {
    return (cogLvl - 1) * -5;
}

/**
 * If a `number` is returned, this `number` represents the accuracy of the
 * combo. If a pair is returned, the first element is the accuracy of the
 * combo, and the second is the effective accuracy of the combo given that
 * exactly one multi-target toonup gag is used with it.
 */
function comboAcc(cogLvl: number, combo: Gag[]): number | [number, number] {
    let throws = 0;
    let squirts = 0;
    let drops = 0;

    for (const gag of combo) {
        switch (gag.type) {
            case "throw":
                ++throws;
                break;
            case "squirt":
                ++squirts;
                break;
            case "drop":
                ++drops;
                break;
        }
    }

    const tgtDef = getTgtDef(cogLvl);

    /**
     * Calculates the accuracy of the whole combo hitting, given that the
     * multi-target toonup misses (or is not used at all) **OR** given that
     * toonup hits, depending on the value of `toonupHit`.
     */
    function calcAcc(toonupHit: boolean): number {
        let acc = 1.0;
        let bonus = toonupHit ? 20 : 0;

        if (throws > 0) {
            const throwAcc = Math.min(75 + TRACK_EXP + tgtDef + bonus, 95);

            acc *= throwAcc;
            acc /= 100;
        }
        bonus += 20 * throws;

        if (squirts > 0) {
            acc *= 0.95;
        }
        bonus += 20 * squirts;

        if (drops > 0) {
            const dropAcc = Math.min(50 + TRACK_EXP + tgtDef + bonus, 95);

            acc *= dropAcc;
            acc /= 100;
        }

        return acc;
    }

    const accNoTu = calcAcc(false);
    if (combo.length < 4) {
        return [accNoTu, 0.95 * calcAcc(true) + accNoTu / 20];
    } else {
        return accNoTu;
    }
}

function renderTable(combos: Combos, options: Options): void {
    const table = document.createElement("table");

    const thead = table.createTHead();
    const theadRow = thead.insertRow();
    {
        const th = document.createElement("th");
        const thText = document.createTextNode("Cog level");
        th.appendChild(thText);
        th.setAttribute("scope", "col");
        theadRow.appendChild(th);
    }
    for (
        let numGags = options.minNumGags;
        numGags <= options.maxNumGags;
        ++numGags
    ) {
        const th = document.createElement("th");
        const thText = document.createTextNode(
            `${numGags} gag${numGags === 1 ? "" : "s"}`,
        );
        th.appendChild(thText);
        th.setAttribute("scope", "col");
        theadRow.appendChild(th);
    }

    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
    for (
        let cogLvl = options.minCogLvl;
        cogLvl <= options.maxCogLvl;
        ++cogLvl
    ) {
        const row = tbody.insertRow();
        const th = document.createElement("th");
        const thText = document.createTextNode(`Level ${cogLvl}`);
        th.appendChild(thText);
        th.setAttribute("scope", "row");
        row.appendChild(th);

        for (
            let numGags = options.minNumGags;
            numGags <= options.maxNumGags;
            ++numGags
        ) {
            const cell = row.insertCell();
            const comboListing = document.createElement("ol");
            comboListing.classList.add("combo-listing");
            for (const combo of combos[cogLvl][numGags - 1]) {
                if (!options.okCombo(combo)) {
                    continue;
                }

                const comboLi = document.createElement("li");
                const comboUl = document.createElement("ul");
                comboUl.classList.add("combo-ul");
                for (const gag of combo) {
                    const gagLi = document.createElement("li");
                    const gagImg = document.createElement("img");
                    gagImg.setAttribute("src", gagImgFilename(gag));
                    const name = gagName(gag);
                    gagImg.setAttribute("alt", name);
                    gagImg.setAttribute("title", name);
                    gagLi.appendChild(gagImg);
                    comboUl.appendChild(gagLi);
                }
                comboLi.appendChild(comboUl);

                const accDiv = document.createElement("div");
                accDiv.classList.add("acc-div");
                const acc = comboAcc(cogLvl, combo);
                if (typeof acc === "number") {
                    const accSpan = document.createElement("span");
                    accSpan.classList.add("acc-span");
                    const accText = document.createTextNode(
                        `${(100 * acc).toFixed(2)}%`,
                    );
                    accSpan.appendChild(accText);

                    accDiv.appendChild(accSpan);
                } else {
                    const accSpan = document.createElement("span");
                    accSpan.classList.add("acc-span");
                    accSpan.classList.add("plural");
                    const accText = document.createTextNode(
                        `${(100 * acc[0]).toFixed(2)}%`,
                    );
                    accSpan.appendChild(accText);

                    const accTuSpan = document.createElement("span");
                    accTuSpan.classList.add("acc-tu-span");
                    accTuSpan.classList.add("toonup");
                    const accTuText = document.createTextNode(
                        `${(100 * acc[1]).toFixed(2)}%`,
                    );
                    accTuSpan.appendChild(accTuText);

                    accDiv.appendChild(accSpan);
                    accDiv.appendChild(accTuSpan);
                }

                comboLi.appendChild(accDiv);
                comboListing.appendChild(comboLi);
            }
            cell.appendChild(comboListing);
        }
    }

    document.getElementById("combo-table")?.remove();
    table.setAttribute("id", "combo-table");
    document.getElementById("combo-table-container")?.appendChild(table);
}
