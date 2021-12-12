export default class TokenType {
    name: string;
    regex: string;


    constructor(name: string, regex: string) {
        this.name = name;
        this.regex = regex;
    }
}

export const tokenTypesList = {
    NUMBER: new TokenType('NUMBER', '^-?\\d*\\.{0,1}\\d+'),
    VARIABLE: new TokenType('VARIABLE', '^[а-я]*'),
    SEMICOLON: new TokenType('SEMICOLON', '^;'),
    SPACE: new TokenType('SPACE', '^[ \\n\\t\\r]'),
    ASSIGN: new TokenType('ASSIGN', '^='),
    LOG: new TokenType('LOG', '^ПЕЧАТЬ'),
    INPUT: new TokenType('INPUT', '^ВВЕСТИ'),
    PLUS: new TokenType('PLUS', '^[+]'),
    MINUS: new TokenType('MINUS', '^-'),
    MULTIPLY: new TokenType('MULTIPLY', '^[*]'),
    DIVIDE: new TokenType('DIVIDE', '^/'),
    LPAR: new TokenType('LPAR', '^\\('),
    RPAR: new TokenType('RPAR', '^\\)'),
    IF: new TokenType('IF', '^ЕСЛИ'),
    THEN: new TokenType('THEN', '^ТО'),
    ELSE: new TokenType('ELSE', '^ИНАЧЕ'),
    LESS_EQ: new TokenType('LESS_EQ', '^<='),
    MORE_EQ: new TokenType('MORE_EQ', '^>='),
    LESS: new TokenType('LESS', '^<'),
    MORE: new TokenType('MORE', '^>'),
    EQUALS: new TokenType('EQUALS', 'РАВНО'),
};
