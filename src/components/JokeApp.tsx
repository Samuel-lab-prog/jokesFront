'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { api, clearToken, getToken, setToken, type Joke, type User } from '@/lib/api';

const categories = [
  { id: 'atraso', code: '01', name: 'Prazo vencido', note: 'o calendário ganhou', symbol: '⌁' },
  { id: 'bug', code: '02', name: 'Bug sem convite', note: 'apareceu sozinho', symbol: '⁖' },
  { id: 'lentidao', code: '03', name: 'Tudo em câmera lenta', note: 'até o loading cansou', symbol: '…' },
  { id: 'qualidade', code: '04', name: 'Código freestyle', note: 'estilo: sexta-feira', symbol: '⌘' },
] as const;

const tones = [
  ['leve', 'De boa'],
  ['sarcastico', 'Com veneno'],
  ['corporativo', 'Reunião às 9'],
  ['dramatico', 'Novela das 8'],
  ['tio', 'Tio do pavê'],
] as const;

const categoryNames: Record<string, string> = Object.fromEntries(
  categories.map(({ id, name }) => [id, name]),
);

export default function App() {
  const [category, setCategory] = useState('atraso');
  const [tone, setTone] = useState('leve');
  const [context, setContext] = useState('');
  const [joke, setJoke] = useState<Joke | null>(null);
  const [draft, setDraft] = useState('');
  const [history, setHistory] = useState<Joke[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyDraft, setHistoryDraft] = useState('');

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const refresh = async () => {
    if (!getToken()) return;
    try {
      setHistory(await api<Joke[]>('/jokes/history'));
    } catch {
      clearToken();
      setUser(null);
      setHistory([]);
    }
  };

  useEffect(() => {
    if (!getToken()) return;
    api<{ user: User }>('/auth/me')
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => clearToken());
    api<Joke[]>('/jokes/history')
      .then((items) => setHistory(items))
      .catch(() => { clearToken(); setUser(null); setHistory([]); });
  }, []);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await api<Joke>('/jokes/generate', {
        method: 'POST',
        body: JSON.stringify({ category, tone, context }),
      });
      setJoke(result);
      setDraft(result.joke);
    } catch (error) {
      notify((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft() {
    if (!user) { setAuthOpen(true); notify('Entra no mural para guardar esta versão.'); return; }
    if (!joke) return;
    setBusy(true);
    try {
      await api<Joke>('/jokes', { method: 'POST', body: JSON.stringify({ category: joke.category, tone: joke.tone, context: joke.context, content: draft }) });
      await refresh();
      setJoke({ ...joke, joke: draft });
      notify('Versão arquivada no mural.');
    } catch (error) { notify((error as Error).message); }
    finally { setBusy(false); }
  }

  async function saveHistoryEdit(id: string) {
    setBusy(true);
    try {
      await api(`/jokes/${id}`, { method: 'PATCH', body: JSON.stringify({ content: historyDraft }) });
      setEditingId(null);
      await refresh();
      notify('Piada atualizada.');
    } catch (error) { notify((error as Error).message); }
    finally { setBusy(false); }
  }

  async function deleteJoke(id: string) {
    setBusy(true);
    try {
      await api(`/jokes/${id}`, { method: 'DELETE' });
      await refresh();
      notify('Piada removida do arquivo.');
    } catch (error) { notify((error as Error).message); }
    finally { setBusy(false); }
  }

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await api<{ token: string; user: User }>(
        register ? '/auth/register' : '/auth/login',
        { method: 'POST', body: JSON.stringify({ name, email, password }) },
      );
      setToken(result.token);
      setUser(result.user);
      setAuthOpen(false);
      setPassword('');
      await refresh();
      notify(`Oi, ${result.user.name}. Seu álibi está salvo.`);
    } catch (error) {
      notify((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function copyJoke() {
    if (!joke) return;
    try {
      await navigator.clipboard.writeText(draft);
      notify('Copiado. Pode negar a autoria.');
    } catch {
      notify('Não rolou copiar. Seleciona a frase e vai na mão.');
    }
  }

  function logout() {
    clearToken();
    setUser(null);
    setHistory([]);
    notify('Saiu. O histórico continua aqui quando voltar.');
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Piada de Deploy, início">
          <span className="brand-mark" aria-hidden="true">✳</span>
          <span>piada<span className="brand-dot">.</span>deploy</span>
        </a>
        <div className="header-right">
          <span className="status"><i aria-hidden="true" /> plantão aberto</span>
          <button className="account-button" onClick={() => user ? logout() : setAuthOpen(true)}>
            {user ? `sair, ${user.name.split(' ')[0]}` : 'entrar no mural'}
          </button>
        </div>
      </header>

      <main id="top" className="layout">
        <section className="intro">
          <div className="eyebrow"><span>EDIÇÃO 01</span><b>•</b> PLANTÃO DO PRAZO</div>
          <h1>O prazo venceu.<br /><em>A desculpa, não.</em></h1>
          <p className="intro-copy">
            Um pequeno gerador de versões dos fatos para quem ainda está tentando
            fazer aquele código funcionar.
          </p>

          <div className="terminal-slip" aria-label="Bilhete do terminal">
            <div className="terminal-top"><span>log de sexta-feira</span><span>23:58:04</span></div>
            <p><span>$ git status</span><br />branch: <b>devia-ter-entregue</b><br />tudo certo. <i>nada sob controle.</i></p>
          </div>
          <p className="margin-note">*relato sujeito a revisão pelo QA</p>
        </section>

        <section className="generator" aria-labelledby="generator-title">
          <div className="form-heading">
            <span className="form-index">FORMULÁRIO 404-A</span>
            <span className="form-doodle" aria-hidden="true">↘</span>
            <h2 id="generator-title">Qual é o BO?</h2>
            <p>Preenche a ocorrência. A gente cuida da narrativa.</p>
          </div>
          <form onSubmit={generate}>
            <fieldset className="field-group">
              <legend>O que aconteceu no repositório?</legend>
              <div className="category-grid">
                {categories.map((item) => (
                  <button
                    className={`category-option ${category === item.id ? 'selected' : ''}`}
                    type="button"
                    key={item.id}
                    aria-pressed={category === item.id}
                    onClick={() => setCategory(item.id)}
                  >
                    <span className="category-code">{item.code} / {item.symbol}</span>
                    <strong>{item.name}</strong>
                    <small>{item.note}</small>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="field-group tone-group">
              <legend>Qual vai ser a versão?</legend>
              <div className="tone-list">
                {tones.map(([value, label]) => (
                  <button
                    className={`tone-option ${tone === value ? 'selected' : ''}`}
                    type="button"
                    key={value}
                    aria-pressed={tone === value}
                    onClick={() => setTone(value)}
                  >{label}</button>
                ))}
              </div>
            </fieldset>

            <label className="context-label" htmlFor="context">
              Tem algum detalhe que ajude o álibi?
              <span>OPCIONAL • ATÉ 80 CARACTERES</span>
            </label>
            <input
              id="context"
              className="context-input"
              maxLength={80}
              value={context}
              onChange={(event) => setContext(event.target.value)}
              placeholder="ex.: demo amanhã, deploy na sexta…"
            />

            <button className="generate-button" disabled={busy}>
              <span>{busy ? 'montando a versão…' : 'me dá uma desculpa'}</span>
              <b aria-hidden="true">↗</b>
            </button>
            <p className="small-note">Sem IA, sem julgamento. Só uma boa história.</p>
          </form>
        </section>

        <section className={`result ${joke ? 'has-joke' : ''}`} aria-live="polite" aria-label="Desculpa gerada">
          <div className="receipt-head">
            <span>RECIBO DE RESPONSABILIDADE</span>
            <span>{joke ? `#${joke.id.slice(-5).toUpperCase()}` : '#00000'}</span>
          </div>
          {joke ? (
            <div className="result-content">
              <div className="result-kicker"><span>VERSÃO EDITÁVEL</span><span>{categoryNames[joke.category]}</span></div>
              <textarea className="joke-editor" aria-label="Edite a piada antes de salvar" maxLength={500} value={draft} onChange={(event) => setDraft(event.target.value)} />
              <div className="result-meta">
                <span>{joke.context ? `ANEXO: ${joke.context}` : 'VALIDADE: ATÉ A PRÓXIMA DAILY'}</span>
                <div className="result-actions"><button className="copy-button" type="button" onClick={copyJoke}>copiar ↗</button><button className="copy-button save-button" type="button" disabled={busy || !draft.trim()} onClick={saveDraft}>salvar no mural</button></div>
              </div>
            </div>
          ) : (
            <div className="result-placeholder">
              <span className="placeholder-asterisk" aria-hidden="true">✳</span>
              <p>Aqui ainda não tem<br />versão oficial dos fatos.</p>
              <span>PREENCHE O FORMULÁRIO ACIMA E TORCE</span>
            </div>
          )}
          <div className="receipt-foot"><span>PIADA.DEPLOY • SEM GARANTIA DE MERGE</span><span>↘</span></div>
        </section>

        <aside className="history" aria-labelledby="history-title">
          <div className="history-head">
            <div>
              <span className="history-label">ARQUIVO DE VERSÕES</span>
              <h2 id="history-title">O que já contamos</h2>
            </div>
            <span className="history-count">{String(history.length).padStart(2, '0')}</span>
          </div>
          <div className="history-list">
            {history.length ? history.slice(0, 20).map((item, index) => (
              <article className="history-item" key={item.id}>
                <span className="history-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="history-entry">{editingId === item.id ? <><textarea className="history-editor" aria-label="Editar piada salva" maxLength={500} value={historyDraft} onChange={(event) => setHistoryDraft(event.target.value)} /><div className="history-tools"><button type="button" disabled={busy} onClick={() => saveHistoryEdit(item.id)}>salvar edição</button><button type="button" onClick={() => setEditingId(null)}>cancelar</button></div></> : <><p>{item.joke}</p><div className="history-tools"><small>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</small><button type="button" onClick={() => { setEditingId(item.id); setHistoryDraft(item.joke); }}>editar</button><button type="button" disabled={busy} onClick={() => deleteJoke(item.id)}>excluir</button></div></>}</div>
              </article>
            )) : (
              <p className="history-empty">
                {user ? 'Arquivo limpo. Desconfie.' : 'Entra no mural pra guardar as melhores versões.'}
              </p>
            )}
          </div>
          <button className="history-link" onClick={() => user ? refresh() : setAuthOpen(true)}>
            {user ? 'atualizar arquivo' : 'guardar minhas desculpas'} <span>↗</span>
          </button>
        </aside>
      </main>

      <footer className="site-footer">
        <span>FEITO NO INTERVALO ENTRE UM BUILD E OUTRO</span>
        <span>se funcionar, não mexe. <b>™</b></span>
      </footer>

      {toast && <div className="toast show" role="status">{toast}</div>}

      {authOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthOpen(false); }}>
          <form className="auth-dialog" onSubmit={authenticate}>
            <button type="button" className="dialog-close" onClick={() => setAuthOpen(false)} aria-label="Fechar">×</button>
            <div className="section-label">{register ? 'ABRIR ARQUIVO DE ÁLIBIS' : 'ACESSO AO MURAL'}</div>
            <h2>{register ? 'Criar uma conta' : 'Voltar ao mural'}</h2>
            <p className="auth-subtitle">As melhores versões dos fatos merecem ser guardadas.</p>
            {register && <><label htmlFor="name">Nome</label><input id="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Como te chamam no Slack?" /></>}
            <label htmlFor="email">E-mail</label>
            <input id="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" />
            <label htmlFor="password">Senha</label>
            <input id="password" required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Pelo menos 6 caracteres" />
            <button className="generate-button" disabled={busy}><span>{register ? 'abrir meu arquivo' : 'entrar no mural'}</span><b>↗</b></button>
            <button type="button" className="auth-toggle" onClick={() => setRegister(!register)}>{register ? 'já tenho conta — entrar' : 'primeira vez aqui? criar conta'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
