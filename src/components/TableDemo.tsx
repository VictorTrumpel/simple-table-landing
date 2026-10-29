import { useState } from 'react';

type Status = 'Новая' | 'В работе' | 'Готово';
type Entry = { id: string; task: string; person: string; initials: string; color: string; status: Status; date: string; amount: string };
type Change = { before: string; after: string; author: string; time: string; task: string };

const initialRows: Entry[] = [
  { id: '001', task: 'Настроить рабочие места', person: 'Анна', initials: 'АК', color: 'purple', status: 'В работе', date: '29 окт', amount: '24 000 ₽' },
  { id: '002', task: 'Заменить картриджи', person: 'Михаил', initials: 'МС', color: 'peach', status: 'Готово', date: '29 окт', amount: '6 500 ₽' },
  { id: '003', task: 'Подключить оборудование', person: 'Анна', initials: 'АК', color: 'purple', status: 'Новая', date: '30 окт', amount: '18 000 ₽' },
  { id: '004', task: 'Обновить ПО', person: 'Денис', initials: 'ДВ', color: 'green', status: 'В работе', date: '30 окт', amount: '12 000 ₽' },
  { id: '005', task: 'Проверить сеть в офисе', person: 'Михаил', initials: 'МС', color: 'peach', status: 'Новая', date: '31 окт', amount: '8 000 ₽' },
];

const initialChanges: Change[] = [
  { before: 'Новая', after: 'В работе', author: 'Анна Козлова', time: 'Сегодня, 10:42', task: 'Настроить рабочие места' },
  { before: 'В работе', after: 'Готово', author: 'Михаил Смирнов', time: 'Сегодня, 10:38', task: 'Заменить картриджи' },
];

const statuses: Status[] = ['Новая', 'В работе', 'Готово'];
const statusClass = (value: string) => value === 'Готово' ? 'done' : value === 'В работе' ? 'progress' : 'new';

