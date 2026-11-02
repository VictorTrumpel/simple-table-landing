import { useRef, useState, type FocusEvent, type KeyboardEvent, type SubmitEvent } from 'react';
import '../styles/product-demo.css';

type Status = 'Новая' | 'В работе' | 'Готово';
type Entry = { id: string; task: string; person: string; status: Status; date: string; amount: string };
type CellField = Exclude<keyof Entry, 'id'>;
type Cell = { rowId: string; field: CellField };
type Change = Cell & { id: string; before: string; after: string; author: string; time: string; task: string; added?: boolean };

const initialRows: Entry[] = [
  { id: '001', task: 'Настроить рабочие места', person: 'Анна Козлова', status: 'В работе', date: '29.10.2026', amount: '24000' },
  { id: '002', task: 'Заменить картриджи', person: 'Михаил Смирнов', status: 'Готово', date: '29.10.2026', amount: '6500' },
  { id: '003', task: 'Подключить оборудование', person: 'Анна Козлова', status: 'Новая', date: '30.10.2026', amount: '18000' },
  { id: '004', task: 'Обновить ПО', person: 'Денис Волков', status: 'В работе', date: '30.10.2026', amount: '12000' },
  { id: '005', task: 'Проверить сеть в офисе', person: 'Михаил Смирнов', status: 'Новая', date: '31.10.2026', amount: '8000' },
];
const initialChanges: Change[] = [
  { id: 'first', rowId: '001', field: 'status', before: 'Новая', after: 'В работе', author: 'anna@example.com', time: '29.10.2026 10:42', task: initialRows[0].task },
  { id: 'second', rowId: '002', field: 'status', before: 'В работе', after: 'Готово', author: 'mikhail@example.com', time: '29.10.2026 10:38', task: initialRows[1].task },
];
const statuses: Status[] = ['Новая', 'В работе', 'Готово'];
const columns = [
  { field: 'task', name: 'Заявка', type: 'Текст' },
  { field: 'person', name: 'Ответственный', type: 'Текст' },
  { field: 'status', name: 'Статус', type: 'Выбор из списка' },
  { field: 'date', name: 'Срок', type: 'Дата' },
  { field: 'amount', name: 'Сумма, ₽', type: 'Число' },
] as const;
const columnName = (field: CellField) => columns.find(column => column.field === field)!.name;
const cellId = ({ rowId, field }: Cell) => `demo-cell-${rowId}-${field}`;

function CellEditor({ row, field, onCommit, onCancel }: {
  row: Entry;
  field: CellField;
  onCommit: (value: string, restoreFocus: boolean) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(field === 'date' ? row.date.split('.').reverse().join('-') : row[field]);
  // Enter/change can unmount the editor before blur; save each edit once.
  const finished = useRef(false);
  function commit(value: string, restoreFocus = false) {
    if (finished.current) return;
    finished.current = true;
    onCommit(field === 'date' ? value.split('-').reverse().join('.') : value, restoreFocus);
  }
  const editorProps = {
    autoFocus: true,
    'aria-label': `${columnName(field)}: ${row.task || 'Без названия'}`,
    onBlur: (event: FocusEvent<HTMLInputElement | HTMLSelectElement>) => commit(event.currentTarget.value),
    onKeyDown: (event: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (event.nativeEvent.isComposing) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        commit(event.currentTarget.value, true);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        finished.current = true;
        onCancel();
      }
    },
  };
  return field === 'status'
    ? <select {...editorProps} value={draft} onChange={event => commit(event.target.value, true)}>{statuses.map(status => <option key={status}>{status}</option>)}</select>
    : <input {...editorProps} type={field === 'date' ? 'date' : field === 'amount' ? 'number' : 'text'} step={field === 'amount' ? 'any' : undefined} maxLength={field === 'task' ? 80 : field === 'person' ? 60 : undefined} value={draft} onChange={event => setDraft(event.target.value)} onFocus={event => { if (event.target.type === 'text') event.target.select(); }} />;
}

