import { describe, expect, it } from 'vitest';
import { escapeHtml, interpretCommand } from '../../src/scripts/terminal-core';

const messages = {
  help: 'help text',
  whoami: 'whoami text',
  projects: 'project text',
  stack: 'stack text',
  contact: 'contact text',
  theme: 'theme text',
  matrix: 'matrix text',
  unknown: 'not found: ',
  lang: 'language: ',
};

describe('terminal command interpreter', () => {
  it('trims input, normalizes the command and parses its argument', () => {
    expect(interpretCommand('  LANG EN  ', messages)).toMatchObject({
      command: 'lang',
      action: { type: 'language', lang: 'en' },
      outputHtml: '<span class="m">language: en</span>\n',
    });
  });

  it('writes exactly one shell prompt before a command, even if input contains prompts', () => {
    const result = interpretCommand('$ $ faq', messages);
    expect(result.command).toBe('faq');
    expect(result.echoHtml).toBe('<span class="p">$ </span>faq\n');
    expect(result.echoHtml.match(/\$/g)).toHaveLength(1);
  });

  it('returns actions for project, contact and dialog commands', () => {
    expect(interpretCommand('projects', messages).action).toEqual({
      type: 'scroll',
      target: 'work',
    });
    expect(interpretCommand('contact', messages).action).toEqual({
      type: 'scroll',
      target: 'contact',
    });
    expect(interpretCommand('privacy', messages).action).toEqual({
      type: 'open-dialog',
      id: 'privacy',
    });
  });

  it('escapes unknown input and dynamic command text before returning HTML', () => {
    const result = interpretCommand('<img src=x onerror=alert(1)>', messages);
    expect(result.echoHtml).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(result.outputHtml).toContain('not found: &lt;img');
    expect(result.outputHtml).not.toContain('<img');
  });

  it('escapes all HTML-sensitive characters', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });
});
