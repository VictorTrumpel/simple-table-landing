import { useRef, useState, type KeyboardEvent } from 'react';
import '../styles/product-demo.css';

const changes = [
  { title: 'Строка обновлена', before: 'Новая', after: 'В работе', author: 'anna@example.com', time: '29.10.2026 10:42', dateTime: '2026-10-29T10:42:00' },
  { title: 'Строка добавлена', before: 'Пусто', after: 'Новая', author: 'mikhail@example.com', time: '29.10.2026 09:15', dateTime: '2026-10-29T09:15:00' },
];
type HistoryTab = 'table' | 'cell';

export default function HistoryPreview() {
  const [activeTab, setActiveTab] = useState<HistoryTab>('cell');
  const [inspected, setInspected] = useState<typeof changes[number] | null>(null);
  const detailDialog = useRef<HTMLDialogElement>(null);

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, tab: HistoryTab) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'table' : event.key === 'End' ? 'cell' : tab === 'table' ? 'cell' : 'table';
    setActiveTab(next);
    document.getElementById(`preview-history-tab-${next}`)?.focus();
  }

  return <div className="app-history-preview" aria-label="Пример истории изменений в стиле приложения">
    <div className="app-preview-tabs" role="tablist" aria-label="Область истории примера">
      {(['table', 'cell'] as const).map(tab => <button
        type="button" role="tab" key={tab} id={`preview-history-tab-${tab}`}
        aria-controls={`preview-history-panel-${tab}`} aria-selected={activeTab === tab}
        tabIndex={activeTab === tab ? 0 : -1}
        onClick={() => setActiveTab(tab)} onKeyDown={event => navigateTabs(event, tab)}
      >{tab === 'table' ? 'Таблица' : 'Ячейка'}</button>)}
    </div>
    {(['table', 'cell'] as const).map(tab => <div
      key={tab} role="tabpanel" id={`preview-history-panel-${tab}`}
      aria-labelledby={`preview-history-tab-${tab}`} hidden={activeTab !== tab} tabIndex={0}
    >
      <p className="app-preview-context">{tab === 'cell' ? 'Заявки / Настроить рабочие места / Статус' : 'Заявки / История таблицы'}</p>
      {changes.map(change => <div className="app-change" key={change.dateTime}>
        {tab === 'table' ? <div className="app-change-title">
          <strong>{change.title}</strong>
          <button type="button" aria-label={`Посмотреть изменение: ${change.title}, ${change.time}`} onClick={() => { setInspected(change); detailDialog.current?.showModal(); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3h7v7M21 3 11 13M10 3H3v18h18v-7" /></svg>
          </button>
        </div> : <div className="app-change-values">{change.before} <span>➜</span> {change.after}</div>}
        <span className="app-change-author">{change.author}</span>
        <time dateTime={change.dateTime}>{change.time}</time>
      </div>)}
      <p className="app-preview-footnote">{tab === 'cell' ? 'Пример истории: значение, автор и время изменения' : 'Пример истории: события таблицы и детали изменений'}</p>
    </div>)}
    <dialog ref={detailDialog} className="app-demo-dialog" aria-labelledby="preview-history-detail-title">
      <h4 id="preview-history-detail-title">Изменения:</h4>
      {inspected && <>
        <p>Настроить рабочие места · Статус</p>
        <div className="app-dialog-diff"><span>{inspected.before}</span><span>→</span><strong>{inspected.after}</strong></div>
        <small>{inspected.author} · {inspected.time}</small>
      </>}
      <form method="dialog"><button type="submit">Понятно</button></form>
    </dialog>
  </div>;
}
