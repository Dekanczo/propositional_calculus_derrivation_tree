
class Token {
  constructor(val, type, tokenIdx, strExprStartIdx) {
    this.val = val;
    this.tokenIdx = tokenIdx
    this.strExprStartIdx = strExprStartIdx;
    this.mustBeActivated = false;
  
    if (type === undefined)
      this.type = Token.getTokenType(Array.from(val)[0]); 
    else
      this.type = type;
  }

  clone() {
    return new Token(this.val, this.type, this.tokenIdx, this.strExprStartIdx);
  }


  static types = Object.freeze({
    ID: Symbol('ID'),
    LBRACKET: Symbol('('),
    RBRACKET: Symbol(')'),
    AND: Symbol('&'),
    OR: Symbol('|'),
    IMPL: Symbol('->'),
    NEG: Symbol('!'),
    SPACE: Symbol(' '),
    TAB: Symbol('\t'),
    EMPTY: Symbol('')
  });

  static getTokenType(c) {
    if (c === '(')
      return Token.types.LBRACKET;
    else if (c === ')')
      return Token.types.RBRACKET;
    else if (c.isIDSymbol())
      return Token.types.ID;
    else if (c === '-' || c === '>')
      return Token.types.IMPL;
    else if (c === '|')
      return Token.types.OR;
    else if (c === '&')
      return Token.types.AND;
    else if (c === '!')
      return Token.types.NEG;
    else if (c === ' ')
      return Token.types.SPACE;
    else if (c === '\t')
      return Token.types.TAB;
    else if (c === '')
      return Token.types.EMPTY;
  }
  
  isOperator() {
    return  this.type == Token.types.NEG ||
            this.type == Token.types.AND ||
            this.type == Token.types.OR ||
            this.type == Token.types.IMPL;
  }
  
  leftAssoc() {
    return this.type == Token.types.IMPL;
  }
  
  priority() {
    if (this.type == Token.types.NEG) return 4;
    if (this.type == Token.types.AND) return 3;
    if (this.type == Token.types.OR) return 2;
    if (this.type == Token.types.IMPL) return 1;
    return 0;
  }
  
  rightPriority() {
    if (this.type == Token.types.NEG) return 4;
    if (this.type == Token.types.AND) return 3;
    if (this.type == Token.types.OR) return 2;
    if (this.type == Token.types.IMPL) return 1;
    return 0;
  }

  equals(other) {
    return this.val === other.val && this.op === other.op;
  }

  toString() {
    return this.val;
  }
}

class Expr {
  constructor() {
  }

  toString() {
    return this.tokens.join('');
  }

  at(idx) {
    return this.tokens.at(idx);
  }

  static fromStr(str) {
    let expr = new Expr();
    expr.strExpr = str;
    expr.tokens = Expr.produceTokens(expr.strExpr).map(t => t.clone());
    expr.tokens.forEach((t, idx) =>{
       t.tokenIdx = idx;
    });
    expr.length = expr.tokens.length;
    expr.bracketsPrioritiesInfo = Expr.getBracketsPrioritiesInfo(expr);
    return expr;
  }

  static fromTokens(tokens) {
    let expr = new Expr();
    expr.tokens = tokens.map(t => t.clone());
  
    expr.tokens.forEach((t, idx) => {
      t.tokenIdx = idx;
    });
    expr.strExpr = expr.toString();
    expr.length = expr.tokens.length;
    expr.bracketsPrioritiesInfo = Expr.getBracketsPrioritiesInfo(expr);

    return expr;
  }

  equals(other) {
    if (this.length != other.length)
      return false;
    
    return this.tokens.every((val, idx) => this.tokens[idx].equals(other.tokens[idx]));
  }
  
  absoluteEquals(other) {
    const predicate = 
      v => v != Token.types.SPACE && v != Token.types.TAB;
    
    const newThis = Expr.fromTokens(this.tokens.filter(t => predicate(t.type)));
    const newOther = Expr.fromTokens(other.tokens.filter(t => predicate(t.type)));

    return newThis.strExpr === newOther.strExpr; 
  }
  
  slice(from, to) {
    let strExpr = '';

    for (let i = from; i < to; i++)
      strExpr += this.tokens[i].val;
    
    return Expr.fromStr(strExpr);
  }
  
