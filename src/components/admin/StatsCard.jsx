import '../../components/css/StatsCard.css';

function StatsCard({ title, value, icon, color, trend }) {
    return (
        <div className="stats-card">
            <div className="stats-icon" style={{ background: `${color}20`, color }}>
                <i className={icon}></i>
            </div>
            <div className="stats-content">
                <h3 className="stats-title">{title}</h3>
                <div className="stats-value">
                    <span className="value">{value}</span>
                    {trend && (
                        <span className={`trend ${trend > 0 ? 'up' : 'down'}`}>
                            <i className={`fas fa-arrow-${trend > 0 ? 'up' : 'down'}`}></i>
                            {Math.abs(trend)}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StatsCard;