function SmallIcon({ name }: { name: 'table' | 'clock' | 'users' | 'chart' | 'search' | 'plus' | 'filter' | 'arrow' | 'check' | 'download' }) {
  const paths = {
    table: 'M3 9h18M9 9v12M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z',
    clock: 'M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    chart: 'M4 3v18h17M8 16v-4m5 4V7m5 9v-6',
    search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    plus: 'M12 5v14M5 12h14',
    filter: 'M4 5h16M7 12h10m-7 7h4',
    arrow: 'M5 12h14m-6-6 6 6-6 6',
    check: 'm5 12 4 4L19 6',
    download: 'M12 3v13m-5-5 5 5 5-5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4',
  };
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function TableDemo() {
  const [rows, setRows] = useState(initialRows);
  const [changes, setChanges] = useState(initialChanges);
  const [showHistory, setShowHistory] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(false);
  const [notification, setNotification] = useState('');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  function updateStatus(id: string, next: Status) {
    const row = rows.find((item) => item.id === id);
    if (!row || row.status === next) return;
    setRows((current) => current.map((item) => item.id === id ? { ...item, status: next } : item));
    setChanges((current) => [{ before: row.status, after: next, author: 'Вы', time: 'Только что', task: row.task }, ...current]);
    setSelectedTask(row.task);
    setShowHistory(true);
    setNotification(`Статус заявки «${row.task}» изменён на «${next}». Изменение появилось в истории.`);
  }

  function downloadCSV() {
    const content = '\uFEFF' + [['Заявка', 'Ответственный', 'Статус', 'Срок', 'Сумма'], ...rows.map((row) => [row.task, row.person, row.status, row.date, row.amount])].map((row) => row.join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'simpletable-demo.csv';
    link.click();
    URL.revokeObjectURL(url);
    setNotification('Демонстрационная таблица выгружена в CSV.');
  }

  const filteredRows = rows.filter((row) => row.task.toLowerCase().includes(query.toLowerCase()) && (!filter || row.status === 'В работе'));
  const visibleChanges = selectedTask ? changes.filter((change) => change.task === selectedTask) : changes;

  return (
    <div className="product-demo">
      <div className="demo-browser"><span className="window-dots"><i /><i /><i /></span><span className="demo-address"><span className="tiny-lock">▢</span> simpletable · рабочее пространство</span><span className="demo-label"><span /> Интерактивный пример</span></div>
      <div className="demo-body">
        <aside className="demo-sidebar" aria-label="Рабочее пространство в примере">
          <div className="workspace-name"><span className="workspace-logo">С</span><span>Сервисная команда<small>Рабочее пространство</small></span><span className="workspace-dots">···</span></div>
          <div className="sidebar-caption">ВАША БАЗА</div>
          <div className="sidebar-item active"><SmallIcon name="table" /> Заявки <span>5</span></div>
          <div className="sidebar-item muted"><SmallIcon name="chart" /> Аналитика</div>
          <div className="sidebar-item muted"><SmallIcon name="users" /> Участники <span>3</span></div>
          <div className="sidebar-bottom"><span className="avatar purple">АК</span><span>Анна Козлова<small>Администратор</small></span></div>
        </aside>
        <div className="demo-main">
          <div className="demo-title"><div><span className="demo-breadcrumb">Рабочее пространство <span>/</span> Таблицы</span><h3>Заявки <span className="title-badge">Командная работа</span></h3></div><div className="avatar-stack" aria-label="В примере три участника"><span className="avatar purple">АК</span><span className="avatar peach">МС</span><span className="avatar green">ДВ</span><span className="online-mark" /></div></div>
          <div className="demo-toolbar"><span className="table-tab"><SmallIcon name="table" /> Таблица</span><div className="demo-tools"><button type="button" className={`demo-tool ${filter ? 'selected' : ''}`} onClick={() => setFilter(!filter)} aria-pressed={filter}><SmallIcon name="filter" /><span>{filter ? 'В работе' : 'Фильтр'}</span></button><button type="button" className={`demo-tool ${showHistory ? 'selected' : ''}`} onClick={() => setShowHistory(!showHistory)} aria-pressed={showHistory}><SmallIcon name="clock" /><span>История</span></button><button type="button" className="demo-tool icon-only" aria-label="Скачать пример таблицы в CSV" onClick={downloadCSV}><SmallIcon name="download" /></button></div></div>
          <div className="table-and-history">
            <div className="table-container">
              <div className="table-search"><SmallIcon name="search" /><input aria-label="Найти заявку в примере" placeholder="Найти заявку…" value={query} onChange={(event) => setQuery(event.target.value)} /><span>{filteredRows.length} заявок</span></div>
              <div className="table-scroll" tabIndex={0} role="region" aria-label="Пример таблицы заявок, доступна горизонтальная прокрутка"><table className="demo-table"><thead><tr><th className="row-number">№</th><th><span className="column-type">Аа</span> Заявка</th><th><span className="column-type">◎</span> Ответственный</th><th><span className="column-type">◉</span> Статус</th><th><span className="column-type">▦</span> Срок</th><th><span className="column-type">#</span> Сумма</th></tr></thead><tbody>{filteredRows.map((row, index) => <tr key={row.id}><td className="row-number">{index + 1}</td><td className="task-name">{row.task}</td><td><span className="person"><span className={`avatar mini ${row.color}`}>{row.initials}</span>{row.person}</span></td><td className={row.id === '001' ? 'collaborating-cell' : ''}><select value={row.status} aria-label={`Статус заявки: ${row.task}`} className={`status-select status-${statusClass(row.status)}`} onChange={(event) => updateStatus(row.id, event.target.value as Status)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>{row.id === '001' && <span className="cell-collaborator">Анна</span>}</td><td className="cell-date">{row.date}</td><td className="cell-amount">{row.amount}</td></tr>)}</tbody></table>{!filteredRows.length && <p className="table-empty">Заявки не найдены. Измените поиск или отключите фильтр.</p>}</div>
              <div className="demo-table-footer"><span><span className="saved-dot" /> Пример данных</span><span>Excel / CSV <SmallIcon name="check" /></span></div>
            </div>
            {showHistory && <aside className="demo-history"><div className="history-heading"><SmallIcon name="clock" /><strong>История изменений</strong><button type="button" aria-label="Закрыть историю" onClick={() => setShowHistory(false)}>×</button></div><div className="history-tabs"><button type="button" className={!selectedTask ? 'active' : ''} onClick={() => setSelectedTask(null)}>Вся таблица</button><button type="button" className={selectedTask ? 'active' : ''} onClick={() => setSelectedTask(initialRows[0].task)}>Ячейка</button></div><div className="history-items" aria-live="polite">{visibleChanges.map((change, index) => <div className="history-entry" key={`${changes.length}-${index}`}><span className={`history-dot ${change.author === 'Вы' ? 'you' : ''}`} /><span className="history-time">{change.time}</span><strong>{change.author}</strong><p>Изменён статус заявки</p><div className="history-diff"><span className={`status-pill status-${statusClass(change.before)}`}>{change.before}</span><span>→</span><span className={`status-pill status-${statusClass(change.after)}`}>{change.after}</span></div><span className="history-task">{change.task}</span></div>)}</div><div className="history-footnote"><SmallIcon name="check" /> Каждое изменение на виду</div></aside>}
          </div>
        </div>
      </div>
      <p className="sr-only" role="status">{notification}</p>
    </div>
  );
}
