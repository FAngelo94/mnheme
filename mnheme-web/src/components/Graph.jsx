import { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { FEELINGS, FEELING_COLORS } from '../core/constants';
import { useMemoryDB } from '../hooks/useMemoryDB';
import SectionGuide from './SectionGuide';
import { useI18n } from '../i18n/index.jsx';

// ── Graph-specific feeling colors (more vibrant for nodes) ──
const GRAPH_FEELING_COLORS = {
  amore: '#ff6b9d', gioia: '#ffd93d', serenita: '#6bcb77', 'serenità': '#6bcb77',
  orgoglio: '#4d96ff', nostalgia: '#c77dff', malinconia: '#9d9d9d',
  ansia: '#ff9f43', paura: '#ee5a24', rabbia: '#e74c3c',
  tristezza: '#74b9ff', vergogna: '#a29bfe', solitudine: '#636e72',
  gratitudine: '#00b894', speranza: '#00cec9', sorpresa: '#fdcb6e',
  sollievo: '#87ceab', senso_di_colpa: '#8a6060', delusione: '#7a7a9b',
  confusione: '#9a8a6a', invidia: '#6a9a5a', imbarazzo: '#c47a7a',
  eccitazione: '#e0a030', rassegnazione: '#7a7a7a', stupore: '#c4b050',
  noia: '#5a5a6a', curiosita: '#6a8a9b', 'curiosità': '#6a8a9b',
};
const DEFAULT_COLOR = '#b2bec3';

function feelingColor(f) {
  return GRAPH_FEELING_COLORS[(f || '').toLowerCase()] || FEELING_COLORS[(f || '').toLowerCase()] || DEFAULT_COLOR;
}

const trunc = (s, n = 28) => s && s.length > n ? s.slice(0, n) + '\u2026' : (s || '');

// ── Build graph data from memories ──
function buildGraphData(memories, mode) {
  const nodeMap = new Map();
  const linkMap = new Map();

  const addNode = (id, data) => {
    if (!nodeMap.has(id)) nodeMap.set(id, { id, ...data });
  };
  const addLink = (a, b, type, label = '') => {
    if (a === b) return;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (linkMap.has(key)) {
      linkMap.get(key).strength = Math.min(linkMap.get(key).strength + 0.15, 1);
    } else {
      linkMap.set(key, { source: a, target: b, type, label, strength: 0.4 });
    }
  };

  // Memory nodes (always added)
  memories.forEach(m => {
    addNode(m.memory_id, {
      kind: 'memory',
      concept: m.concept,
      feeling: m.feeling,
      content: m.content,
      media_type: m.media_type || 'text',
      tags: m.tags || [],
      ts: m.timestamp,
      color: feelingColor(m.feeling),
      radius: 9,
      label: trunc(m.concept, 18),
    });
  });

  if (mode === 'concept' || mode === 'all') {
    const byConcept = new Map();
    memories.forEach(m => {
      if (!byConcept.has(m.concept)) byConcept.set(m.concept, []);
      byConcept.get(m.concept).push(m.memory_id);
    });
    byConcept.forEach((ids, concept) => {
      if (ids.length < 2) return;
      const hubId = `__concept__${concept}`;
      addNode(hubId, { kind: 'concept', label: concept, color: '#4d96ff', radius: 18, concept });
      ids.forEach(id => addLink(id, hubId, 'concept', concept));
    });
  }

  if (mode === 'feeling' || mode === 'all') {
    const byFeeling = new Map();
    memories.forEach(m => {
      if (!byFeeling.has(m.feeling)) byFeeling.set(m.feeling, []);
      byFeeling.get(m.feeling).push(m.memory_id);
    });
    byFeeling.forEach((ids, feeling) => {
      if (ids.length < 2) return;
      const hubId = `__feeling__${feeling}`;
      addNode(hubId, { kind: 'feeling', label: feeling, color: feelingColor(feeling), radius: 16, feeling });
      ids.forEach(id => addLink(id, hubId, 'feeling', feeling));
    });
  }

  if (mode === 'tag' || mode === 'all') {
    const byTag = new Map();
    memories.forEach(m => {
      (m.tags || []).forEach(tag => {
        if (!byTag.has(tag)) byTag.set(tag, []);
        byTag.get(tag).push(m.memory_id);
      });
    });
    byTag.forEach((ids, tag) => {
      if (ids.length < 2) return;
      const hubId = `__tag__${tag}`;
      addNode(hubId, { kind: 'tag', label: tag, color: '#ffd93d', radius: 13, tag });
      ids.forEach(id => addLink(id, hubId, 'tag', tag));
    });
  }

  return { nodes: [...nodeMap.values()], links: [...linkMap.values()] };
}

// ── Legend Component ──
function GraphLegend({ mode, memories, t }) {
  const items = [];

  if (mode === 'feeling' || mode === 'all') {
    const feelings = [...new Set(memories.map(m => m.feeling))];
    feelings.forEach(f => {
      items.push(
        <span className="graph-legend-item" key={`f-${f}`}>
          <span className="graph-legend-dot" style={{ background: feelingColor(f) }} />
          {f}
        </span>
      );
    });
  }

  const kindLabels = {
    concept: ['#4d96ff', t('graph.legendConceptHub')],
    feeling: ['#ff6b9d', t('graph.legendFeelingHub')],
    tag: ['#ffd93d', t('graph.legendTagHub')],
  };

  if (mode === 'all') {
    ['concept', 'feeling', 'tag'].forEach(k => {
      const [col, lbl] = kindLabels[k];
      items.push(
        <span className="graph-legend-item" key={`k-${k}`}>
          <span className="graph-legend-dot" style={{ background: col }} />
          {lbl}
        </span>
      );
    });
  }

  if (!items.length) return null;
  return <div className="graph-legend">{items}</div>;
}

// ── Detail Panel ──
function GraphDetail({ node, memories, onClose, t }) {
  if (!node) return null;

  if (node.kind === 'memory') {
    const m = memories.find(mem => mem.memory_id === node.id);
    if (!m) return null;
    const mt = (m.media_type || 'text').toLowerCase();
    const isMedia = mt !== 'text';
    const contentPreview = isMedia
      ? `[${mt.toUpperCase()} file]`
      : (m.content || '').slice(0, 300);

    return (
      <div className="graph-detail">
        <div className="graph-detail-header">
          <span>{node.label}</span>
          <button className="graph-detail-close" onClick={onClose}>x</button>
        </div>
        <div className="graph-detail-body">
          <div className="graph-detail-chips">
            <span className="memory-feeling" style={{
              borderColor: feelingColor(m.feeling),
              color: feelingColor(m.feeling),
              background: feelingColor(m.feeling) + '15',
            }}>
              {m.feeling}
            </span>
            {mt !== 'text' && (
              <span className="memory-mediatype">{mt.toUpperCase()}</span>
            )}
          </div>
          <div className="graph-detail-content">{contentPreview}</div>
          {m.note && <div className="graph-detail-note">{m.note}</div>}
          {m.tags?.length > 0 && (
            <div className="memory-tags">
              {m.tags.map(tg => <span className="memory-tag" key={tg}>{tg}</span>)}
            </div>
          )}
          <div className="memory-id">{m.memory_id}</div>
        </div>
      </div>
    );
  }

  // Hub node
  const related = memories.filter(m => {
    if (node.kind === 'concept') return m.concept === node.concept;
    if (node.kind === 'feeling') return m.feeling === node.feeling;
    if (node.kind === 'tag') return (m.tags || []).includes(node.tag);
    return false;
  });

  return (
    <div className="graph-detail">
      <div className="graph-detail-header">
        <span>{node.label}</span>
        <button className="graph-detail-close" onClick={onClose}>x</button>
      </div>
      <div className="graph-detail-body">
        <div className="graph-detail-hub-count">{related.length} {t('graph.detailMemories')}</div>
        {related.map(m => (
          <div className="graph-detail-mem-item" key={m.memory_id}>
            <span className="graph-detail-mem-dot" style={{ background: feelingColor(m.feeling) }} />
            <span className="graph-detail-mem-text">
              {trunc(
                m.content?.startsWith('data:')
                  ? `[${(m.media_type || 'file').toUpperCase()}]`
                  : m.content,
                60
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function Graph() {
  const { recallAll, recallByFeeling, listConcepts } = useMemoryDB();
  const { t } = useI18n();
  const concepts = listConcepts();

  const [mode, setMode] = useState('concept');
  const [feelingFilter, setFeelingFilter] = useState('');
  const [conceptFilter, setConceptFilter] = useState('');
  const [maxNodes, setMaxNodes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [graphMemories, setGraphMemories] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const simRef = useRef(null);
  const zoomRef = useRef(null);
  const tooltipRef = useRef(null);

  // Render the D3 graph
  const renderGraph = (memories, graphMode) => {
    const svgEl = svgRef.current;
    const wrapEl = wrapRef.current;
    if (!svgEl || !wrapEl) return;

    // Clean up previous simulation
    if (simRef.current) { simRef.current.stop(); simRef.current = null; }
    d3.select(svgEl).selectAll('*').remove();

    const data = buildGraphData(memories, graphMode);
    if (!data.nodes.length) {
      setIsEmpty(true);
      return;
    }
    setIsEmpty(false);

    const rect = wrapEl.getBoundingClientRect();
    const W = rect.width > 0 ? rect.width : 900;
    const H = rect.height > 0 ? rect.height : 480;

    const svg = d3.select(svgEl)
      .attr('width', W)
      .attr('height', H)
      .attr('viewBox', `0 0 ${W} ${H}`)
      .style('width', '100%')
      .style('height', '100%');

    // Arrowhead markers
    const defs = svg.append('defs');
    ['concept', 'feeling', 'tag', 'all'].forEach(type => {
      const color = type === 'concept' ? '#4d96ff'
        : type === 'feeling' ? '#ff6b9d'
          : type === 'tag' ? '#ffd93d' : '#888';
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -4 10 8')
        .attr('refX', 20).attr('refY', 0)
        .attr('markerWidth', 6).attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-4L10,0L0,4')
        .attr('fill', color)
        .attr('opacity', 0.5);
    });

    // Zoom container
    const g = svg.append('g').attr('class', 'graph-g');
    const zoom = d3.zoom()
      .scaleExtent([0.15, 4])
      .on('zoom', (e) => g.attr('transform', e.transform));
    svg.call(zoom);
    zoomRef.current = zoom;

    // Force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links)
        .id(d => d.id)
        .distance(d => d.type === 'concept' ? 90 : d.type === 'feeling' ? 80 : 70)
        .strength(d => d.strength))
      .force('charge', d3.forceManyBody()
        .strength(d => d.kind === 'memory' ? -180 : -320))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collide', d3.forceCollide(d => d.radius + 8))
      .alphaDecay(0.025);
    simRef.current = simulation;

    // Link colors
    const linkColor = lt => lt === 'concept' ? '#4d96ff44'
      : lt === 'feeling' ? '#ff6b9d44'
        : lt === 'tag' ? '#ffd93d44' : '#88888844';

    // Links
    const link = g.append('g').attr('class', 'graph-links')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', d => linkColor(d.type))
      .attr('stroke-width', d => 1 + d.strength * 2)
      .attr('stroke-dasharray', d => d.type === 'tag' ? '4,3' : null);

    // Nodes
    const node = g.append('g').attr('class', 'graph-nodes')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('class', d => `graph-node graph-node-${d.kind}`)
      .call(d3.drag()
        .on('start', (e, d) => {
          if (!e.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => {
          if (!e.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

    // Circles
    node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color + (d.kind === 'memory' ? 'cc' : 'ee'))
      .attr('stroke', d => d.color)
      .attr('stroke-width', d => d.kind === 'memory' ? 1.5 : 2.5)
      .attr('class', 'graph-circle');

    // Hub icons
    node.filter(d => d.kind !== 'memory')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', d => d.kind === 'concept' ? 11 : 9)
      .attr('fill', '#fff')
      .attr('pointer-events', 'none')
      .text(d => d.kind === 'concept' ? '\u25C8' : d.kind === 'feeling' ? '\u25C9' : '\u2B21');

    // Labels
    node.append('text')
      .attr('class', 'graph-label')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.radius + 12)
      .attr('font-size', d => d.kind === 'memory' ? 9 : 10)
      .attr('fill', 'var(--muted)')
      .attr('pointer-events', 'none')
      .text(d => d.label || '');

    // Tooltip interactions
    const tt = tooltipRef.current;
    node.on('mouseover', (e, d) => {
      if (!tt) return;
      tt.style.display = '';
      let html = `<b>${d.label}</b>`;
      if (d.kind === 'memory') {
        const preview = d.content && d.content.startsWith('data:')
          ? `[${(d.media_type || 'text').toUpperCase()} file]`
          : trunc(d.content || '', 80);
        html += `<br><span style="color:${d.color}">${d.feeling}</span>`;
        html += `<br><span style="opacity:.6">${preview}</span>`;
        if (d.tags?.length) {
          html += `<br>${d.tags.map(tg => `<span class="graph-tt-tag">${tg}</span>`).join('')}`;
        }
      } else {
        html += ` <span style="opacity:.5">(${d.kind})</span>`;
      }
      tt.innerHTML = html;
    })
      .on('mousemove', (e) => {
        if (!tt || !wrapEl) return;
        const r = wrapEl.getBoundingClientRect();
        let x = e.clientX - r.left + 14;
        let y = e.clientY - r.top - 10;
        if (x + 200 > r.width) x -= 220;
        tt.style.left = x + 'px';
        tt.style.top = y + 'px';
      })
      .on('mouseout', () => { if (tt) tt.style.display = 'none'; })
      .on('click', (e, d) => {
        e.stopPropagation();
        setSelectedNode(d);
      });

    svg.on('click', () => setSelectedNode(null));

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  };

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simRef.current) simRef.current.stop();
    };
  }, []);

  const handleLoad = () => {
    setLoading(true);
    setSelectedNode(null);
    try {
      let memories;
      if (feelingFilter) {
        memories = recallByFeeling(feelingFilter, { limit: maxNodes });
      } else {
        memories = recallAll({ limit: maxNodes });
      }

      if (conceptFilter) {
        const cf = conceptFilter.toLowerCase();
        memories = memories.filter(m => m.concept.toLowerCase().includes(cf));
      }

      setGraphMemories(memories);

      if (!memories.length) {
        setIsEmpty(true);
        setLoading(false);
        return;
      }

      // Use requestAnimationFrame to wait for layout
      requestAnimationFrame(() => {
        renderGraph(memories, mode);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  };

  // Re-render when mode changes and we have data
  useEffect(() => {
    if (graphMemories.length) {
      requestAnimationFrame(() => renderGraph(graphMemories, mode));
    }
  }, [mode, graphMemories]);

  const MODES = [
    { key: 'concept', label: t('graph.modeConcept') },
    { key: 'feeling', label: t('graph.modeFeeling') },
    { key: 'tag', label: t('graph.modeTag') },
    { key: 'all', label: t('graph.modeAll') },
  ];

  return (
    <div>
      <SectionGuide title={t('graph.guideTitle')}>
        <p dangerouslySetInnerHTML={{ __html: t('graph.guideIntro') }} />
        <ol className="guide-steps">
          <li dangerouslySetInnerHTML={{ __html: t('graph.guideStep1') }} />
          <li>{t('graph.guideStep2')}</li>
          <li>{t('graph.guideStep3')}</li>
          <li>{t('graph.guideStep4')}</li>
        </ol>
        <div className="guide-note">
          {t('graph.guideNote')}
        </div>
      </SectionGuide>

      {/* Controls bar */}
      <div className="graph-controls">
        <div className="graph-filter-group">
          <span className="graph-filter-label">{t('graph.connectBy')}</span>
          {MODES.map(m => (
            <button
              key={m.key}
              className={`graph-mode-btn${mode === m.key ? ' active' : ''}`}
              onClick={() => setMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="graph-filter-group">
          <span className="graph-filter-label">{t('graph.filterFeeling')}</span>
          <select
            className="graph-select"
            value={feelingFilter}
            onChange={e => setFeelingFilter(e.target.value)}
          >
            <option value="">{t('graph.filterFeelingAll')}</option>
            {FEELINGS.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className="graph-filter-group">
          <span className="graph-filter-label">{t('graph.filterConcept')}</span>
          <input
            type="text"
            className="graph-input"
            placeholder={t('graph.filterConceptPlaceholder')}
            value={conceptFilter}
            onChange={e => setConceptFilter(e.target.value)}
            list="graph-concept-list"
          />
          <datalist id="graph-concept-list">
            {concepts.map(c => (
              <option key={c.concept} value={c.concept} />
            ))}
          </datalist>
        </div>
        <div className="graph-filter-group">
          <span className="graph-filter-label">{t('graph.maxNodes')}</span>
          <select
            className="graph-select"
            value={maxNodes}
            onChange={e => setMaxNodes(parseInt(e.target.value))}
          >
            <option value="30">30</option>
            <option value="60">60</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
        </div>
        <button className="btn-primary graph-btn-load" onClick={handleLoad} disabled={loading}>
          {loading
            ? <><span className="loading" /> {t('graph.btnLoading')}</>
            : <><span className="btn-icon">{'\u2B21'}</span> {t('graph.btnLoad')}</>
          }
        </button>
      </div>

      {/* Legend */}
      <GraphLegend mode={mode} memories={graphMemories} t={t} />

      {/* Canvas */}
      <div className="graph-wrap" ref={wrapRef}>
        {isEmpty && (
          <div className="graph-empty">
            <span className="graph-empty-icon">{'\u2B21'}</span>
            <span>
              {graphMemories.length === 0 && !loading
                ? t('graph.emptyPrompt')
                : t('graph.emptyNoMatch')}
            </span>
          </div>
        )}
        <svg
          ref={svgRef}
          style={{ display: isEmpty ? 'none' : 'block' }}
        />
        <div
          className="graph-tooltip"
          ref={tooltipRef}
          style={{ display: 'none' }}
        />
        <GraphDetail
          node={selectedNode}
          memories={graphMemories}
          onClose={() => setSelectedNode(null)}
          t={t}
        />
      </div>
    </div>
  );
}
