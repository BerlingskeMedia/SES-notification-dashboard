function BasicFilter(attribute_name, operator, argument_name, argument_value) {
    this.attribute_name = attribute_name;
    this.argument_name = argument_name;
    this.operator = operator;
    this.argument_value = argument_value;

    this.formula = "%attribute %operator %argument";

    this.toString = function(){
        var returned_string = this.formula;
        returned_string = returned_string.replace("%attribute", "#"+this.argument_name);
        returned_string = returned_string.replace("%operator", this.operator);
        returned_string = returned_string.replace("%argument", ":"+this.argument_name);

        return returned_string;
    };

    this.toAttributeValues = function(){
        var returned_object = [];
        returned_object[":"+this.argument_name] = this.argument_value;

        return returned_object;
    };

    this.toAttributeNames = function(){
        var returned_object = [];
        returned_object["#"+this.argument_name] = this.attribute_name;

        return returned_object;
    };
}

function MethodFilter(attribute_name, operator, argument_name, argument_value) {
    BasicFilter.call(this, attribute_name, operator, argument_name, argument_value);

    this.formula = "%operator(%attribute, %argument)";
}

function TripleFilter(attribute_name, operator, argument_name, arguments, argument_concation) {
    BasicFilter.call(this, attribute_name, operator, argument_name);

    this.argument_concation = (typeof argument_concation !== "undefined") ? argument_concation : "AND";
    this.argument0 = arguments[0];
    this.argument1 = arguments[1];

    this.formula = "%attribute %operator %argument0 %argument_concation %argument1";

    this.toString = function(){
        var returned_string = this.formula;
        returned_string = returned_string.replace("%attribute", "#"+this.attribute_name);
        returned_string = returned_string.replace("%operator", this.operator);
        returned_string = returned_string.replace("%argument0", ":"+this.argument_name+"0");
        returned_string = returned_string.replace("%argument_concation", this.argument_concation);
        returned_string = returned_string.replace("%argument1", ":"+this.argument_name+"1");

        return returned_string;
    };

    this.toAttributeValues = function(){
        var returned_object = [];
        returned_object[":"+this.argument_name+"0"] = this.argument0;
        returned_object[":"+this.argument_name+"1"] = this.argument1;

        return returned_object;
    };
}

function QueryConstructor(operators, concation) {
    this.operators = operators;
    this.concation = (typeof concation !== "undefined") ? concation : "AND";

    this.build = function(){
        var returned_string = "";
        var returned_attribute_values = [];
        var returned_attribute_names = [];

        for(var operator in this.operators) {
            if(returned_string.length > 0) {
                returned_string += " "+this.concation+" ";
            }

            returned_string += operators[operator].toString();
            var attributeValues = operators[operator].toAttributeValues();
            var attributeNames = operators[operator].toAttributeNames();


            for(var item in attributeValues)
            {
                returned_attribute_values[item] = attributeValues[item];
            }

            for(var item in attributeNames)
            {
                returned_attribute_names[item] = attributeNames[item];
            }
        }

        this.parsedQuery = returned_string;
        this.parsedAttributeValues = returned_attribute_values;
        this.parsedAttributeNames = returned_attribute_names;
    };
}

var factory = {};

factory.CreateOperator = function(type, params) {
    if(type === "MethodFilter")
        return new MethodFilter(params["attribute_name"], params["operator"], params["argument_name"], params["argument_value"]);
    if(type === "TripleFilter")
        return new TripleFilter(params["attribute_name"], params["operator"], params["argument_name"], params["argument_value"]);

    return new BasicFilter(params["attribute_name"], params["operator"], params["argument_name"], params["argument_value"]);
};

factory.CreateQueryConstructor = function(operators, concation) {
    return new QueryConstructor(operators, concation);
};

module.exports = factory;