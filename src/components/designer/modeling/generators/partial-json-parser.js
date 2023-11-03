'use strict';

(function () {
  var parent = this,
      previousPartialParse = this.partialParse,
      tokenize = function tokenize(input) {
    var current = 0;
    var tokens = [];

    while (current < input.length) {
      var char = input[current];

      if (char === '\\') {
        current++;
        continue;
      }

      if (char === '{') {
        tokens.push({
          type: 'brace',
          value: '{'
        });

        current++;
        continue;
      }

      if (char === '}') {
        tokens.push({
          type: 'brace',
          value: '}'
        });

        current++;
        continue;
      }

      if (char === '[') {
        tokens.push({
          type: 'paren',
          value: '['
        });

        current++;
        continue;
      }

      if (char === ']') {
        tokens.push({
          type: 'paren',
          value: ']'
        });

        current++;
        continue;
      }

      if (char === ':') {
        tokens.push({
          type: 'separator',
          value: ':'
        });

        current++;
        continue;
      }

      if (char === ',') {
        tokens.push({
          type: 'delimiter',
          value: ','
        });

        current++;
        continue;
      }

      if (char === '"') {
        var value = '';
        var danglingQuote = false;

        char = input[++current];

        while (char !== '"') {
          if (current === input.length) {
            danglingQuote = true;
            break;
          }

          if (char === '\\') {
            current++;
            if (current === input.length) {
              danglingQuote = true;
              break;
            }
            value += char + input[current];
            char = input[++current];
          } else {
            value += char;
            char = input[++current];
          }
        }

        char = input[++current];

        if (!danglingQuote) {
          tokens.push({
            type: 'string',
            value: value
          });
        }
        continue;
      }

      var WHITESPACE = /\s/;
      if (WHITESPACE.test(char)) {
        current++;
        continue;
      }

      var NUMBERS = /[0-9]/;
      if (NUMBERS.test(char) || char === '-' || char === '.') {
        var _value = '';

        if (char === '-') {
          _value += char;
          char = input[++current];
        }

        while (NUMBERS.test(char) || char === '.') {
          _value += char;
          char = input[++current];
        }

        tokens.push({
          type: 'number',
          value: _value
        });
        continue;
      }

      var LETTERS = /[a-z]/i;
      if (LETTERS.test(char)) {
        var _value2 = '';

        while (LETTERS.test(char)) {
          if (current === input.length) {
            break;
          }
          _value2 += char;
          char = input[++current];
        }

        if (_value2 == 'true' || _value2 == 'false' || _value2=='null') {
          tokens.push({
            type: 'name',
            value: _value2
          });
        } else {
          throw new Error('Invalid token:', _value2 + ' is not a valid token!');
        }
        continue;
      }

      current++;
    }

    return tokens;
  },
      strip = function strip(tokens) {
    if (tokens.length === 0) {
      return tokens;
    }

    var lastToken = tokens[tokens.length - 1];

    switch (lastToken.type) {
      case 'separator':
        tokens = tokens.slice(0, tokens.length - 1);
        return strip(tokens);
        break;
      case 'number':
        var lastCharacterOfLastToken = lastToken.value[lastToken.value.length - 1];
        if (lastCharacterOfLastToken === '.' || lastCharacterOfLastToken === '-') {
          tokens = tokens.slice(0, tokens.length - 1);
          return strip(tokens);
        }
      case 'string':
        var tokenBeforeTheLastToken = tokens[tokens.length - 2];
        if (tokenBeforeTheLastToken.type === 'delimiter') {
          tokens = tokens.slice(0, tokens.length - 1);
          return strip(tokens);
        } else if (tokenBeforeTheLastToken.type === 'brace' && tokenBeforeTheLastToken.value === '{') {
          tokens = tokens.slice(0, tokens.length - 1);
          return strip(tokens);
        }
        break;
      case 'delimiter':
        tokens = tokens.slice(0, tokens.length - 1);
        return strip(tokens);
        break;
    }

    return tokens;
  },
      unstrip = function unstrip(tokens) {
    var tail = [];

    tokens.map(function (token) {
      if (token.type === 'brace') {
        if (token.value === '{') {
          tail.push('}');
        } else {
          tail.splice(tail.lastIndexOf('}'), 1);
        }
      }
      if (token.type === 'paren') {
        if (token.value === '[') {
          tail.push(']');
        } else {
          tail.splice(tail.lastIndexOf(']'), 1);
        }
      }
    });

    if (tail.length > 0) {
      tail.reverse().map(function (item) {
        if (item === '}') {
          tokens.push({
            type: 'brace',
            value: '}'
          });
        } else if (item === ']') {
          tokens.push({
            type: 'paren',
            value: ']'
          });
        }
      });
    }

    return tokens;
  },
      generate = function generate(tokens) {
    var output = '';

    tokens.map(function (token) {
      switch (token.type) {
        case 'string':
          output += '"' + token.value + '"';
          break;
        default:
          output += token.value;
          break;
      }
    });

    return output;
  },
      partialParse = function partialParse(input) {
    return JSON.parse(generate(unstrip(strip(tokenize(input)))));
  };

  partialParse.noConflict = function () {
    parent.partialParse = previousPartialParse;
    return partialParse;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = partialParse;
    }
    exports.partialParse = partialParse;
  } else {
    parent.partialParse = partialParse;
  }
}).call(this);