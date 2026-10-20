import { Link } from 'react-router';

const relative = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

function timeAgo(date) {
  const diffMin = Math.round((new Date(date) - Date.now()) / 60000);
  if (Math.abs(diffMin) < 60) return relative.format(diffMin, 'minute');
  const diffH = Math.round(diffMin / 60);
  if (Math.abs(diffH) < 24) return relative.format(diffH, 'hour');
  return relative.format(Math.round(diffH / 24), 'day');
}

export default function ActivityTimeline({ activities }) {
  return (
    <aside className="activity" aria-labelledby="activity-title">
      <h2 id="activity-title" className="activity__title">Activité récente</h2>

      {activities.length === 0 ? (
        <p className="activity__empty">Rien pour l'instant. Scanne ton premier carton !</p>
      ) : (
        <ol className="timeline">
          {activities.map((a) => (
            <li key={a.id} className="timeline__item">
              <span className="timeline__dot" aria-hidden />
              <div className="timeline__content">
                <span className="timeline__text">{a.text}</span>
                <time className="timeline__time" dateTime={a.createdAt}>{timeAgo(a.createdAt)}</time>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Link to="/activity" className="activity__more">Tout voir</Link>
    </aside>
  );
}
