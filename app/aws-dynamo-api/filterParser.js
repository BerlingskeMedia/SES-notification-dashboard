function filter(formula) {
    return function (attribute_name, operator, argument_name) {
        return formula.replace("%attribute", attribute_name)
            .replace("%operator", operator)
            .replace("%argument", argument_name);
    }
}

function toAttributeValues(name, values) {
    return function () {
        return ((typeof values !== "object") ? [values] : [...values])
            .map(function(item, i) { return ":"+name+""+i; })
            .join(" AND ");
    }
}

function toAttributeValuesMap(name, values) {
    return function () {
        let arr = [];
        ((typeof values !== "object") ? [values] : [...values]).forEach(function(item, i){
            arr[":"+name+""+i] = item;
        });
        return arr;
    }
}

function toAttributeNames(attribute_absolute) {
    return function () {
        return attribute_absolute.split(".")
            .map(function(item) { return "#"+item; })
            .join(".");
    }
}

function toAttributeNamesMap(attribute_absolute) {
    return function () {
        let arr = [];
        for (const value of attribute_absolute.split(".")) {
            arr["#"+value] = value;
        }
        return arr;
    }
}

function filterParser(definitions, key_attributes){
    return function(filters){
        return Object.keys(filters).map(function(item) {
            return {
                is_key_attribute: ((key_attributes.indexOf(definitions[item]["attribute"]) !== -1)),
                attribute: definitions[item]["attribute"],
                operator: definitions[item]["operator"],
                formula: definitions[item]["formula"],
                values: filters[item],
                attributeNamesMap: toAttributeNamesMap(definitions[item]["attribute"])(),
                attributeValuesMap: toAttributeValuesMap(item,filters[item])(),
                filter: filter(definitions[item]["formula"])(toAttributeNames(definitions[item]["attribute"])(),definitions[item]["operator"],toAttributeValues(item,filters[item])()),
            };
        });
    };
}

function parsedFiltersExpressionConcator(parsedFilters, is_key){
    return parsedFilters
        .filter(function(item) { return item.is_key_attribute === is_key; })
        .map(function(item) { return item.filter; })
        .join(" AND ");
}

function parsedFiltersAttributeNamesConcator(parsedFilters){
    let arr = [];

    parsedFilters.forEach(function(item){
        Object.keys(item.attributeNamesMap).forEach(function(key){
            arr[key] = item.attributeNamesMap[key];
        });
    });

    return arr;
}

function parsedFiltersAttributeValuesConcator(parsedFilters){
    let arr = [];

    parsedFilters.forEach(function(item){
        Object.keys(item.attributeValuesMap).forEach(function(key){
            arr[key] = item.attributeValuesMap[key];
        });
    });

    return arr;
}

let parser = {};
parser.Parse = function (definitions, keys, filters) {
    return filterParser(definitions, keys)(filters);
};

parser.KeyConditionExpression = function(parsedFilters) {
    return parsedFiltersExpressionConcator(parsedFilters, true);
};

parser.FilterExpression = function(parsedFilters) {
    return parsedFiltersExpressionConcator(parsedFilters, false);
};

parser.ExpressionAttributeNames = function(parsedFilters) {
    return parsedFiltersAttributeNamesConcator(parsedFilters);
};

parser.ExpressionAttributeValues = function(parsedFilters) {
    return parsedFiltersAttributeValuesConcator(parsedFilters);
};

module.exports = parser;