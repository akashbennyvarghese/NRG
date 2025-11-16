import ts from 'typescript';
import path from 'path';

export const loader = {
  resolve(specifier) {
    if (specifier.endsWith('.ts')) {
      return {
        url: specifier,
        format: 'commonjs'
      };
    }
    return {
      url: specifier,
      format: 'module'
    };
  },
  getFormat(url) {
    if (url.endsWith('.ts')) {
      return { format: 'commonjs' };
    }
    return { format: 'module' };
  },
  getSource(url) {
    if (url.endsWith('.ts')) {
      const source = require('fs').readFileSync(new URL(url), 'utf8');
      const result = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2020
        }
      });
      return { source: result.outputText };
    }
    return null;
  }
};