  static getBracketsPrioritiesInfo(expr) {
    let tokens = expr.tokens;
    let level = 0;
    let priorities = [];
    for (let pos = 0; pos < tokens.length; pos++)
      if (tokens[pos].type === Token.types.LBRACKET) {
        priorities.push({
          level: level,
          pos: pos
        });
        level += 1;
      }
      else if (tokens[pos].type === Token.types.RBRACKET) {
        level -= 1;
        priorities.push({
          level: level,
          pos: pos
        });
      }

    priorities.sort((a, b) => a.level-b.level)

    return priorities;
  }

  upperLevelTokenIdxsByToken(opType) {
    const getTokensIdxs = (opType, left, right) => {
      let idxs = [];
      for (let j = left; j <= right; j++){
        if (this.at(j).type == opType)
          idxs.push(this.at(j).tokenIdx);
      }
      
      return idxs;
    }
    
    let opsIdxs = [];

    if (this.bracketsPrioritiesInfo.length == 0) {
      opsIdxs.push(...getTokensIdxs(opType, 0, this.length - 1));
      return opsIdxs;
    }

    let 
      from = -1,
      to = -1,
      pos = 0;

    while (pos < this.bracketsPrioritiesInfo.length && this.bracketsPrioritiesInfo[pos].level !== 0) 
      pos++;
    from = pos;

    while (pos < this.bracketsPrioritiesInfo.length && this.bracketsPrioritiesInfo[pos].level === 0) 
      pos++;
    to = pos - 1;

    const 
      start = 0,
      end = this.length - 1;
    let 
      left = start,
      right;

    left = 0;
    right = this.bracketsPrioritiesInfo[from].pos - 1;
    let gapsNumber = (to - from + 1) / 2 + 1;
    for (let i = from + 1, j = 0; j < gapsNumber; i += 2, j++) {
      if (right - left + 1 > 0) {
        opsIdxs.push(...getTokensIdxs(opType, left, right));
      }

      if (i + 1 < this.bracketsPrioritiesInfo.length) {
        left = this.bracketsPrioritiesInfo[i].pos + 1;
        right = this.bracketsPrioritiesInfo[i + 1].pos - 1;
      }
      else
        right = end;
    }

    return opsIdxs;
  }

  static _opTypesPriorities = [
    Token.types.IMPL,
    Token.types.OR,
    Token.types.AND,
    Token.types.NEG
  ]

  getLowPriorityOpsInfo() {
    let lowPriorityOpsInfo = null;
    const bracketsPrioritiesInfo = this.bracketsPrioritiesInfo;

    for (let i = 0; i < Expr._opTypesPriorities.length; i++) {
      const opsIdxs = this.upperLevelTokenIdxsByToken(Expr._opTypesPriorities[i]);

      if (opsIdxs.length != 0) {
        lowPriorityOpsInfo = {
          opsIdxs: opsIdxs,
          op: Expr._opTypesPriorities[i]
        };
        
        break;
      }
    }

       
    if (lowPriorityOpsInfo != null ) {
      if (lowPriorityOpsInfo.op.type == Token.types.IMPL)
        lowPriorityOpsInfo.opsIdxs = lowPriorityOpsInfo.opsIdxs.slice(-1);
    }
    else {
      const opType = Expr._opTypesPriorities[Expr._opTypesPriorities.length - 1];
      const opsIdxs = [];
      const 
        from = 0,
        to = bracketsPrioritiesInfo.length != 0 ? bracketsPrioritiesInfo[0].pos : this.length - 1;

      for (let i = from; i <= to; i++)
        if (this.at(i).type == opType)
          opsIdxs.push(i);

      if (opsIdxs.length != 0)
        lowPriorityOpsInfo = {
          opsIdxs: opsIdxs,
          op: opToken
        };
    }

    return lowPriorityOpsInfo;
  }
  
