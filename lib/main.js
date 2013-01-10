var getConfPaths = function() {
    var paths;

    if("win32" === process.platform) paths = [path.join(process.env["USERPROFILE"], "jejune")];
    else paths = [path.join(process.env["HOME"], ".jejune"), "/etc/jejune"];

    paths.push(path.join(__dirname, ".."));

    return paths;
};

var _ = require("underscore"),
    fs = require("fs"),
    path = require("path"),
    conf = (function() {
        var defaults = {
            numbers: true,
            wings: true,
            literacy: 0.65
        };
        var paths = getConfPaths();

        for(var i = 0; i < paths.length; i++) {
            try {
                _.extend(defaults, require(path.join(paths[i], "conf.json")));
            } catch(e) { }
        }

        return defaults;
    })();

var capitalize = function(string) {
    return string.replace(/(?:^|\s)\S/g, function(a) {
        return a.toUpperCase();
    });
};

var misspell = function(string, literacy) {
    // Replace a random vowel with another vowel.
    return string.replace(/[aeiou]+/g, function(a) {
        if(Math.random() > literacy) return "aeiou"[Math.floor(Math.random() * 5)];
        else return a;
    });
};

var getGeneratorSets = function() {
    var paths = getConfPaths();
    var sets = [];

    for(var i = 0; i < paths.length; i++) paths[i] = path.join(paths[i], "generators");

    for(var i = 0; i < paths.length; i++) {
        if(fs.existsSync(paths[i])) sets.push(fs.readdirSync(paths[i]));
        else sets.push([]);
    }

    return sets;
};

var getGeneratorList = function() {
    var list = [];
    var sets = getGeneratorSets();

    for(var i = 0; i < sets.length; i++) {
        var set = sets[i];

        if(set) {
            for(var j = 0; j < set.length; j++) list.push(path.basename(set[j]));
        }
    }

    return list;
};

var getGenerator = function(name) {
    var paths = getConfPaths();
    var sets = getGeneratorSets();
    var list = getGeneratorList();

    for(var i = 0; i < sets.length; i++) {
        var set = sets[i];

        if(set) {
            for(var j = 0; j < set.length; j++) {
                if(set[j] == name + ".json") {
                    return require(path.join(paths[i], "generators", set[j]));
                }
            }
        }
    }

    throw "No such generator " + name + " in [" + paths.join(", ") + "]";
};

var getRandomGenerator = function() {
    var paths = getConfPaths();
    var sets = getGeneratorSets();
    var list = getGeneratorList();

    if(!list.length) throw "Can't generate a random username without any generators";

    var name = list[Math.floor(Math.random() * list.length)];

    for(var i = 0; i < sets.length; i++) {
        var set = sets[i];

        if(set) {
            for(var j = 0; j < set.length; j++) {
                if(set[j] == name) {
                    return require(path.join(paths[i], "generators", set[j]));
                }
            }
        }
    }

    throw "No such generator " + name + " in [" + paths.join(", ") + "]";
};

module.exports = function(generators) {
    var generator;

    if(!generators) generator = getRandomGenerator();
    else if(generators instanceof Array) {
        var names = [];

        for(var i = 0; i < generators.length; i++) names.push(module.exports(generators[i]));

        return names;
    } else if("object" === typeof generators) generator = generators;
    else generator = getGenerator(generators);


    var username = "",
        wings = generator.wings[Math.floor(Math.random() * generator.wings.length)],
        prefix = wings[0];
        suffix = wings[1],
        chain = generator.parts,
        parts = _.keys(chain),
        useWings = Math.random() > 0.7; // random chance of having wings (e.g. xX Xx)

    if(useWings && prefix) username += prefix;

    var part = null,
        out = [];

    while(true) {
        if(!part) part = parts[Math.floor(Math.random() * parts.length)];
        if(out.indexOf(part) != -1) break;

        out.push(part);

        if(Math.random() > 0.95) break;
        if(chain[part].length < 1) break;

        part = chain[part][Math.floor(Math.random() * chain[part].length)];
    }

    for(var i = 0; i < out.length; i++) {
        part = out[i];

        // Capitalize words 70% of the time
        if(Math.random() > 0.3) part = capitalize(part);
        // 40% have spell check off but might still spell it correctly
        if(Math.random() > 0.6) part = misspell(part, conf.literacy || Math.random());

        out[i] = part;
    }

    var ranges = generator.numbers.ranges,
        births = generator.numbers.births,
        voodoo = generator.numbers.voodoo,
        hasNumber = "boolean" === typeof conf.numbers ? (conf.numbers ? Math.random() > 0.3 : false) : Math.random() > 0.3,
        number = null;

    if(hasNumber) {
        while(true) {
            if(Math.random() > 0.6) number = _.random(births[0], births[1]).toString().substr(2, 2);
            else {
                var range = ranges[Math.floor(Math.random() * ranges.length)];
                number = _.random(range[0], range[1]);
            }

            if(voodoo.indexOf(number) == -1) break;
        }

        if(Math.random() > 0.8) {
            username += number;
            number = null;
        }
    }

    username += out.join(Math.random() > 0.9 ? "_" : "");

    if(number) username += number;
    if(useWings && suffix) username += prefix;

    return username;
};