type IconName = 'table' | 'database' | 'columns' | 'history' | 'users' | 'chart' | 'download' | 'plus' | 'chevron' | 'open' | 'person' | 'trash';
function DemoIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    table: 'M3 9h18M9 9v12M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z',
    database: 'M20 6c0 2-3.6 3-8 3S4 8 4 6s3.6-3 8-3 8 1 8 3ZM4 6v12c0 2 3.6 3 8 3s8-1 8-3V6M4 12c0 2 3.6 3 8 3s8-1 8-3',
    columns: 'M3 4h18v16H3ZM9 4v16M15 4v16',
    history: 'M3 10a9 9 0 1 1 2 8M3 3v7h7M12 7v5l3 2',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    chart: 'M4 3v18h17M8 16v-4m5 4V7m5 9v-6',
    download: 'M12 3v13m-5-5 5 5 5-5M4 16v4h16v-4',
    plus: 'M12 5v14M5 12h14', chevron: 'm9 6 6 6-6 6',
    open: 'M14 3h7v7M21 3 11 13M10 3H3v18h18v-7',
    person: 'M20 21v-2a7 7 0 0 0-14 0v2ZM17 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
    trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
  };
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

const participantRoles = [
  { value: 'admin', label: 'Конструктор', description: 'Управляет базой и участниками' },
  { value: 'writer', label: 'Редактор', description: 'Добавляет и изменяет данные' },
  { value: 'reader', label: 'Читатель', description: 'Просматривает данные' },
] as const;
type ParticipantRole = typeof participantRoles[number]['value'];
type Participant = { id: string; email: string; role: ParticipantRole };
const initialParticipants: Participant[] = [
  { id: 'anna', email: 'anna@example.com', role: 'admin' },
  { id: 'mikhail', email: 'mikhail@example.com', role: 'writer' },
  { id: 'denis', email: 'denis@example.com', role: 'reader' },
];

