export enum SortOrder {
    desc = -1,
    asc = 1,
}

export function arrayStringFieldNaturalSorter(
    property: string,
    fallbackProperty?: string,
    secondFallbackProperty?: string,
    sortOrder = SortOrder.asc,
) {
    return (a: any, b: any) => {
        let result;
        if (fallbackProperty && !secondFallbackProperty) {
            const aProperty = a[property] || a[fallbackProperty];
            const bProperty = b[property] || b[fallbackProperty];
            result = aProperty.localeCompare(bProperty, navigator.languages[0] || navigator.language, {
                numeric: true,
                ignorePunctuation: true,
                sensitivity: "base",
            });
        } else if (fallbackProperty && secondFallbackProperty) {
            const aProperty = a[property] || a[fallbackProperty] || a[secondFallbackProperty];
            const bProperty = b[property] || b[fallbackProperty] || b[secondFallbackProperty];
            result = aProperty.localeCompare(bProperty, navigator.languages[0] || navigator.language, {
                numeric: true,
                ignorePunctuation: true,
                sensitivity: "base",
            });
        } else {
            result = a[property].localeCompare(b[property], navigator.languages[0] || navigator.language, {
                numeric: true,
                ignorePunctuation: true,
                sensitivity: "base",
            });
        }

        return result * sortOrder;
    };
}

export function arrayStringValueAscNaturalSorter(a: string, b: string, sortOrder = SortOrder.asc) {
    const result = a.localeCompare(b, navigator.languages[0] || navigator.language, {
        numeric: true,
        ignorePunctuation: true,
        sensitivity: "base",
    });

    return result * sortOrder;
}

export function dynamicSort(subject: string, property: string, sortOrder = SortOrder.asc) {
    return (a: any, b: any) => {
        const result =
            a[subject][property] < b[subject][property] ? -1 : a[subject][property] > b[subject][property] ? 1 : 0;
        return result * sortOrder;
    };
}

export function simpleDynamicSort(property: string, sortOrder = SortOrder.asc) {
    return (a: any, b: any) => {
        const result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
        return result * sortOrder;
    };
}
