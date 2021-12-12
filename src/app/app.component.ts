import { Component } from '@angular/core';
import Lexer from './classes/Lexer';
import Parser from './classes/Parser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-language';
  code: string;
  console: string;
  errorMess = '';

  run(code: string) {
    this.errorMess = '';
    const lexer = new Lexer(code);
    try {
      lexer.lexAnalysis();
      const parser = new Parser(lexer.tokenList);
      const rootNode = parser.parseCode();
      parser.run(rootNode);
      this.console = parser.result;
      parser.result = '';
    }
    catch (e){
      this.errorMess = e + '\n' + this.code[0];
      console.log(e);
    }
  }

  clear() {
    this.errorMess = '';
    this.code = '';
  }

  clearConsole() {
    this.errorMess = '';
    this.console = '';
  }
}