  static produceTokens(strExpr) {
    let tokens = [];
    if (strExpr.length == 1){
      tokens.push(new Token(strExpr, Token.getTokenType(strExpr), 0, 0));
    }
    else {
      const specialStrExpr = strExpr + ' ';
      let buf = '';
      const startI = 0;
      let curChar = specialStrExpr[startI];
      let curCharType = Token.getTokenType(curChar);
      let tokenCount = 0;

      for (let i = startI; i < specialStrExpr.length - 1; i++) {    
        let nextChar = specialStrExpr[i + 1];
        let nextCharType = Token.getTokenType(nextChar);
        const terminalState = 
          curCharType == Token.types.LBRACKET ||
          curCharType == Token.types.RBRACKET ||
          curCharType == Token.types.NEG ||
          curCharType != nextCharType;
        
        buf += curChar;

        if (terminalState) {
          let startNewTypeIdx = i - buf.length + 1;
          let tokenIdx = tokenCount++;
          let token = new Token(buf, curCharType, tokenIdx, startNewTypeIdx);
          tokens.push(token);

          buf = '';
        }

        curChar = nextChar;
        curCharType = nextCharType;
      }
      
    }
    return tokens;
  }


  
  minimizeBrackets() {
    if (this.absoluteEquals(Expr.fromStr('')))
      return this;
  
    const result = 
      this
        .infixToPostfix()
        .postfixToInfix();
  
    return result;
  }
  
  infixToPostfix() {
    let 
      i = 0,
      tokens = this.tokens,
      nextToken = function () {
        while (i < tokens.length && (tokens[i].type == Token.types.SPACE || tokens[i].type == Token.types.TAB)) 
          i++;
        if (i < tokens.length)
          return tokens[i++];
        return null;
      };
    
    let 
      S = [],
      O = [],
      token,
      opCount = 0;

    while ((token = nextToken()) != null) {
      if (token.type == Token.types.LBRACKET) {
        S.push(token);
      }
      else if (token.type == Token.types.RBRACKET) {
        while (S.length > 0 && S[S.length - 1].type != Token.types.LBRACKET) O.push(S.pop());
        if (S.length == 0) 
          throw new Error('Mismatched parenthesis');
        S.pop();
      } 
      else if (token.isOperator()) {
        opCount++;
  
        while (
          S.length > 0 && 
          S[S.length - 1].isOperator() && 
          (
            (token.leftAssoc() && token.priority() <= S[S.length - 1].priority())
            || 
            (!token.leftAssoc() && token.priority() < S[S.length - 1].priority())
          )
        ) O.push(S.pop());
        
        S.push(token);
      } else {
        O.push(token);
      }
    }
    while (S.length > 0) {
      if (!S[S.length - 1].isOperator()) 
        throw new Error('Mismatched parenthesis');
      O.push(S.pop());
    }
  
    if (O.length == 0 && opCount != 0)
        return null;
    
    const spaceToken = new Token(' ');
    const resTokens = O.joins(spaceToken);
    return Expr.fromTokens(resTokens);
  }
  
  
  postfixToInfix() {
    let
      i = 0,
      tokens = this.tokens,
      nextToken = function () {
        while (i < tokens.length && (tokens[i].type == Token.types.SPACE || tokens[i].type == Token.types.TAB)) 
          i++;
        if (i < tokens.length)
          return tokens[i++];
        return null;
      };
  
    let 
      lBracket = new Token('('),
      rBracket = new Token(')'),
      space = new Token(' ');

    print = function (x) {
      if (x instanceof Token) 
        return [x];
      else if (!x)
        return [];

      let
        l = print(x.l),
        r = print(x.r);
        
      if (x.l && !(x.l instanceof Token) && (x.l.op.priority() < x.op.priority())) 
        l = [lBracket, ...l, rBracket];
      if (x.r && !(x.r instanceof Token) && (x.r.op.rightPriority() < x.op.rightPriority() || (x.r.op == x.op && (x.op.type == Token.types.IMPL)))) 
        r = [lBracket, ...r, rBracket];
  
      if (x.op.type == Token.types.NEG)
        return [...l, x.op, ...r];
      else
        return [...l, space, x.op, space, ...r];
    };
  
    let
      S = [],
      token;
  
    while ((token = nextToken(this)) != null) {
      if (token.isOperator())
        if (token.type == Token.types.NEG) 
          S.push({op: token, r: S.pop(), l: null });
        else
        {
          if (S.length < 2)
            throw new Error('Invalid thisession');
  
          S.push({ op: token, r: S.pop(), l: S.pop() });
        }
      else
        S.push(token);
    }
    
    if (S.length != 1) 
      throw new Error('Invalid thisession');
    const resTokens = print(S.pop());
    return Expr.fromTokens(resTokens);
  }
}

globalThis.Token = Token;
globalThis.Expr = Expr;