function DemoParticipants() {
  const [participants, setParticipants] = useState(initialParticipants);
  const [notification, setNotification] = useState('');
  const [removing, setRemoving] = useState<Participant | null>(null);
  const addDialog = useRef<HTMLDialogElement>(null);
  const removeDialog = useRef<HTMLDialogElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);

  function addParticipant(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const email = emailInput.value.trim().toLowerCase();
    if (participants.some(participant => participant.email.toLowerCase() === email)) {
      emailInput.setCustomValidity('Этот участник уже есть в примере.');
      emailInput.reportValidity();
      return;
    }
    const role = new FormData(form).get('role') as ParticipantRole;
    setParticipants(current => [...current, { id: crypto.randomUUID(), email, role }]);
    setNotification(`${email} добавлен в пример. Роль: ${participantRoles.find(item => item.value === role)!.label}.`);
    addDialog.current?.close();
  }

  function removeParticipant() {
    if (!removing) return;
    setParticipants(current => current.filter(participant => participant.id !== removing.id));
    setNotification(`${removing.email} удалён из примера.`);
    removeDialog.current?.close();
    requestAnimationFrame(() => addButton.current?.focus());
  }

  return <section className="app-participants" aria-label="Демонстрационные участники">
    <button ref={addButton} type="button" className="app-participant-add" onClick={() => { addDialog.current?.querySelector('form')?.reset(); addDialog.current?.querySelector('input')?.setCustomValidity(''); addDialog.current?.showModal(); }}><DemoIcon name="plus" />Добавить пользователя</button>
    <ul className="app-participant-list" aria-label="Участники примера">
      {participants.map(participant => <li key={participant.id} className="app-participant-row">
        <div className="app-participant-person"><span>{participant.email}</span><small>{participantRoles.find(role => role.value === participant.role)!.description}</small></div>
        <label className="app-participant-role"><span>Роль</span><select aria-label={`Роль участника ${participant.email}`} value={participant.role} onChange={event => {
          const role = event.target.value as ParticipantRole;
          setParticipants(current => current.map(item => item.id === participant.id ? { ...item, role } : item));
          setNotification(`Роль ${participant.email} изменена: ${participantRoles.find(item => item.value === role)!.label}.`);
        }}>{participantRoles.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
        <button type="button" className="app-participant-remove" aria-label={`Удалить участника ${participant.email}`} onClick={() => { setRemoving(participant); removeDialog.current?.showModal(); }}><DemoIcon name="trash" /></button>
      </li>)}
    </ul>
    {participants.length === 0 && <p className="app-participant-empty">В примере пока нет участников. Добавьте пользователя и выберите роль.</p>}
    <p className="app-participant-status" role="status">{notification || 'Попробуйте изменить роль участника или добавить нового.'}</p>
    <p className="app-participant-note">Вымышленные участники. Изменения сохраняются только до обновления страницы.</p>
    <dialog ref={addDialog} className="app-demo-dialog" aria-labelledby="demo-participant-add-title">
      <h4 id="demo-participant-add-title">Добавление пользователя</h4>
      <form onSubmit={addParticipant}>
        <label>Email<input type="email" name="email" required maxLength={100} placeholder="elena@example.com" onChange={event => event.currentTarget.setCustomValidity('')} /></label>
        <label>Роль<select name="role" aria-label="Роль" defaultValue="reader">{participantRoles.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
        <p className="app-form-note">Пользователь появится только в этом примере. Приглашения не отправляются.</p>
        <div className="app-dialog-actions"><button type="button" onClick={() => addDialog.current?.close()}>Отмена</button><button type="submit">Добавить</button></div>
      </form>
    </dialog>
    <dialog ref={removeDialog} className="app-demo-dialog" aria-labelledby="demo-participant-remove-title">
      <h4 id="demo-participant-remove-title">Удаление пользователя</h4>
      <p className="app-participant-confirm">Удалить {removing?.email} из примера?</p>
      <div className="app-dialog-actions"><button type="button" onClick={() => removeDialog.current?.close()}>Отмена</button><button type="button" onClick={removeParticipant}>Удалить</button></div>
    </dialog>
  </section>;
}

// A fixed illustration, deliberately independent of the editable table's rows.
const chartExample = [
  { label: 'Новые', count: 2, color: 'new' },
  { label: 'В работе', count: 2, color: 'progress' },
  { label: 'Готово', count: 1, color: 'done' },
] as const;

function DemoCharts() {
  const [chartView, setChartView] = useState<'bars' | 'donut'>('bars');
  return <section className="app-demo-charts" aria-label="Демонстрационные графики">
    <div className="chart-card">
      <div className="chart-card-heading"><div><span className="chart-eyebrow">ПРИМЕР РЕЕСТРА ЗАЯВОК</span><h4>Как идут дела у команды</h4></div><span className="chart-icon"><DemoIcon name="chart" /></span></div>
      <div className="chart-toolbar"><span><span className="saved-dot" /> Вымышленные данные</span><div className="chart-switch" role="group" aria-label="Вид демонстрационного графика"><button type="button" className={chartView === 'bars' ? 'active' : ''} aria-pressed={chartView === 'bars'} onClick={() => setChartView('bars')}>Столбцы</button><button type="button" className={chartView === 'donut' ? 'active' : ''} aria-pressed={chartView === 'donut'} onClick={() => setChartView('donut')}>Круговая</button></div></div>
      <div className="chart-plot" hidden={chartView !== 'bars'} role="img" aria-label="Пример: пять заявок — две новые, две в работе, одна готова"><div className="chart-grid-lines" aria-hidden="true"><span>3</span><span>2</span><span>1</span><span>0</span></div><div className="bars" aria-hidden="true">{chartExample.map(item => <div className="bar-column" key={item.color}><span className="bar-value">{item.count}</span><div className={`bar bar-${item.color}`} style={{ height: `${item.count / 3 * 100}%` }} /><span className="bar-label">{item.label}</span></div>)}</div></div>
      <div className="donut-view" hidden={chartView !== 'donut'}><div className="donut" role="img" aria-label="Пример: новые — 40%, в работе — 40%, готово — 20%"><span><strong>5</strong>заявок</span></div><div className="donut-legend">{chartExample.map(item => <span key={item.color}><i className={`legend-${item.color}`} />{item.label}<strong>{item.count}</strong></span>)}</div></div>
      <div className="chart-bottom">Данные примера не зависят от изменений в таблице.</div>
    </div>
  </section>;
}

export default function TableDemo() {
  const [rows, setRows] = useState(initialRows);
  const [changes, setChanges] = useState(initialChanges);
  const [view, setView] = useState<'table' | 'charts' | 'participants'>('table');
  const [panel, setPanel] = useState<'records' | 'columns'>('records');
  const [showHistory, setShowHistory] = useState(true);
  const [historyTab, setHistoryTab] = useState<'table' | 'cell'>('table');
  const [selectedCell, setSelectedCell] = useState<Cell>({ rowId: '001', field: 'status' });
  const [editingCell, setEditingCell] = useState<Cell | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [notification, setNotification] = useState('');
  const [inspected, setInspected] = useState<Change | null>(null);
  const detailDialog = useRef<HTMLDialogElement>(null);
  const addDialog = useRef<HTMLDialogElement>(null);
  const selectedRow = rows.find(row => row.id === selectedCell.rowId);
  const visibleChanges = historyTab === 'cell' ? changes.filter(change => change.rowId === selectedCell.rowId && change.field === selectedCell.field) : changes;

  function finishEditing(cell: Cell, restoreFocus: boolean) {
    setEditingCell(current => current?.rowId === cell.rowId && current.field === cell.field ? null : current);
    if (restoreFocus) requestAnimationFrame(() => document.getElementById(cellId(cell))?.focus());
  }

  function updateCell(row: Entry, field: CellField, next: string, restoreFocus: boolean) {
    finishEditing({ rowId: row.id, field }, restoreFocus);
    if (row[field] === next) return;
    setRows(current => current.map(item => item.id === row.id ? { ...item, [field]: next } : item));
    setChanges(current => [{ id: crypto.randomUUID(), rowId: row.id, field, before: row[field], after: next, author: 'Вы · demo@example.com', time: 'Только что', task: field === 'task' ? next : row.task }, ...current]);
    setShowHistory(true);
    setNotification(`Ячейка «${columnName(field)}» заявки «${row.task || 'Без названия'}» изменена: ${next || 'пусто'}. Изменение появилось в истории.`);
  }

  function downloadCSV() {
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const content = '\uFEFF' + [columns.map(col => col.name), ...rows.map(row => columns.map(column => row[column.field]))].map(row => row.map(escape).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'simpletable-demo.csv';
    link.click();
    URL.revokeObjectURL(url);
    setNotification('Пример таблицы выгружен в CSV.');
  }

  function addRow(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const task = String(data.get('task') || '').trim();
    if (!task) return;
    const row: Entry = { id: crypto.randomUUID(), task, person: String(data.get('person') || '').trim(), status: 'Новая', date: '31.10.2026', amount: '0' };
    setRows(current => [...current, row]);
    setChanges(current => [{ id: crypto.randomUUID(), rowId: row.id, field: 'status', before: '', after: 'Новая', author: 'Вы · demo@example.com', time: 'Только что', task, added: true }, ...current]);
    setSelectedCell({ rowId: row.id, field: 'status' });
    setShowHistory(true);
    setNotification(`Заявка «${task}» добавлена в пример.`);
    event.currentTarget.reset();
    addDialog.current?.close();
  }

  return <div className="app-demo">
    <div className="app-demo-caption"><span className="app-window-dots" aria-hidden="true"><i /><i /><i /></span><span>SimpleTable</span><span className="app-example-label">Интерактивный пример · вымышленные данные</span></div>
    <div className="app-demo-body">
      <aside className="app-sidebar" aria-label="База данных в примере">
        <div className="app-user"><span><DemoIcon name="person" /></span>Анна Козлова</div>
        <div className="app-database"><DemoIcon name="database" />Сервисная команда</div>
        <div className="app-tree-heading"><DemoIcon name="chevron" /><DemoIcon name="table" />Таблицы</div>
        <button type="button" className={`app-tree-current ${view === 'table' ? 'is-current' : ''}`} aria-label="Открыть таблицу примера" aria-pressed={view === 'table'} onClick={() => setView('table')}>Заявки</button>
        <button type="button" className={`app-tree-item ${view === 'charts' ? 'is-current' : ''}`} aria-label="Открыть графики примера" aria-pressed={view === 'charts'} onClick={() => setView('charts')}><DemoIcon name="chevron" /><DemoIcon name="chart" />Графики</button>
        <button type="button" className={`app-tree-item app-tree-members ${view === 'participants' ? 'is-current' : ''}`} aria-label="Открыть участников примера" aria-pressed={view === 'participants'} onClick={() => setView('participants')}><DemoIcon name="users" />Участники</button>
        <span className="app-sidebar-note">Пример базы данных</span>
      </aside>
      <div className="app-workarea">
        <div className="app-workarea-heading"><h3>{view === 'table' ? 'Заявки' : view === 'charts' ? 'Графики' : 'Участники таблицы'}</h3></div>
        <div id="demo-table-view" hidden={view !== 'table'}>
        <div className="app-menu" aria-label="Инструменты демонстрационной таблицы">
          <button type="button" className={panel === 'records' ? 'is-active' : ''} aria-pressed={panel === 'records'} onClick={() => setPanel('records')}><DemoIcon name="database" />Записи</button>
          <button type="button" className={panel === 'columns' ? 'is-active' : ''} aria-pressed={panel === 'columns'} onClick={() => setPanel('columns')}><DemoIcon name="columns" />Колонки</button>
          <button type="button" className={showHistory ? 'is-active' : ''} aria-expanded={showHistory} aria-controls="demo-history" onClick={() => setShowHistory(!showHistory)}><DemoIcon name="history" /><span>История изменений</span></button>
          <button type="button" onClick={downloadCSV} aria-label="Выгрузка примера в CSV"><DemoIcon name="download" />Выгрузка<span className="app-export-format">CSV</span></button>
        </div>
        <div className="app-panels">
          <div className="app-grid-card">
            {panel === 'records' ? <>
              <div className="app-grid-scroll" tabIndex={0} role="region" aria-label="Таблица заявок, доступна горизонтальная прокрутка">
                <table className="app-grid"><thead><tr><th className="app-checkbox-cell"><input type="checkbox" aria-label="Выбрать все строки примера" checked={rows.length > 0 && checked.length === rows.length} onChange={event => setChecked(event.target.checked ? rows.map(row => row.id) : [])} /></th>{columns.map(({ field, name }) => <th key={field} scope="col">{name}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className={checked.includes(row.id) ? 'is-checked' : ''}>
                <td className="app-checkbox-cell"><input type="checkbox" aria-label={`Выбрать заявку: ${row.task}`} checked={checked.includes(row.id)} onChange={event => setChecked(current => event.target.checked ? [...current, row.id] : current.filter(id => id !== row.id))} /></td>
                {columns.map(({ field, name }) => {
                  const cell = { rowId: row.id, field };
                  const selected = selectedCell.rowId === row.id && selectedCell.field === field;
                  const editing = editingCell?.rowId === row.id && editingCell.field === field;
                  const startEditing = () => { setSelectedCell(cell); setEditingCell(cell); };
                  return <td key={field} className={`app-editable-cell app-cell-${field} ${selected ? 'is-selected' : ''}`}>
                    {editing ? <CellEditor key={cellId(cell)} row={row} field={field} onCommit={(value, restoreFocus) => updateCell(row, field, value, restoreFocus)} onCancel={() => finishEditing(cell, true)} /> : <button type="button" id={cellId(cell)} aria-label={`Ячейка «${name}», заявка «${row.task || 'Без названия'}»: ${row[field] || 'Пусто'}. Нажмите для изменения`} onClick={startEditing} onKeyDown={event => { if (event.key === 'F2') { event.preventDefault(); startEditing(); } }}><span>{row[field] || <span className="app-empty-cell">Пусто</span>}</span></button>}
                  </td>;
                })}
                </tr>)}</tbody></table>
              </div>
              <div className="app-grid-footer"><button type="button" onClick={() => addDialog.current?.showModal()}><DemoIcon name="plus" />Добавить строку</button><span className="app-row-count">{checked.length > 0 ? `Выбрано: ${checked.length}` : `1–${rows.length} из ${rows.length}`}</span><span className="app-pagination" aria-hidden="true">‹ <span>›</span></span></div>
            </> : <div className="app-columns-panel"><p>Структура таблицы «Заявки»</p><ul className="app-column-list">{columns.map(({ field, name, type }) => <li key={field}><span className="app-column-type" aria-hidden="true">{type === 'Текст' ? 'Aa' : type === 'Число' ? '1' : type === 'Дата' ? '◷' : '≡'}</span><span>{name}<small>{type}{name === 'Статус' ? ' · Новая, В работе, Готово' : ''}</small></span></li>)}</ul><span className="app-structure-note">Пример настройки колонок</span></div>}
          </div>
          {showHistory && <aside className="app-history" id="demo-history" aria-label="История изменений примера">
            <div className="app-history-tabs" role="tablist" aria-label="Область истории">{(['table', 'cell'] as const).map(tab => <button type="button" role="tab" id={`history-tab-${tab}`} key={tab} aria-controls="history-example-panel" aria-selected={historyTab === tab} tabIndex={historyTab === tab ? 0 : -1} onClick={() => setHistoryTab(tab)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 'table' : event.key === 'End' ? 'cell' : tab === 'table' ? 'cell' : 'table'; setHistoryTab(next); document.getElementById(`history-tab-${next}`)?.focus(); } }}>{tab === 'table' ? 'Таблица' : 'Ячейка'}</button>)}</div>
            <div className="app-history-list" role="tabpanel" id="history-example-panel" aria-labelledby={`history-tab-${historyTab}`} tabIndex={0} aria-live="polite">
              {historyTab === 'cell' && <p className="app-selected-cell">{selectedRow?.task || 'Без названия'} · {columnName(selectedCell.field)}</p>}
              {visibleChanges.map(change => <div className="app-change" key={change.id}>
                {historyTab === 'table' ? <div className="app-change-title"><strong>{change.added ? 'Строка добавлена' : 'Строка обновлена'}</strong><button type="button" aria-label={`Посмотреть изменение: ${change.task}, ${change.time}`} onClick={() => { setInspected(change); detailDialog.current?.showModal(); }}><DemoIcon name="open" /></button></div> : <div className="app-change-values">{change.before || 'Пусто'} <span>➜</span> {change.after || 'Пусто'}</div>}
                <span className="app-change-author">{change.author}</span><time>{change.time}</time>
              </div>)}
              {visibleChanges.length === 0 && <p className="app-history-empty">Измените выбранную ячейку — здесь появится её история.</p>}
            </div>
          </aside>}
        </div>
        </div>
        <div id="demo-charts-view" hidden={view !== 'charts'}><DemoCharts /></div>
        <div id="demo-participants-view" hidden={view !== 'participants'}><DemoParticipants /></div>
      </div>
    </div>
    <dialog ref={detailDialog} className="app-demo-dialog" aria-labelledby="demo-detail-title"><h4 id="demo-detail-title">Изменения:</h4>{inspected && <><p>{inspected.task || 'Без названия'} · {columnName(inspected.field)}</p><div className="app-dialog-diff"><span>{inspected.before || 'Пустая ячейка'}</span><span>→</span><strong>{inspected.after || 'Пустая ячейка'}</strong></div><small>{inspected.author} · {inspected.time}</small></>}<form method="dialog"><button type="submit">Понятно</button></form></dialog>
    <dialog ref={addDialog} className="app-demo-dialog" aria-labelledby="demo-add-title"><h4 id="demo-add-title">Добавить строку</h4><form onSubmit={addRow}><label>Заявка<input name="task" required maxLength={80} placeholder="Например, настроить принтер" /></label><label>Ответственный<input name="person" maxLength={60} placeholder="Имя и фамилия" /></label><p className="app-form-note">Новая запись появится только в этом примере.</p><div className="app-dialog-actions"><button type="button" onClick={() => addDialog.current?.close()}>Отмена</button><button type="submit">Добавить</button></div></form></dialog>
    <p className="sr-only" role="status">{notification}</p>
  </div>;
}
