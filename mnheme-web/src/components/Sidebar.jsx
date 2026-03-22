import { NavLink } from 'react-router-dom';
import { useMemoryDB } from '../hooks/useMemoryDB';
import { useI18n } from '../i18n/index.jsx';

export default function Sidebar({ isOpen, onClose }) {
  const { count, listConcepts, revision } = useMemoryDB();
  const { t } = useI18n();
  const total    = count();
  const concepts = listConcepts().length;

  const NAV_ITEMS = [
    { group: t('sidebar.groupMemory'),  items: [
      { to: '/',         icon: '>', label: t('sidebar.navPerceive') },
      { to: '/memories', icon: ':', label: t('sidebar.navMemories') },
      { to: '/brain',    icon: '*', label: t('sidebar.navBrain') },
    ]},
    { group: t('sidebar.groupExplore'), items: [
      { to: '/stats',    icon: '#', label: t('sidebar.navStats') },
    ]},
    { group: t('sidebar.groupSystem'),  items: [
      { to: '/settings', icon: '@', label: t('sidebar.navSettings') },
    ]},
  ];

  const handleNavClick = () => {
    // Close sidebar on mobile when a nav item is clicked
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="sidebar-header">
        <img src="/logo.png" alt="MNHEME" className="sidebar-logo" />
        <div className="logo-text">MNHEME</div>
        <div className="logo-sub">{t('sidebar.subtitle')}</div>
      </div>

      <nav className="nav-sections">
        {NAV_ITEMS.map(group => (
          <div key={group.group}>
            <div className="nav-group-label">{group.group}</div>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}
                end={item.to === '/'}
                onClick={handleNavClick}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="stat-pill">{total.toLocaleString()} {t('sidebar.memories')}</div>
        <div className="stat-pill">{concepts} {t('sidebar.concepts')}</div>
      </div>
    </aside>
  );
}
