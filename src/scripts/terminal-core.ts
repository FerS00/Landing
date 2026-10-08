export type TerminalMessageKey =
  'help' | 'whoami' | 'projects' | 'stack' | 'contact' | 'theme' | 'matrix' | 'unknown' | 'lang';

export interface TerminalMessages {
  help: string;
  whoami: string;
  projects: string;
  stack: string;
  contact: string;
  theme: string;
  matrix: string;
  unknown: string;
  lang: string;
}

export type TerminalAction =
  | { type: 'scroll'; target: 'work' | 'contact' }
  | { type: 'open-dialog'; id: 'faq' | 'privacy' }
  | { type: 'language'; lang: 'es' | 'en' }
  | { type: 'theme' }
  | { type: 'matrix' }
  | { type: 'clear' };

export interface TerminalResult {
  command: string;
  echoHtml: string;
  outputHtml: string;
  action?: TerminalAction;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function colored(className: string, text: string): string {
  return `<span class="${className}">${escapeHtml(text)}</span>`;
}

export function interpretCommand(raw: string, messages: TerminalMessages): TerminalResult {
  const commandLine = raw.trim().replace(/^(?:\$\s*)+/, '');
  const normalized = commandLine.toLowerCase();
  const [command = '', argument = ''] = normalized.split(/\s+/);
  const result: TerminalResult = {
    command,
    echoHtml: colored('p', '$ ') + escapeHtml(commandLine) + '\n',
    outputHtml: '',
  };

  switch (command) {
    case '':
      return result;
    case 'help':
      result.outputHtml = colored('m', messages.help) + '\n';
      break;
    case 'whoami':
      result.outputHtml = colored('k', messages.whoami) + '\n';
      break;
    case 'projects':
      result.outputHtml = escapeHtml(messages.projects) + '\n';
      result.action = { type: 'scroll', target: 'work' };
      break;
    case 'stack':
      result.outputHtml = colored('s', messages.stack) + '\n';
      break;
    case 'contact':
      result.outputHtml = escapeHtml(messages.contact) + '\n';
      result.action = { type: 'scroll', target: 'contact' };
      break;
    case 'faq':
      result.action = { type: 'open-dialog', id: 'faq' };
      break;
    case 'privacy':
    case 'privacidad':
    case 'cookies':
      result.action = { type: 'open-dialog', id: 'privacy' };
      break;
    case 'lang':
      if (argument === 'es' || argument === 'en') {
        result.outputHtml = colored('m', messages.lang + argument) + '\n';
        result.action = { type: 'language', lang: argument };
        break;
      }
      result.outputHtml = colored('e', messages.unknown + command) + '\n';
      break;
    case 'theme':
      result.outputHtml = colored('m', messages.theme) + '\n';
      result.action = { type: 'theme' };
      break;
    case 'matrix':
    case 'sudo':
      result.outputHtml = colored('k', messages.matrix) + '\n';
      result.action = { type: 'matrix' };
      break;
    case 'clear':
      result.action = { type: 'clear' };
      break;
    default:
      result.outputHtml = colored('e', messages.unknown + command) + '\n';
  }

  return result;
}
